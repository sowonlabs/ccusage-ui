const fs = require('fs');
const path = require('path');

const TIERS = [
    {
        name: 'challenger',
        title: 'CHALLENGER',
        subtitle: 'World #1 Level AI User',
        tokens: '1.5B+',
        ranking: 'Top 0.001%',
        rankingLabel: 'Global Ranking',
        color: { r: 155, g: 89, b: 182 },
        glowColor: { r: 255, g: 215, b: 0 },
        bgGradient: ['#1a1a2e', '#16213e', '#0f3460'],
        titleGradient: ['#9b59b6', '#e056fd', '#f8b500'],
    },
    {
        name: 'grandmaster',
        title: 'GRANDMASTER',
        subtitle: 'Top 0.01% AI User',
        tokens: '1B+',
        ranking: 'Top 0.01%',
        rankingLabel: 'Global Ranking',
        color: { r: 255, g: 152, b: 0 },
        glowColor: { r: 255, g: 152, b: 0 },
        bgGradient: ['#1a1a2e', '#2d1b00', '#4a2c00'],
        titleGradient: ['#ff9800', '#ffb74d', '#fff176'],
    },
    {
        name: 'master',
        title: 'MASTER',
        subtitle: 'Top 0.1% AI User',
        tokens: '500M+',
        ranking: 'Top 0.1%',
        rankingLabel: 'Global Ranking',
        color: { r: 231, g: 76, b: 60 },
        glowColor: { r: 231, g: 76, b: 60 },
        bgGradient: ['#1a1a2e', '#2d0a0a', '#4a1010'],
        titleGradient: ['#e74c3c', '#ff6b6b', '#ffa502'],
    },
    {
        name: 'diamond',
        title: 'DIAMOND',
        subtitle: 'Top 1% AI User',
        tokens: '300M+',
        ranking: 'Top 1%',
        rankingLabel: 'Global Ranking',
        color: { r: 0, g: 188, b: 212 },
        glowColor: { r: 0, g: 188, b: 212 },
        bgGradient: ['#1a1a2e', '#0a2d3d', '#0d4a5a'],
        titleGradient: ['#00bcd4', '#4dd0e1', '#b2ebf2'],
    },
    {
        name: 'emerald',
        title: 'EMERALD',
        subtitle: 'Heavy AI User',
        tokens: '100M+',
        ranking: 'Top 5%',
        rankingLabel: 'Global Ranking',
        color: { r: 0, g: 229, b: 160 },
        glowColor: { r: 0, g: 229, b: 160 },
        bgGradient: ['#1a1a2e', '#0a2d1a', '#0d4a2a'],
        titleGradient: ['#00e5a0', '#50c878', '#98fb98'],
    },
    {
        name: 'platinum',
        title: 'PLATINUM',
        subtitle: 'Active AI User',
        tokens: '50M+',
        ranking: 'Top 10%',
        rankingLabel: 'Global Ranking',
        color: { r: 52, g: 199, b: 89 },
        glowColor: { r: 52, g: 199, b: 89 },
        bgGradient: ['#1a1a2e', '#1a2d1a', '#2a4a2a'],
        titleGradient: ['#34c759', '#7bed9f', '#a8e6cf'],
    },
    {
        name: 'gold',
        title: 'GOLD',
        subtitle: 'Regular AI User',
        tokens: '30M+',
        ranking: 'Top 20%',
        rankingLabel: 'Global Ranking',
        color: { r: 255, g: 215, b: 0 },
        glowColor: { r: 255, g: 215, b: 0 },
        bgGradient: ['#1a1a2e', '#2d2a0a', '#4a4510'],
        titleGradient: ['#ffd700', '#ffec8b', '#fff8dc'],
    },
    {
        name: 'silver',
        title: 'SILVER',
        subtitle: 'Growing AI User',
        tokens: '10M+',
        ranking: 'Top 40%',
        rankingLabel: 'Global Ranking',
        color: { r: 192, g: 192, b: 192 },
        glowColor: { r: 192, g: 192, b: 192 },
        bgGradient: ['#1a1a2e', '#2a2a3a', '#3a3a4a'],
        titleGradient: ['#c0c0c0', '#e8e8e8', '#ffffff'],
    },
    {
        name: 'bronze',
        title: 'BRONZE',
        subtitle: 'Casual AI User',
        tokens: '5M+',
        ranking: 'Top 60%',
        rankingLabel: 'Global Ranking',
        color: { r: 205, g: 127, b: 50 },
        glowColor: { r: 205, g: 127, b: 50 },
        bgGradient: ['#1a1a2e', '#2d1a0a', '#4a2a10'],
        titleGradient: ['#cd7f32', '#daa06d', '#f5deb3'],
    },
    {
        name: 'iron',
        title: 'IRON',
        subtitle: 'New AI User',
        tokens: '<5M',
        ranking: 'Starter',
        rankingLabel: 'Just Getting Started',
        color: { r: 100, g: 100, b: 100 },
        glowColor: { r: 100, g: 100, b: 100 },
        bgGradient: ['#1a1a2e', '#1a1a1a', '#2a2a2a'],
        titleGradient: ['#646464', '#909090', '#c0c0c0'],
    },
];

