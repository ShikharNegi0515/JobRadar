import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function loginAndSaveSession() {
  console.log('🚀 Launching Chrome browser for LinkedIn login...');
  console.log('👉 Please sign in to LinkedIn (using Google OAuth or Email/Password) in the browser window.');

  const cookiesPath = path.join(process.cwd(), 'linkedin-session.json');

  const browser = await chromium.launch({
    headless: false, // Open visible browser window so user can log in
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  await page.goto('https://www.linkedin.com/login');

  console.log('⏳ Waiting for you to complete login... (up to 3 minutes)');

  // Poll until user lands on /feed, /home, or search page
  let loggedIn = false;
  for (let i = 0; i < 180; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const url = page.url();
    if (url.includes('/feed') || url.includes('/home') || url.includes('/search') || url.includes('/in/')) {
      loggedIn = true;
      break;
    }
  }

  if (loggedIn) {
    console.log('✅ Login detected!');
    await new Promise((r) => setTimeout(r, 3000)); // wait for full cookie set
    const cookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log(`🎉 Saved ${cookies.length} session cookies to ${cookiesPath}`);
  } else {
    console.log('❌ Login timed out after 3 minutes.');
  }

  await browser.close();
}

loginAndSaveSession().catch(console.error);
