import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { JobScraper, ScrapedPost } from './scraper.interface.js';

@Injectable()
export class LinkedInScraperService implements JobScraper {
  get sourceName(): string {
    return 'linkedin';
  }
  private readonly logger = new Logger(LinkedInScraperService.name);
  private readonly cookiesPath = path.join(process.cwd(), 'linkedin-session.json');

  async scrapeJobPosts(keywords: string[]): Promise<ScrapedPost[]> {
    const email = process.env.LINKEDIN_EMAIL;
    const password = process.env.LINKEDIN_PASSWORD;
    const liAt = process.env.LINKEDIN_LI_AT;
    const hasCookiesFile = fs.existsSync(this.cookiesPath);

    if (!liAt && !hasCookiesFile && (!email || !password)) {
      this.logger.error(
        'LinkedIn authentication missing! Provide LINKEDIN_LI_AT in .env, place linkedin-session.json, or set LINKEDIN_EMAIL and LINKEDIN_PASSWORD.',
      );
      return [];
    }

    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({
        headless: false,
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
        this.logger.warn('LinkedIn feed check redirected — continuing to search page directly...');
      } else {
        // Persist session only if authenticated session active
        const cookies = await context.cookies();
        if (cookies.length > 5) {
          fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
          this.logger.log(`Session saved with ${cookies.length} cookies`);
        }
      }

      const allPosts: ScrapedPost[] = [];

      for (const keyword of keywords) {
        this.logger.log(`Scraping keyword: "${keyword}"`);
        try {
          let posts: ScrapedPost[] = [];
          if (keyword.startsWith('https://www.linkedin.com/feed/update/')) {
            posts = await this.scrapeSinglePost(page, keyword);
          } else {
            posts = await this.scrapeKeyword(page, keyword);
          }
          this.logger.log(`  → ${posts.length} posts found`);
          allPosts.push(...posts);
          await this.sleep(randomBetween(3000, 6000));
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
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'en-US',
      timezoneId: 'Asia/Kolkata',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    let hasLoadedFile = false;
    if (fs.existsSync(this.cookiesPath)) {
      try {
        const cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf-8'));
        if (Array.isArray(cookies) && cookies.length > 5) {
          await context.addCookies(cookies);
          this.logger.log(`Loaded ${cookies.length} valid session cookies from linkedin-session.json`);
          hasLoadedFile = true;
        }
      } catch {
        this.logger.warn('Failed to load saved cookies — will log in fresh');
      }
    }

    if (!hasLoadedFile && process.env.LINKEDIN_LI_AT) {
      const liAtValue = process.env.LINKEDIN_LI_AT.trim();
      if (liAtValue) {
        await context.addCookies([
          {
            name: 'li_at',
            value: liAtValue,
            domain: '.linkedin.com',
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'Lax',
          },
        ]);
        this.logger.log('Loaded single LinkedIn li_at cookie from environment');
      }
    }

    return context;
  }

  private async ensureLoggedIn(page: Page, email?: string, password?: string): Promise<boolean> {
    try {
      try {
        await page.goto('https://www.linkedin.com/feed/', {
          waitUntil: 'domcontentloaded',
          timeout: 10_000,
        });
      } catch (err) {
        this.logger.warn(`Initial feed navigation warning: ${err instanceof Error ? err.message : err}`);
      }

      await this.sleep(2000);
      const url = page.url();
      this.logger.log(`Page URL after initial navigation: ${url}`);

      if (url.includes('/feed') || url.includes('/home') || url.includes('/search') || url.includes('/in/')) {
        this.logger.log('Session valid — authenticated feed page loaded');
        return true;
      }

      if (url.includes('/login') || url.includes('/authwall') || url.includes('/checkpoint') || url.includes('/signup')) {
        this.logger.warn('Session cookie redirected to auth page — will attempt search directly.');
        return false;
      }

      return true;
    } catch (err) {
      this.logger.error(`ensureLoggedIn failed: ${err instanceof Error ? err.message : err}`);
      return false;
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

  private async scrapeSinglePost(page: Page, url: string): Promise<ScrapedPost[]> {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25_000 });
      await this.sleep(3000);
      
      const post = await page.evaluate((postUrl) => {
        const item = document.querySelector('.feed-shared-update-v2, .core-rail > div:first-child') as HTMLElement;
        if (!item) return null;

        const nameEl = item.querySelector('.update-components-actor__name span[aria-hidden="true"], .feed-shared-actor__name span[aria-hidden="true"], .update-components-actor__name');
        let authorName = (nameEl as HTMLElement)?.innerText?.trim() || 'LinkedIn Member';
        authorName = authorName.replace(/View .*’s profile/i, '').replace(/•.*$/, '').replace(/\s+/g, ' ').trim();

        const authorLink = item.querySelector('a[href*="/in/"], .app-aware-link[href*="/in/"]') as HTMLAnchorElement | null;
        
        const contentEl = item.querySelector('.feed-shared-update-v2__description, .update-components-text, .break-words, span[dir="ltr"]');
        let content = (contentEl as HTMLElement)?.innerText?.trim() || '';
        content = content.replace(/^Feed post/i, '').replace(/•\s*\d+[mhdw]\s*•\s*(Follow|Connect|Join)/gi, '').trim();

        if (!content) return null;

        const likesText = (item.querySelector('[aria-label*="reaction"], .social-counts-reactions__count') as HTMLElement)?.innerText || '0';
        const commentsText = (item.querySelector('[aria-label*="comment"], .social-counts-comments') as HTMLElement)?.innerText || '0';
        const likes = parseInt(likesText.replace(/\D/g, '')) || 0;
        const comments = parseInt(commentsText.replace(/\D/g, '')) || 0;

        return {
          authorName,
          authorProfileUrl: authorLink?.href || '',
          content,
          postUrl,
          likes,
          comments,
        };
      }, url);

      if (post) {
        let sourcePostId = url.replace(/.*(?:activity|ugcPost)[:_]/, '').replace(/\D/g, '');
        if (!sourcePostId) {
          sourcePostId = crypto.createHash('md5').update(url).digest('hex');
        }
        
        return [{
          sourcePostId,
          ...post,
          postedAt: new Date()
        }];
      }
      return [];
    } catch (err) {
      this.logger.warn(`Failed to scrape single post: ${err}`);
      return [];
    }
  }

  private async scrapeKeyword(page: Page, keyword: string): Promise<ScrapedPost[]> {
    const results: ScrapedPost[] = [];

    // Search URLs for both Latest & Top Match categories (past 24h)
    const urls = [
      `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=FACETED_SEARCH&sortBy=%22date_posted%22&datePosted=%22past-24h%22`,
      `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=FACETED_SEARCH&sortBy=%22relevance%22&datePosted=%22past-24h%22`,
    ];

    for (const url of urls) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25_000 });
      } catch (err) {
        this.logger.warn(`Navigation warning for "${keyword}": ${err instanceof Error ? err.message : err}`);
      }

