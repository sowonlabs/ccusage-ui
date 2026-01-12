const sharp = require('sharp');
const path = require('path');

async function processEmerald() {
    const inputPath = path.join(__dirname, '../public/share/images/Gemini_Generated_Image_bqrx4pbqrx4pbqrx.png');
    const outputPath = path.join(__dirname, '../public/share/icons/emerald.png');

    // Ensure icons directory exists
    const fs = require('fs');
    const iconsDir = path.join(__dirname, '../public/share/icons');
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log('Original size:', metadata.width, 'x', metadata.height);

    // Process: trim whitespace, make white transparent, resize
    await image
        .trim() // Auto-crop whitespace
        .ensureAlpha() // Ensure alpha channel exists
        .raw()
        .toBuffer({ resolveWithObject: true })
        .then(async ({ data, info }) => {
            // Make white/near-white pixels transparent
            const threshold = 240; // Pixels with R,G,B all > threshold become transparent
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // If pixel is white-ish, make it transparent
                if (r > threshold && g > threshold && b > threshold) {
                    data[i + 3] = 0; // Set alpha to 0
                }
            }

            // Save with transparency
            await sharp(data, {
                raw: {
                    width: info.width,
                    height: info.height,
                    channels: 4
                }
            })
            .resize(120, 120, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(outputPath);

            console.log('Processed emerald icon saved to:', outputPath);
        });
}

processEmerald().catch(console.error);
