#!/usr/bin/env node
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadDailyUsageData, loadMonthlyUsageData } = require('ccusage/data-loader');
const { calculateTotals, createTotalsObject, getTotalTokens } = require('ccusage/calculate-cost');

const PORT = 8150;
const pkg = require('./package.json');
const OPEN_CMD = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';

// Format data to match CLI JSON output
const formatDailyData = (data) => data.map(d => ({
    date: d.date,
    inputTokens: d.inputTokens,
    outputTokens: d.outputTokens,
    cacheCreationTokens: d.cacheCreationTokens,
    cacheReadTokens: d.cacheReadTokens,
    totalTokens: getTotalTokens(d),
    totalCost: d.totalCost,
    modelsUsed: d.modelsUsed,
    modelBreakdowns: d.modelBreakdowns,
}));

const formatMonthlyData = (data) => data.map(d => ({
    month: d.month,
    inputTokens: d.inputTokens,
    outputTokens: d.outputTokens,
    cacheCreationTokens: d.cacheCreationTokens,
    cacheReadTokens: d.cacheReadTokens,
    totalTokens: getTotalTokens(d),
    totalCost: d.totalCost,
    modelsUsed: d.modelsUsed,
    modelBreakdowns: d.modelBreakdowns,
}));

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const url = new URL(req.url, `http://${req.headers.host}`);
    const force = url.searchParams.get('force') === 'true';

    if (url.pathname === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
        return;
    }

    // Cache Implementation
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const handleCachedRequest = async (key, loader, formatter, dataKey) => {
        if (!global.cache) global.cache = {};
        const cached = global.cache[key];
        const now = Date.now();

        if (!force && cached && (now - cached.timestamp < CACHE_DURATION)) {
            console.log(`Serving ${key} from cache (${Math.round((CACHE_DURATION - (now - cached.timestamp))/1000)}s left)`);
            res.writeHead(200, { 'Content-Type': 'application/json', 'X-Cache': 'HIT' });
            res.end(cached.data);
            return;
        }

        try {
            console.log(`Fetching ${key} data (Live)...`);
            const rawData = await loader();
            const totals = createTotalsObject(calculateTotals(rawData));
            const result = JSON.stringify({ [dataKey]: formatter(rawData), totals });
            global.cache[key] = { timestamp: now, data: result };
            res.writeHead(200, { 'Content-Type': 'application/json', 'X-Cache': 'MISS' });
            res.end(result);
        } catch (error) {
            console.error(`Error fetching ${key} data:`, error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: `Failed to fetch ${key} data` }));
        }
    };

    if (url.pathname === '/api/monthly') {
        await handleCachedRequest('monthly', loadMonthlyUsageData, formatMonthlyData, 'monthly');
        return;
    }

    if (url.pathname === '/api/daily') {
        await handleCachedRequest('daily', loadDailyUsageData, formatDailyData, 'daily');
        return;
    }

    if (url.pathname === '/api/version') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ version: pkg.version }));
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`\n🚀 ccusage-ui server running at http://localhost:${PORT}`);
    console.log('Fetching data and opening browser...\n');
    exec(`${OPEN_CMD} http://localhost:${PORT}`);
});
