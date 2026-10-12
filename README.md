# Trading Dojo

A market terminal in Apple's design language. One static `index.html`, no build step.

- **Markets:** index strip, interactive chart, cap-weighted heatmap, sector bars, watchlist, movers.
- **Screener:** sortable, filterable table of the 100 largest US companies.
- **Stock detail:** click any ticker for its own page (`#NVDA` deep links work): price and chart, key statistics, options activity from the snapshot, social buzz, same-sector stocks, and news (live mode). P/E, dividend yield, analyst ratings and earnings are not shown because there is no free source wired in.
- **Trending:** stocks trending on social media (mentions counted by [ApeWisdom](https://apewisdom.io/), mainly Reddit) and the 40 highest-volume options contracts across the most heavily traded underlyings plus the social tickers (Cboe's public delayed quotes, about 15 minutes behind). Ranked by volume only, any expiry, so long-dated contracts count.

## Data modes

- **Simulated (default).** Index levels start from reported closes. Company prices and every tick are generated in the browser and labeled "Simulated ticks".
- **Live.** Click **Go live** and paste an [Alpaca](https://alpaca.markets) market-data key. Prices are polled once a second and charts use real bars.
  - Free plan: real-time **IEX** data only (one exchange, so last-trade price and volume can differ slightly from the consolidated tape).
  - Paid plan (SIP): real-time data from all US exchanges.
  - Indexes use SPY, QQQ, DIA and IWM. VIX, Treasury yields and sector YTD have no live source and are hidden in live mode.

Keys stay in your browser's `localStorage` and are sent only to Alpaca. Use a paper-trading key.

The Trending view is not simulated, but it is not real time either: social mentions update every few minutes and options quotes are delayed.

## Trending snapshot

Browsers cannot call Cboe directly, so the options list always reads `data/options.json`. The social list tries ApeWisdom first and falls back to `data/social.json`. The workflow in `.github/workflows/trending-snapshot.yml` refreshes them every 15 minutes (GitHub may delay scheduled runs). Snapshots older than 3 hours are ignored.

## Hosting

GitHub Pages, deploying from `main` at the repo root.

Not investment advice. Do not trade on it.
