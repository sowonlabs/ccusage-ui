const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TIERS = [
    { name: 'challenger', row: 0, col: 0 },
    { name: 'grandmaster', row: 0, col: 1 },
    { name: 'master', row: 0, col: 2 },
    { name: 'diamond', row: 0, col: 3 },
    { name: 'emerald', row: 0, col: 4 },
    { name: 'platinum', row: 1, col: 0 },
    { name: 'gold', row: 1, col: 1 },
    { name: 'silver', row: 1, col: 2 },
    { name: 'bronze', row: 1, col: 3 },
    { name: 'iron', row: 1, col: 4 },
];

async function extractIcons() {
    const inputPath = path.join(__dirname, '../public/share/images/Gemini_Generated_Image_nbha29nbha29nbha.jpeg');
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

        // Chroma key: pure magenta #FF00FF (255, 0, 255) with tolerance
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Pure magenta detection: R and B close to 255, G close to 0
            // Tolerance of ~30 for JPEG compression artifacts
            const isMagenta = r > 220 && g < 40 && b > 220;

            if (isMagenta) {
                data[i + 3] = 0;
            }
        }

        // Erosion: make pixels transparent if they're near transparent pixels
        const width = info.width;
        const height = info.height;
        const EROSION_PASSES = 3; // Number of erosion iterations

        for (let pass = 0; pass < EROSION_PASSES; pass++) {
            const alphaBuffer = Buffer.from(data); // Copy for reference each pass

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;

                    // Check if any neighbor is transparent
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

                    // Erode: if neighbor is transparent, make this pixel transparent too
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
