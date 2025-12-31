const { chromium } = require('playwright');

async function run() {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Register
  const email = `ui-check+${Date.now()}@example.com`;
  console.log('Registering user', email);
  await page.goto(`${base}/register`);
  await page.fill('input[placeholder="Name"]', 'UI Test');
  await page.fill('input[placeholder="Email"]', email);
  await page.fill('input[placeholder="Password"]', 'Pass1234');
  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('/api/auth/register') && resp.status() === 200),
    page.click('button:has-text("Register")'),
  ]).catch(() => {});

  // Check localStorage token
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token in localStorage:', token ? token.substring(0, 24) + '...' : 'none');

  // Go to products page and add first product to cart
  await page.goto(`${base}/products`);
  // click first Add to Cart button if present
  const addBtn = await page.$('button:has-text("Add to cart")');
  if (addBtn) {
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/cart') && resp.status() < 500),
      addBtn.click(),
    ]).catch(() => {});
    console.log('Clicked Add to cart');
  } else {
    console.log('No Add to cart button found on Products page');
  }

  // Open cart page and capture contents
  await page.goto(`${base}/cart`);
  const cartHtml = await page.content();
  const cartToken = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Cart page loaded, token still present:', !!cartToken);
  // Try to read cart items text
  const items = await page.$$eval('ul li', (els) => els.map(e => e.innerText));
  console.log('Cart items:', items.length ? items : 'none');

  await browser.close();
}

run().catch((err) => { console.error(err); process.exit(1); });
