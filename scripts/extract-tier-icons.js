const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Grid layout: 5x2
// Row 1: Challenger, Grandmaster, Master, Diamond, Emerald
// Row 2: Platinum, Gold, Silver, Bronze, Iron
const TIERS = [
    { name: 'challenger', row: 0, col: 0, chromaKey: 'green' },
    { name: 'grandmaster', row: 0, col: 1, chromaKey: 'green' },
    { name: 'master', row: 0, col: 2, chromaKey: 'green' },
    { name: 'diamond', row: 0, col: 3, chromaKey: 'magenta' },
    { name: 'emerald', row: 0, col: 4, chromaKey: 'magenta' },
    { name: 'platinum', row: 1, col: 0, chromaKey: 'magenta' },
    { name: 'gold', row: 1, col: 1, chromaKey: 'green' },
    { name: 'silver', row: 1, col: 2, chromaKey: 'green' },
    { name: 'bronze', row: 1, col: 3, chromaKey: 'green' },
    { name: 'iron', row: 1, col: 4, chromaKey: 'green' },
];

// Chroma key detection functions
function isGreen(r, g, b) {
    // Convert RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const l = (max + min) / 2;

    let h = 0, s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rNorm) {
            h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        } else if (max === gNorm) {
            h = ((bNorm - rNorm) / d + 2) / 6;
        } else {
            h = ((rNorm - gNorm) / d + 4) / 6;
        }
    }

    const hDeg = h * 360;

    // Green hue ~120°, high saturation
    const isHslGreen = (hDeg > 80 && hDeg < 160) && s > 0.4 && l > 0.2 && l < 0.8;
    // RGB-based green detection
    const isRgbGreen = g > 150 && r < 150 && b < 150;

    return isHslGreen || isRgbGreen;
}

function isMagenta(r, g, b) {
    // Convert RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const l = (max + min) / 2;

    let h = 0, s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rNorm) {
            h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        } else if (max === gNorm) {
            h = ((bNorm - rNorm) / d + 2) / 6;
        } else {
            h = ((rNorm - gNorm) / d + 4) / 6;
        }
    }

    const hDeg = h * 360;

    // Magenta hue ~300°, high saturation
    const isHslMagenta = (hDeg > 280 && hDeg < 320) && s > 0.5 && l > 0.3 && l < 0.7;
    // RGB-based magenta detection
    const isRgbMagenta = r > 180 && g < 100 && b > 180;

    return isHslMagenta || isRgbMagenta;
}

async function extractIcons() {
    const inputPath = path.join(__dirname, '../public/share/images/Gemini_Generated_Image_fj59jyfj59jyfj59.jpeg');
    const iconsDir = path.join(__dirname, '../public/share/icons');

    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    const metadata = await sharp(inputPath).metadata();
    console.log('Image size:', metadata.width, 'x', metadata.height);

    const cellWidth = Math.floor(metadata.width / 5);
    const cellHeight = Math.floor(metadata.height / 2);
    console.log('Cell size:', cellWidth, 'x', cellHeight);

    for (const tier of TIERS) {
        const left = tier.col * cellWidth;
        const top = tier.row * cellHeight;
        const outputPath = path.join(iconsDir, `${tier.name}.png`);

        const { data, info } = await sharp(inputPath)
            .extract({ left, top, width: cellWidth, height: cellHeight })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Force transparent border (10 pixels from edges)
        const BORDER = 10;
        for (let y = 0; y < info.height; y++) {
            for (let x = 0; x < info.width; x++) {
                if (x < BORDER || x >= info.width - BORDER || y < BORDER || y >= info.height - BORDER) {
                    const idx = (y * info.width + x) * 4;
                    data[idx + 3] = 0;
                }
            }
        }

        // Chroma key removal based on tier's background color
        const chromaKeyFn = tier.chromaKey === 'magenta' ? isMagenta : isGreen;
        console.log(`Processing ${tier.name} with ${tier.chromaKey} chroma key...`);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (chromaKeyFn(r, g, b)) {
                data[i + 3] = 0;
            }
        }

        // Erosion: make pixels transparent if they're near transparent pixels
        const width = info.width;
        const height = info.height;
        const EROSION_PASSES = 3;

        for (let pass = 0; pass < EROSION_PASSES; pass++) {
            const alphaBuffer = Buffer.from(data);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;

                    let hasTransparentNeighbor = false;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const nIdx = (ny * width + nx) * 4;
                                if (alphaBuffer[nIdx + 3] === 0) {
                                    hasTransparentNeighbor = true;
                                    break;
                                }
                            }
                        }
                        if (hasTransparentNeighbor) break;
                    }

                    if (hasTransparentNeighbor) {
                        data[idx + 3] = 0;
                    }
                }
            }
        }

        await sharp(data, {
            raw: { width: info.width, height: info.height, channels: 4 }
        })
        .png()
        .toFile(outputPath);

        console.log(`✓ ${tier.name}.png`);
    }

    console.log('\n✅ Done!');
}

extractIcons().catch(console.error);
