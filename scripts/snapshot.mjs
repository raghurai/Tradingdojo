// Caches social mentions and options chains as JSON next to the site.
// The page uses these files only when it cannot reach the sources directly.
import fs from 'node:fs/promises';

const headers = { 'User-Agent': 'Mozilla/5.0 (trading-dojo snapshot)' };
const now = new Date().toISOString();

const res = await fetch('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1', { headers });
if (!res.ok) throw new Error('ApeWisdom ' + res.status);
const social = await res.json();

await fs.rm('data/options', { recursive: true, force: true });
await fs.mkdir('data/options', { recursive: true });
await fs.writeFile('data/social.json', JSON.stringify({ fetched_at: now, results: social.results.slice(0, 50) }));

const tickers = social.results.map(r => r.ticker).filter(t => /^[A-Z]{1,5}$/.test(t)).slice(0, 14);
let ok = 0;
for (const t of tickers) {
  if (ok >= 8) break;
  try {
    const r = await fetch(`https://cdn.cboe.com/api/global/delayed_quotes/options/${t}.json`, { headers });
    if (!r.ok) continue;
    const c = await r.json();
    const options = ((c.data && c.data.options) || [])
      .filter(o => o.volume > 0)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 80);
    await fs.writeFile(`data/options/${t}.json`, JSON.stringify({ fetched_at: now, timestamp: c.timestamp, data: { options } }));
    ok++;
  } catch (e) { /* skip tickers without listed options */ }
}
console.log(`social: ${social.results.length} rows, options: ${ok} tickers`);