      // Wait for URL to settle on search page
      for (let i = 0; i < 6; i++) {
        await this.sleep(800);
        if (page.url().includes('/search/results/content/')) break;
      }

      await this.sleep(2000);

      // Scroll down to load search results
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight * 2.2);
          const showMoreBtn = document.querySelector(
            'button.scaffold-finite-scroll__load-button, button[aria-label*="See more"], button.reusable-search__result-container',
          ) as HTMLButtonElement | null;
          if (showMoreBtn) showMoreBtn.click();
        }).catch(() => {});
        await this.sleep(randomBetween(1000, 1800));
      }

      const categoryPosts = await page
        .evaluate(() => {
          const posts: any[] = [];
          const seenTexts = new Set<string>();

          const items = document.querySelectorAll(
            'div[id*="FeedType_FLAGSHIP_SEARCH"], div[data-component-type="LazyColumn"] > div > div, .search-results__list > li, .reusable-search__result-container, .feed-shared-update-v2, .entity-result',
          );

          items.forEach((item) => {
            try {
              const rawText = (item as HTMLElement).innerText?.trim() || '';
              if (rawText.length < 40) return;
              if (
                rawText.startsWith('Are these results helpful') ||
                rawText.includes('Your feedback helps us improve')
              ) {
                return;
              }

              // 1. Author Info (Name & Profile URL)
              const authorLink = item.querySelector(
                'a[href*="/in/"], .app-aware-link[href*="/in/"]',
              ) as HTMLAnchorElement | null;

              const nameEl = item.querySelector(
                '.update-components-actor__name span[aria-hidden="true"], .feed-shared-actor__name span[aria-hidden="true"], .entity-result__title-text a, .update-components-actor__name, .feed-shared-actor__name',
              );

              let authorName = (nameEl as HTMLElement)?.innerText?.trim() || authorLink?.innerText?.trim() || '';
              authorName = authorName
                .replace(/View .*’s profile/i, '')
                .replace(/•.*$/, '')
                .replace(/\s+/g, ' ')
                .trim();

              if (!authorName || authorName.length < 2) {
                authorName = 'LinkedIn Member';
              }

              // 2. Post Content (use innerText to preserve newlines)
              const contentEl = item.querySelector(
                '.feed-shared-update-v2__description, .update-components-text, .entity-result__content-summary, .break-words, span[dir="ltr"]',
              );
              let content = (contentEl as HTMLElement)?.innerText?.trim() || rawText;
              content = content
                .replace(/^Feed post/i, '')
                .replace(/•\s*\d+[mhdw]\s*•\s*(Follow|Connect|Join)/gi, '')
                .trim();

              const textKey = content.slice(0, 80);
              if (seenTexts.has(textKey)) return;
              seenTexts.add(textKey);

              // 3. Direct Post URL Extraction (Point directly to LinkedIn post update)
              let postUrl = '';
              const urnAttr =
                item.getAttribute('data-urn') ||
                item.getAttribute('data-activity-urn') ||
                item.getAttribute('data-id') ||
                item.querySelector('[data-urn]')?.getAttribute('data-urn') ||
                item.querySelector('[data-activity-urn]')?.getAttribute('data-activity-urn');

              if (urnAttr && (urnAttr.includes('activity') || urnAttr.includes('ugcPost'))) {
                const actId = urnAttr.replace(/.*(?:activity|ugcPost)[:_]/, '').replace(/\D/g, '');
                if (actId) {
                  postUrl = `https://www.linkedin.com/feed/update/urn:li:activity:${actId}/`;
                }
              }

              if (!postUrl) {
                const links = Array.from(item.querySelectorAll('a[href]')) as HTMLAnchorElement[];
                for (const l of links) {
                  const h = l.href || '';
                  if (
                    h.includes('/feed/update/') ||
                    h.includes('/posts/') ||
                    h.includes('urn:li:activity') ||
                    h.includes('ugcPost') ||
                    h.includes('highlightedUpdateUrn')
                  ) {
                    postUrl = h;
                    break;
                  }
                }
              }

              // Removed misleading fallback to author profile

              // Social counts
              const likesText =
                (item.querySelector('[aria-label*="reaction"], .social-counts-reactions__count') as HTMLElement)?.innerText || '0';
              const commentsText =
                (item.querySelector('[aria-label*="comment"], .social-counts-comments') as HTMLElement)?.innerText || '0';
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
              // skip malformed
            }
          });

          return posts;
        })
        .then((rawPosts) =>
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

      results.push(...categoryPosts);
    }

    return results;
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
