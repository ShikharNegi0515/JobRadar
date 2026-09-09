import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { LinkedInScraperService } from './linkedin-scraper.service.js';
import { AIService } from '../ai/ai.service.js';
import { JobPost, JobStatus, WorkMode, EmploymentType } from '../jobs/entities/job-post.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';

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
];

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private isRunning = false;

  constructor(
    private readonly scraper: LinkedInScraperService,
    private readonly ai: AIService,
    @InjectRepository(JobPost)
    private readonly jobRepo: Repository<JobPost>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
  ) {}

  // Run every 30 minutes
  @Cron('0 */30 * * * *')
  async scheduledIngestion(): Promise<void> {
    this.logger.log('[CRON] Scheduled ingestion triggered');
    await this.runIngestion();
  }

  async runIngestion(): Promise<{ processed: number; saved: number; skipped: number }> {
    if (this.isRunning) {
      this.logger.warn('Ingestion already in progress — skipping');
      return { processed: 0, saved: 0, skipped: 0 };
    }

    this.isRunning = true;
    this.logger.log('🚀 Starting LinkedIn ingestion pipeline...');

    let saved = 0;
    let skipped = 0;
    let processed = 0;

    try {
      // Step 1: Scrape LinkedIn posts
      const posts = await this.scraper.scrapeJobPosts(SEARCH_KEYWORDS);
      this.logger.log(`📥 Scraped ${posts.length} raw posts from LinkedIn`);

      // Step 2: Process each post through AI
      for (const post of posts) {
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
          jobPost.source = 'linkedin';
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
    return { processed, saved, skipped };
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
