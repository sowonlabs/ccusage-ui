const puppeteer = require('puppeteer');
const path = require('path');

const TIERS = [
    'challenger', 'grandmaster', 'master', 'diamond', 'emerald',
    'platinum', 'gold', 'silver', 'bronze', 'iron'
];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });

    for (const tier of TIERS) {
        const filePath = path.resolve(__dirname, `../public/share/card-${tier}.html`);
        const outputPath = path.resolve(__dirname, `../public/share/images/card-${tier}.png`);

        await page.goto('file://' + filePath);
        await page.screenshot({ path: outputPath });
        console.log(`✓ card-${tier}.png`);
    }

    await browser.close();
    console.log('\n✅ Done!');
})();
