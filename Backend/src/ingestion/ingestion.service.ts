import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { LinkedInScraperService } from './linkedin-scraper.service.js';
import { IndeedScraperService } from './indeed-scraper.service.js';
import { JobScraper, ScrapedPost } from './scraper.interface.js';
import { AIService } from '../ai/ai.service.js';
import { JobPost, JobStatus, WorkMode, EmploymentType } from '../jobs/entities/job-post.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';

// India location keywords — if a location is extracted and none of these match, post is skipped
const INDIA_LOCATION_TERMS = [
  'india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'new delhi', 'ncr', 'hyderabad',
  'pune', 'chennai', 'kolkata', 'noida', 'gurgaon', 'gurugram', 'ahmedabad', 'jaipur',
  'chandigarh', 'kochi', 'coimbatore', 'indore', 'bhopal', 'nagpur', 'surat', 'vadodara',
  'remote', 'work from home', 'wfh', 'pan india', 'across india', 'any location india',
];

function isIndiaLocation(location: string | null): boolean {
  if (!location) return true; // no location specified => include it
  const lower = location.toLowerCase();
  return INDIA_LOCATION_TERMS.some(term => lower.includes(term));
}

const SEARCH_KEYWORDS = [
  'we are hiring software developer',
  'hiring react developer',
  'hiring node.js developer',
  'hiring backend developer',
  'hiring frontend engineer',
  'looking for python developer',
  'software engineer opening india',
  'hiring fullstack developer',
  'urgent hiring developer',
  'job opening software engineer',
  'software developer',
];

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private isRunning = false;

  private scrapers: JobScraper[];

  constructor(
    private readonly linkedInScraper: LinkedInScraperService,
    private readonly indeedScraper: IndeedScraperService,
    private readonly ai: AIService,
    @InjectRepository(JobPost)
    private readonly jobRepo: Repository<JobPost>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
  ) {
    this.scrapers = [this.linkedInScraper, this.indeedScraper];
  }

  // Run every 30 minutes
  @Cron('0 */30 * * * *')
  async scheduledIngestion(): Promise<void> {
    this.logger.log('[CRON] Scheduled ingestion triggered');
    await this.runIngestion();
  }

  async runIngestion(
    customKeywords?: string[],
    resumeText?: string,
  ): Promise<{ processed: number; saved: number; skipped: number; resumeParsed?: boolean }> {
    if (this.isRunning) {
      this.logger.warn('Ingestion already in progress — skipping');
      return { processed: 0, saved: 0, skipped: 0 };
    }

    this.isRunning = true;
    this.logger.log('🚀 Starting LinkedIn ingestion pipeline...');

    let saved = 0;
    let skipped = 0;
    let processed = 0;
    let resumeParsed = false;

    try {
      // Determine search keywords
      let searchKeywords = customKeywords && customKeywords.length > 0 ? customKeywords : SEARCH_KEYWORDS;

      // If resumeText is provided, parse it and use resume-driven keywords
      if (resumeText && resumeText.trim().length > 50) {
        try {
          this.logger.log('📄 Parsing resume to extract personalized search keywords...');
          const parsed = await this.ai.parseResume(resumeText);
          if (parsed.search_keywords && parsed.search_keywords.length > 0) {
            // Always include "software developer" keyword in addition to resume-driven ones
            searchKeywords = [...parsed.search_keywords, 'software developer'];
            resumeParsed = true;
            this.logger.log(`✅ Resume parsed for: ${parsed.name || 'candidate'} — ${parsed.roles.join(', ')}`);
            this.logger.log(`🔍 Using ${searchKeywords.length} resume-driven keywords: ${searchKeywords.join(' | ')}`);
          }
        } catch (err) {
          this.logger.warn(`Resume parsing failed, falling back to default keywords: ${err}`);
        }
      }

      // Step 1: Scrape job posts from all sources
      const allPosts: ScrapedPost[] = [];
      for (const scraper of this.scrapers) {
        this.logger.log(`📥 Starting scrape for source: ${scraper.sourceName}`);
        try {
          const posts = await scraper.scrapeJobPosts(searchKeywords);
          // Ensure source is set
          posts.forEach(p => p.source = p.source || scraper.sourceName);
          allPosts.push(...posts);
          this.logger.log(`✅ Scraped ${posts.length} posts from ${scraper.sourceName}`);
        } catch (err) {
          this.logger.error(`Failed to scrape from ${scraper.sourceName}: ${err instanceof Error ? err.message : err}`);
        }
      }
      this.logger.log(`📥 Total scraped ${allPosts.length} raw posts`);

      // Step 2: Process each post through AI
      for (const post of allPosts) {
        processed++;
        try {
          // Check for duplicate by content hash
          const contentHash = crypto.createHash('md5').update(post.content).digest('hex');
          const existing = await this.jobRepo.findOne({ where: { content_hash: contentHash } });
          if (existing) {
            skipped++;
            continue;
          }

          // AI classification & extraction
          const extracted = await this.ai.extractJobFromPost(post.content, post.authorName);

          if (
            !extracted ||
            !extracted.is_job_post ||
            extracted.confidence < (parseFloat(process.env.JOB_CLASSIFICATION_THRESHOLD || '0.65'))
          ) {
            skipped++;
            continue;
          }

          // Filter out non-India locations
          if (!isIndiaLocation(extracted.location)) {
            this.logger.log(`⏩ Skipping non-India job: "${extracted.job_title}" (location: ${extracted.location})`);
            skipped++;
            continue;
          }

          // Filter out jobs requiring more than 2 years of experience
          if (extracted.experience_min !== null && extracted.experience_min > 2) {
            this.logger.log(`⏩ Skipping job due to experience requirements: "${extracted.job_title}" (min experience: ${extracted.experience_min} years)`);
            skipped++;
            continue;
          }

          // Resolve skills (find or create)
          const skills: Skill[] = [];
          for (const skillName of (extracted.skills || []).slice(0, 10)) {
            const normalized = skillName.toLowerCase().trim();
            if (!normalized) continue;

            let skill = await this.skillRepo.findOne({ where: { name: normalized } });
            if (!skill) {
              const newSkill = new Skill();
              newSkill.name = normalized;
              newSkill.category = 'technical';
              skill = await this.skillRepo.save(newSkill);
            }
            skills.push(skill);
          }

          // Persist the job post
          const jobPost = new JobPost();
          jobPost.source = post.source || 'linkedin';
          jobPost.source_post_id = post.sourcePostId;
          jobPost.source_url = post.postUrl || '';
          jobPost.author_name = post.authorName;
          jobPost.author_profile_url = post.authorProfileUrl || '';
          jobPost.raw_content = post.content;
          jobPost.job_title = extracted.job_title || 'Job Opening';
          jobPost.company_name = extracted.company_name || post.authorName;
          jobPost.description = extracted.description || post.content.slice(0, 600);
          jobPost.location = extracted.location || 'India';
          jobPost.work_mode = (extracted.work_mode as WorkMode) || WorkMode.NOT_SPECIFIED;
          jobPost.employment_type = (extracted.employment_type as EmploymentType) || EmploymentType.FULL_TIME;
          jobPost.salary_min = extracted.salary_min ?? null;
          jobPost.salary_max = extracted.salary_max ?? null;
          jobPost.salary_currency = extracted.salary_currency ?? null;
          jobPost.experience_min = extracted.experience_min ?? null;
          jobPost.experience_max = extracted.experience_max ?? null;
          jobPost.application_email = extracted.application_email ?? null;
          jobPost.application_url = extracted.application_url || post.postUrl || '';
          jobPost.posted_at = post.postedAt;
          jobPost.is_job_post = true;
          jobPost.classification_confidence = extracted.confidence;
          jobPost.content_hash = contentHash;
          jobPost.status = JobStatus.ACTIVE;
          jobPost.likes = post.likes;
          jobPost.comments = post.comments;
          jobPost.popularity_score = post.likes + post.comments * 2;
          jobPost.skills = skills;

          await this.jobRepo.save(jobPost);
          saved++;
          this.logger.log(`✅ Saved: "${jobPost.job_title}" at ${jobPost.company_name}`);

          // Rate-limit AI calls (1 req/sec)
          await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
          this.logger.error(`Failed to process post: ${err instanceof Error ? err.message : err}`);
          skipped++;
        }
      }
    } finally {
      this.isRunning = false;
    }

    this.logger.log(
      `📊 Ingestion done — processed: ${processed}, saved: ${saved}, skipped: ${skipped}`,
    );
    return { processed, saved, skipped, resumeParsed };
  }

  /**
   * Expire jobs older than 24 hours — called by cron
   */
  @Cron('0 0 * * * *') // Every hour
  async expireOldJobs(): Promise<void> {
    const result = await this.jobRepo
      .createQueryBuilder()
      .update(JobPost)
      .set({ status: JobStatus.EXPIRED })
      .where("status = 'ACTIVE' AND posted_at < NOW() - INTERVAL '24 hours'")
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log(`🕐 Expired ${result.affected} jobs older than 24 hours`);
    }
  }
}
