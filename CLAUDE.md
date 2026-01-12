# CLAUDE.md

Context information for Claude when working on this project.

## Project Overview

A UI project for visualizing Claude Code usage with a LoL-style tier system.

## Tier Card System

### Card Generation Script

```bash
# Generate all tier card HTML files
node scripts/generate-cards.js
```

Modify the `TIERS` array in [scripts/generate-cards.js](scripts/generate-cards.js) to regenerate all cards at once.

### Icon Extraction Script

```bash
# Extract individual icons from tier icon image (with transparent background)
node scripts/extract-tier-icons.js
```

- Input: Source image in `public/share/images/` folder (5x2 grid)
- Output: Individual PNG files in `public/share/icons/`
- Magenta (#FF00FF) background is removed (chroma key)
- Erosion algorithm removes masking artifacts

### Tier Order (Highest to Lowest)

1. **Challenger** - Top 0.001%, 1.5B+ tokens/month
2. **Grandmaster** - Top 0.01%, 1B+ tokens/month
3. **Master** - Top 0.1%, 500M+ tokens/month
4. **Diamond** - Top 1%, 300M+ tokens/month
5. **Emerald** - Top 5%, 100M+ tokens/month
6. **Platinum** - Top 10%, 50M+ tokens/month
7. **Gold** - Top 20%, 30M+ tokens/month
8. **Silver** - Top 40%, 10M+ tokens/month
9. **Bronze** - Top 60%, 5M+ tokens/month
10. **Iron** - Starter, <5M tokens/month

### Card Structure

- Size: 1200x630px (OG image standard)
- Right side: 280px big-icon with glow effect
- Left side: Tier name, description, token usage, ranking

### How to Replace Icons

Single 5x2 grid image with mixed chroma key backgrounds:
- **Green (#00FF00)**: Challenger, Grandmaster, Master, Gold, Silver, Bronze, Iron
- **Magenta (#FF00FF)**: Diamond, Emerald, Platinum (cyan/green-colored icons)

#### Gemini Prompt

```
Create a 5x2 grid of League of Legends style tier icons.
Image aspect ratio: 5:2 (e.g., 2500x1000px or similar)
Each cell should be square and contain one icon, clearly separated with no effects bleeding between cells.

IMPORTANT - Background colors per cell (for chroma key extraction):
- Green (#00FF00): Challenger, Grandmaster, Master, Gold, Silver, Bronze, Iron
- Magenta (#FF00FF): Diamond, Emerald, Platinum (these have cyan/green colors, so use magenta background)

CRITICAL - DO NOT use these colors in the icons themselves:
- Icons with green background: DO NOT use pure green (#00FF00) or similar bright greens in the icon
- Icons with magenta background: DO NOT use pure magenta (#FF00FF) or similar magentas in the icon
- These colors are reserved for background removal (chroma key)

Grid layout (left to right):
- Row 1: Challenger(green bg), Grandmaster(green bg), Master(green bg), Diamond(magenta bg), Emerald(magenta bg)
- Row 2: Platinum(magenta bg), Gold(green bg), Silver(green bg), Bronze(green bg), Iron(green bg)

Icon descriptions (G=green bg, M=magenta bg):
1. Challenger (G) - Golden winged crown emblem with red gems, most ornate
2. Grandmaster (G) - Red/orange flaming emblem with golden wings
3. Master (G) - Crimson red shield emblem with flame accents
4. Diamond (M) - Cyan/light blue crystalline shield emblem
5. Emerald (M) - Green gemstone shield emblem with facets
6. Platinum (M) - Silver-white metallic shield emblem with teal accents
7. Gold (G) - Golden shield emblem with warm yellow glow
8. Silver (G) - Silver metallic shield emblem with cool gray tones
9. Bronze (G) - Bronze/copper shield emblem with warm brown tones
10. Iron (G) - Dark gray iron shield emblem, simplest design

Icon style: metallic shields with gemstones, fantasy game aesthetic, detailed 3D rendering.
All icons should be shield/emblem shaped for visual consistency (like League of Legends rank badges).
```

#### Steps

1. Generate image using the prompt above
2. Save to `public/share/images/`
3. Update `inputPath` in `scripts/extract-tier-icons.js`
4. Run `node scripts/extract-tier-icons.js`
5. Run `node scripts/generate-cards.js` to regenerate cards
6. Run `node scripts/capture-card.js` to generate card images

## File Structure

```
public/share/
├── icons/           # Extracted tier icons (PNG, transparent background)
├── images/          # Source icon images
└── card-*.html      # OG card HTML for each tier

scripts/
├── extract-tier-icons.js  # Icon extraction script
└── generate-cards.js      # Card generation script
```
