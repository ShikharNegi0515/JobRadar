import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function testScrape() {
  console.log('Testing updated modern LinkedIn DOM selectors with proper navigation wait...');
  const cookiesPath = path.join(process.cwd(), 'linkedin-session.json');
  let cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));

  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });

  await context.addCookies(cookies);
  const page = await context.newPage();

  const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent('hiring react developer')}&sortBy=%22date_posted%22`;
  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err: any) {
    console.warn('Initial navigation note:', err.message);
  }

  // Wait until URL settles on /search/results/content/
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    if (page.url().includes('/search/results/content/')) {
      console.log(`Page settled on search URL at second ${i + 1}`);
      break;
    }
  }

  await page.waitForTimeout(3000);

  // Scroll down to load posts
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5)).catch(() => {});
    await page.waitForTimeout(2000);
  }

  const posts = await page.evaluate(() => {
    const items = document.querySelectorAll(
      'div[id*="FeedType_FLAGSHIP_SEARCH"], div[data-component-type="LazyColumn"] > div > div, .search-results__list > li, .reusable-search__result-container, .feed-shared-update-v2',
    );

    const results: any[] = [];
    const seenTexts = new Set<string>();

    items.forEach((item) => {
      try {
        const text = item.textContent?.trim() || '';
        if (text.length < 40) return;

        const authorLinkEl = item.querySelector('a[href*="/in/"]') as HTMLAnchorElement | null;
        const authorName = authorLinkEl?.textContent?.trim() || 'LinkedIn User';

        const postLinkEl = item.querySelector('a[href*="/posts/"], a[href*="activity"], a[href*="ugcPost"]') as HTMLAnchorElement | null;

        const content = text.replace(/^Feed post/i, '').replace(/•\s*\d+m\s*•\s*Follow/gi, '').trim();

        if (seenTexts.has(content.slice(0, 80))) return;
        seenTexts.add(content.slice(0, 80));

        results.push({
          authorName,
          authorProfileUrl: authorLinkEl?.href || '',
          postUrl: postLinkEl?.href || '',
          contentSnippet: content.slice(0, 120),
          contentLength: content.length,
        });
      } catch (err) {}
    });

    return results;
  });

  console.log(`🎉 Extracted ${posts.length} posts from LinkedIn!`);
  console.log(JSON.stringify(posts, null, 2));

  await browser.close();
}

testScrape().catch(console.error);
