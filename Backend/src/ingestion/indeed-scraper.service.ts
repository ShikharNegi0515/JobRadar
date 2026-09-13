import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { JobScraper, ScrapedPost } from './scraper.interface.js';

@Injectable()
export class IndeedScraperService implements JobScraper {
  private readonly logger = new Logger(IndeedScraperService.name);

  get sourceName(): string {
    return 'remotive'; // using remotive for reliable "other platform" scraping
  }

  async scrapeJobPosts(keywords: string[]): Promise<ScrapedPost[]> {
    this.logger.log(`Starting Remotive API fetch for ${keywords.length} keywords`);
    
    const allPosts: ScrapedPost[] = [];

    for (const keyword of keywords) {
      this.logger.log(`Fetching Remotive for keyword: "${keyword}"`);
      try {
        const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}&limit=15`);
        if (!res.ok) continue;
        
        const data = await res.json();
        const jobs = data.jobs || [];
        
        this.logger.log(`  → ${jobs.length} posts found on Remotive`);
        
        const mappedPosts = jobs.map((p: any) => {
          const sourcePostId = p.id.toString();
          
          // clean html from description
          const content = (p.description || '').replace(/<[^>]*>?/gm, '').trim().slice(0, 800);
          
          return {
            sourcePostId,
            authorName: p.company_name,
            authorProfileUrl: '',
            content: `${p.title} at ${p.company_name}\n${content}`,
            postUrl: p.url,
            likes: 0,
            comments: 0,
            postedAt: p.publication_date ? new Date(p.publication_date) : new Date(),
            source: 'remotive',
          };
        });
        
        allPosts.push(...mappedPosts);
      } catch (err) {
        this.logger.error(`Error fetching Remotive "${keyword}": ${err instanceof Error ? err.message : err}`);
      }
    }

    return this.deduplicate(allPosts);
  }

  private deduplicate(posts: ScrapedPost[]): ScrapedPost[] {
    const seen = new Set<string>();
    return posts.filter((p) => {
      if (seen.has(p.sourcePostId)) return false;
      seen.add(p.sourcePostId);
      return true;
    });
  }
}
