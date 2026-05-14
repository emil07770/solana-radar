# ⚡ SolanaRadar

Real-time Solana token intelligence dashboard powered by the **Birdeye Data API**.

Built for the [Birdeye Data BIP Sprint 4](https://superteam.fun/earn/listing/birdeye-data-4-week-bip-competition-sprint-4) competition.

## Features

- **🔥 Trending Tokens** — top 20 trending Solana tokens with price, 24h change, volume, and market cap
- **🆕 New Listings** — freshly listed tokens with liquidity and age
- **⟳ Auto-refresh** — data updates every 30 seconds automatically
- **📡 API call counter** — tracks total Birdeye API calls made

## Birdeye API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /defi/token_trending` | Trending tokens ranked by activity |
| `GET /v2/tokens/new_listing` | Newly listed tokens on Solana DEXes |
| `GET /defi/token_security` | Safety/risk scoring for tokens |
| `GET /defi/token_overview` | Full token metadata and stats |
| `GET /defi/price` | Real-time token price |

## Setup

```bash
git clone https://github.com/emil07770/solana-radar
cd solana-radar
npm install

# Add your API key
cp .env.example .env
# Edit .env and set VITE_BIRDEYE_API_KEY=your_key

npm run dev
```

Get your free API key at [bds.birdeye.so](https://bds.birdeye.so)

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/emil07770/solana-radar)

## Tech Stack

- React 18 + TypeScript
- Vite
- Birdeye Data REST API

## License

MIT
