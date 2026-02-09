/**
 * Debug script to test Airbnb scraping on Raspberry Pi
 * This will take screenshots and log what the scraper sees
 * 
 * Usage:
 * node debug-airbnb-scraper.js
 */

const { chromium } = require('playwright');

// Use the same URLs from your .env
const VILLA_ZEFIRO_URL = 'https://www.airbnb.it/rooms/1558634550299608683';
const VILLA_I2MARI_URL = 'https://www.airbnb.it/rooms/1561453392648145770';

async function debugAirbnbScraping(baseUrl, villaName) {
  console.log(`\n========== Testing ${villaName} ==========`);
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // Build URL with search params
  const url = new URL(baseUrl);
  url.searchParams.set('check_in', '2026-03-22');
  url.searchParams.set('check_out', '2026-03-28');
  url.searchParams.set('guests', '2');
  url.searchParams.set('currency', 'EUR');

  console.log('URL:', url.toString());
  console.log('Loading page...');

  try {
    await page.goto(url.toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    console.log('Page loaded, scrolling...');
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);

    // Take screenshot 1: Initial load
    const screenshotName1 = `debug-${villaName.replace(/\s/g, '-')}-1-initial.png`;
    await page.screenshot({ path: screenshotName1, fullPage: false });
    console.log(`Screenshot saved: ${screenshotName1}`);

    // Wait a bit more for lazy loading
    await page.waitForTimeout(2000);

    // Take screenshot 2: After wait
    const screenshotName2 = `debug-${villaName.replace(/\s/g, '-')}-2-after-wait.png`;
    await page.screenshot({ path: screenshotName2, fullPage: false });
    console.log(`Screenshot saved: ${screenshotName2}`);

    // Check for sidebar
    console.log('\n--- Checking for booking sidebar ---');
    const sidebarSelectors = [
      '[data-section-id="BOOK_IT_SIDEBAR"]',
      '[data-testid="book-it-default"]',
      '[data-plugin-in-point-id="BOOK_IT_SIDEBAR"]',
      '.c1yo0219',
    ];

    for (const selector of sidebarSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 2000 });
        if (element) {
          console.log(`✓ Found sidebar with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`✗ Sidebar not found with: ${selector}`);
      }
    }

    // Try to find price with all selectors
    console.log('\n--- Testing price selectors ---');
    const priceSelectors = [
      '[data-testid="book-it-default"] span',
      '._1y74zjx',
      '._tyxjp1',
      '._1k4xcdh',
      'span[aria-hidden="true"]',
    ];

    for (const selector of priceSelectors) {
      try {
        const elements = await page.$$(selector);
        console.log(`Selector "${selector}": Found ${elements.length} elements`);
        
        if (elements.length > 0) {
          // Get text from first 5 elements
          for (let i = 0; i < Math.min(5, elements.length); i++) {
            const text = await elements[i].textContent();
            if (text && text.trim()) {
              console.log(`  [${i}] "${text.trim()}"`);
            }
          }
        }
      } catch (e) {
        console.log(`Selector "${selector}": Error - ${e.message}`);
      }
    }

    // Full page scan for prices
    console.log('\n--- Full page scan for € symbols ---');
    const pricesFound = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      const pricePattern = /€\s*[\d,\.]+/g;
      const candidates = [];
      let node;
      
      while ((node = walker.nextNode())) {
        const text = node.textContent || '';
        const matches = text.match(pricePattern);
        
        if (matches && matches.length > 0) {
          const parent = node.parentElement;
          if (parent) {
            const style = window.getComputedStyle(parent);
            const isStrike = style.textDecorationLine === 'line-through' || 
                           style.textDecoration.includes('line-through');
            
            candidates.push({
              text: text.trim(),
              match: matches[0],
              isStrike: isStrike,
              tagName: parent.tagName,
              className: parent.className,
            });
          }
        }
      }
      
      return candidates;
    });

    console.log(`Found ${pricesFound.length} price candidates:`);
    pricesFound.forEach((p, i) => {
      console.log(`  [${i}] ${p.match} - Strike: ${p.isStrike} - Tag: ${p.tagName} - Class: ${p.className.substring(0, 50)}`);
    });

    // Get page HTML for inspection
    console.log('\n--- Saving page HTML ---');
    const html = await page.content();
    const fs = require('fs');
    const htmlFileName = `debug-${villaName.replace(/\s/g, '-')}-page.html`;
    fs.writeFileSync(htmlFileName, html);
    console.log(`HTML saved: ${htmlFileName}`);

    // Check if page shows any error or blocking message
    console.log('\n--- Checking for blocking messages ---');
    const bodyText = await page.evaluate(() => document.body.innerText);
    const blockingKeywords = ['robot', 'bot', 'captcha', 'blocked', 'verify', 'unusual traffic'];
    
    for (const keyword of blockingKeywords) {
      if (bodyText.toLowerCase().includes(keyword)) {
        console.log(`⚠️  Found keyword "${keyword}" in page - might be blocked!`);
      }
    }

  } catch (error) {
    console.error('Error during scraping:', error.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  console.log('Starting Airbnb scraping debug...');
  console.log('This will create screenshots and HTML files for inspection\n');

  // Test both villas
  await debugAirbnbScraping(VILLA_ZEFIRO_URL, 'Villa-Zefiro');
  await debugAirbnbScraping(VILLA_I2MARI_URL, 'Villa-i-2-Mari');

  console.log('\n========== Debug Complete ==========');
  console.log('Check the generated files:');
  console.log('  - debug-*.png (screenshots)');
  console.log('  - debug-*.html (page HTML)');
}

main().catch(console.error);
