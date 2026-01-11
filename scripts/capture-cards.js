const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const TIERS = [
    'challenger',
    'grandmaster',
    'master',
    'diamond',
    'emerald',
    'platinum',
    'gold',
    'silver',
    'bronze',
    'iron'
];

async function captureCard(browser, tier) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });

    const htmlPath = path.join(__dirname, `../public/share/card-${tier}.html`);
    const outputPath = path.join(__dirname, `../public/share/images/${tier}.png`);

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outputPath, type: 'png' });

    await page.close();
    console.log(`✓ ${tier}.png`);
}

async function main() {
    // Ensure images directory exists
    const imagesDir = path.join(__dirname, '../public/share/images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    console.log('Capturing tier cards...\n');

    const browser = await puppeteer.launch();

    for (const tier of TIERS) {
        await captureCard(browser, tier);
    }

    await browser.close();

    console.log('\n✅ All cards captured!');
}

main().catch(console.error);
