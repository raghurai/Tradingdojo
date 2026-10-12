// Caches social mentions and the busiest options contracts as JSON next to the site.
// Social data is a fallback for the page. Options data is the page's only options source,
// because Cboe's feed cannot be called from a browser.
import fs from 'node:fs/promises';

const headers = { 'User-Agent': 'Mozilla/5.0 (trading-dojo snapshot)' };
const now = new Date().toISOString();

const res = await fetch('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1', { headers });
if (!res.ok) throw new Error('ApeWisdom ' + res.status);
const social = await res.json();
await fs.writeFile('data/social.json', JSON.stringify({ fetched_at: now, results: social.results.slice(0, 50) }));

// Underlyings: the most heavily traded option names plus whatever is trending on social.
const FIXED = ['SPY','QQQ','IWM','TSLA','NVDA','AAPL','AMD','AMZN','META','MSFT','PLTR','GOOGL','MU','INTC','AVGO','NFLX','BAC','COIN','MSTR','SOFI','HOOD','UBER','SMCI','BABA','F','XLF','TLT','GLD','SLV','SNDK'];
const trending = social.results.map(r => r.ticker).filter(t => /^[A-Z]{1,5}$/.test(t)).slice(0, 15);
const tickers = [...new Set([...FIXED, ...trending])];

const contracts = [];
let stamp = '', ok = 0;
for (const t of tickers) {
  try {
    const r = await fetch(`https://cdn.cboe.com/api/global/delayed_quotes/options/${t}.json`, { headers });
    if (!r.ok) continue;
    const c = await r.json();
    stamp = c.timestamp || stamp;
    const top = ((c.data && c.data.options) || [])
      .filter(o => o.volume > 0)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 40);
    for (const o of top) {
      contracts.push({ und: t, option: o.option, last: o.last_trade_price, chg: o.percent_change, vol: o.volume, oi: o.open_interest, iv: o.iv, delta: o.delta });
    }
    ok++;
  } catch (e) { /* skip tickers without listed options */ }
}
contracts.sort((a, b) => b.vol - a.vol);
await fs.rm('data/options', { recursive: true, force: true }); // old per-ticker files
await fs.writeFile('data/options.json', JSON.stringify({ fetched_at: now, timestamp: stamp, contracts: contracts.slice(0, 400) }));
console.log(`social: ${social.results.length} rows; options: ${ok}/${tickers.length} underlyings, ${Math.min(400, contracts.length)} contracts`);