function rgba(color, alpha) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function generateCard(tier) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1200, height=630">
    <title>${tier.title} Card</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 1200px;
            height: 630px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, ${tier.bgGradient[0]} 0%, ${tier.bgGradient[1]} 50%, ${tier.bgGradient[2]} 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .card {
            width: 1100px;
            height: 530px;
            background: rgba(255, 255, 255, 0.03);
            border: 2px solid ${rgba(tier.color, 0.5)};
            border-radius: 32px;
            padding: 60px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
        }
        .card::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, ${rgba(tier.color, 0.15)} 0%, transparent 70%);
            pointer-events: none;
        }
        .big-icon {
            position: absolute;
            right: 60px;
            top: 45%;
            transform: translateY(-50%);
            width: 280px;
            height: 280px;
            filter: drop-shadow(0 0 20px ${rgba(tier.glowColor, 0.8)}) drop-shadow(0 0 40px ${rgba(tier.glowColor, 0.5)}) drop-shadow(0 0 60px ${rgba(tier.glowColor, 0.3)});
            opacity: 0.95;
        }
        .header { display: flex; align-items: center; gap: 24px; }
        .tier-info h1 {
            font-size: 64px;
            font-weight: 800;
            background: linear-gradient(135deg, ${tier.titleGradient[0]} 0%, ${tier.titleGradient[1]} 50%, ${tier.titleGradient[2]} 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -2px;
        }
        .tier-info .subtitle { font-size: 28px; color: rgba(255, 255, 255, 0.6); margin-top: 8px; font-weight: 500; }
        .stats { display: flex; gap: 60px; }
        .stat { display: flex; flex-direction: column; gap: 8px; }
        .stat-value { font-size: 56px; font-weight: 700; color: #fff; letter-spacing: -1px; }
        .stat-label { font-size: 20px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 2px; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; }
        .command { background: rgba(255, 255, 255, 0.1); padding: 16px 32px; border-radius: 12px; font-family: 'SF Mono', Monaco, monospace; font-size: 24px; color: #34c759; border: 1px solid rgba(52, 199, 89, 0.3); }
        .branding { text-align: right; color: rgba(255, 255, 255, 0.4); font-size: 20px; }
        .branding strong { color: rgba(255, 255, 255, 0.7); font-size: 24px; }
    </style>
</head>
<body>
    <!-- SVG filter to remove magenta fringing -->
    <svg style="position: absolute; width: 0; height: 0;">
        <defs>
            <filter id="remove-magenta" color-interpolation-filters="sRGB">
                <!-- Convert to separate channels and reduce magenta -->
                <feColorMatrix type="matrix" values="
                    1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    -0.5 1 -0.5 1 0
                "/>
            </filter>
        </defs>
    </svg>
    <div class="card">
        <img class="big-icon" src="./icons/${tier.name}.png" alt="">
        <div class="header">
            <div class="tier-info">
                <h1>${tier.title}</h1>
                <div class="subtitle">${tier.subtitle}</div>
            </div>
        </div>
        <div class="stats">
            <div class="stat">
                <div class="stat-value">${tier.tokens}</div>
                <div class="stat-label">Tokens / Month</div>
            </div>
            <div class="stat">
                <div class="stat-value">${tier.ranking}</div>
                <div class="stat-label">${tier.rankingLabel}</div>
            </div>
        </div>
        <div class="footer">
            <div class="command">npx ccusage-ui</div>
            <div class="branding"><strong>Claude Code Usage</strong><br>sowonlabs.com</div>
        </div>
    </div>
</body>
</html>
`;
}

function main() {
    const outputDir = path.join(__dirname, '../public/share');

    for (const tier of TIERS) {
        const html = generateCard(tier);
        const outputPath = path.join(outputDir, `card-${tier.name}.html`);
        fs.writeFileSync(outputPath, html);
        console.log(`Generated: card-${tier.name}.html`);
    }

    console.log('\nDone!');
}

main();
