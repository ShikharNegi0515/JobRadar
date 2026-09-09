import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ScrapedPost {
  sourcePostId: string;
  authorName: string;
  authorProfileUrl: string;
  content: string;
  postUrl: string;
  likes: number;
  comments: number;
  postedAt: Date;
}

@Injectable()
export class LinkedInScraperService {
  private readonly logger = new Logger(LinkedInScraperService.name);
  private readonly cookiesPath = path.join(process.cwd(), 'linkedin-session.json');

  async scrapeJobPosts(keywords: string[]): Promise<ScrapedPost[]> {
    const email = process.env.LINKEDIN_EMAIL;
    const password = process.env.LINKEDIN_PASSWORD;

    if (!email || !password) {
      this.logger.error('LINKEDIN_EMAIL and LINKEDIN_PASSWORD must be set in .env');
      return [];
    }

    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--window-size=1280,800',
        ],
      });

      const context = await this.buildContext(browser);
      const page = await context.newPage();

      // Remove webdriver flag
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });

      const loggedIn = await this.ensureLoggedIn(page, email, password);
      if (!loggedIn) {
        this.logger.error('LinkedIn login failed — check credentials');
        return [];
      }

      // Persist session
      const cookies = await context.cookies();
      fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
      this.logger.log(`Session saved with ${cookies.length} cookies`);

      const allPosts: ScrapedPost[] = [];

      for (const keyword of keywords) {
        this.logger.log(`Scraping keyword: "${keyword}"`);
        try {
          const posts = await this.scrapeKeyword(page, keyword);
          this.logger.log(`  → ${posts.length} posts found`);
          allPosts.push(...posts);
          await this.sleep(randomBetween(4000, 8000));
        } catch (err) {
          this.logger.error(`Error scraping "${keyword}": ${err instanceof Error ? err.message : err}`);
        }
      }

      return this.deduplicate(allPosts);
    } catch (err) {
      this.logger.error(`Scraper failed: ${err instanceof Error ? err.message : err}`);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }

  private async buildContext(browser: Browser): Promise<BrowserContext> {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'en-US',
      timezoneId: 'Asia/Kolkata',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (fs.existsSync(this.cookiesPath)) {
      try {
        const cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf-8'));
        await context.addCookies(cookies);
        this.logger.log('Loaded existing LinkedIn session cookies');
      } catch {
        this.logger.warn('Failed to load saved cookies — will log in fresh');
      }
    }

    return context;
  }

  private async ensureLoggedIn(page: Page, email: string, password: string): Promise<boolean> {
    try {
      await page.goto('https://www.linkedin.com/feed/', {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });

      await this.sleep(2000);

      // Check if already authenticated
      const feedExists = await page.$('.scaffold-layout, [data-test-id="nav-top"]');
      if (feedExists) {
        this.logger.log('Session is valid — already logged in');
        return true;
      }

      this.logger.log('Session expired or missing — logging in...');
      return await this.login(page, email, password);
    } catch {
      return await this.login(page, email, password);
    }
  }

  private async login(page: Page, email: string, password: string): Promise<boolean> {
    try {
      await page.goto('https://www.linkedin.com/login', {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
      await this.sleep(1500);

      await page.fill('#username', email);
      await this.sleep(randomBetween(400, 900));

      await page.fill('#password', password);
      await this.sleep(randomBetween(400, 900));

      await page.click('[data-litms-control-urn="login-submit"]');

      // Wait for redirect
      await page.waitForURL(/linkedin\.com\/(feed|checkpoint|home)/, { timeout: 20_000 });
      await this.sleep(2000);

      const url = page.url();
      if (url.includes('/checkpoint')) {
        this.logger.warn('LinkedIn requires 2FA/verification — check your email or phone');
        return false;
      }

      this.logger.log('Login successful');
      return true;
    } catch (err) {
      this.logger.error(`Login error: ${err instanceof Error ? err.message : err}`);
      return false;
    }
  }

  private async scrapeKeyword(page: Page, keyword: string): Promise<ScrapedPost[]> {
    // LinkedIn search URL for posts from the last 24 hours
    const url =
      `https://www.linkedin.com/search/results/content/` +
      `?keywords=${encodeURIComponent(keyword)}` +
      `&datePosted=%22past-24h%22` +
      `&origin=FACETED_SEARCH` +
      `&sortBy=%22date_posted%22`;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await this.sleep(3000);

    // Scroll to load more results
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await this.sleep(randomBetween(1500, 2500));
    }

    return page.evaluate(() => {
      const posts: any[] = [];

      // Target search result items
      const items = document.querySelectorAll(
        '.search-results__list > li, .reusable-search__result-container',
      );

      items.forEach((item) => {
        try {
          // Author info
          const authorLink = item.querySelector(
            'a[href*="/in/"], .app-aware-link[href*="/in/"]',
          ) as HTMLAnchorElement | null;
          const authorName =
            item.querySelector(
              '.entity-result__title-text, .update-components-actor__name, .feed-shared-actor__name',
            )?.textContent?.trim() ||
            authorLink?.textContent?.trim() ||
            'Unknown';

          // Post content
          const contentEl = item.querySelector(
            '.feed-shared-update-v2__description, .update-components-text, .entity-result__content-summary',
          );
          const content = contentEl?.textContent?.trim() || '';

          // Post URL
          const postLinkEl = item.querySelector(
            'a[href*="activity"], a[href*="ugcPost"], a[href*="feed/update"]',
          ) as HTMLAnchorElement | null;
          const postUrl = postLinkEl?.href || '';

          if (content.length < 50) return;

          // Social counts
          const likesText =
            item.querySelector('[aria-label*="reaction"], .social-counts-reactions__count')?.textContent || '0';
          const commentsText =
            item.querySelector('[aria-label*="comment"], .social-counts-comments')?.textContent || '0';
          const likes = parseInt(likesText.replace(/\D/g, '')) || 0;
          const comments = parseInt(commentsText.replace(/\D/g, '')) || 0;

          posts.push({
            authorName,
            authorProfileUrl: authorLink?.href || '',
            content,
            postUrl,
            likes,
            comments,
          });
        } catch {
          // skip malformed items
        }
      });

      return posts;
    }).then((rawPosts) =>
      rawPosts.map((p) => ({
        sourcePostId: crypto
          .createHash('md5')
          .update(`${p.postUrl || p.content.slice(0, 80)}`)
          .digest('hex'),
        authorName: p.authorName,
        authorProfileUrl: p.authorProfileUrl,
        content: p.content,
        postUrl: p.postUrl,
        likes: p.likes,
        comments: p.comments,
        postedAt: new Date(),
      })),
    );
  }

  private deduplicate(posts: ScrapedPost[]): ScrapedPost[] {
    const seen = new Set<string>();
    return posts.filter((p) => {
      if (seen.has(p.sourcePostId)) return false;
      seen.add(p.sourcePostId);
      return true;
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
