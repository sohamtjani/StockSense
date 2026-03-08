# StockSense

StockSense is a student-friendly financial dashboard that turns stock data into plain-language bullish/bearish signals.

## What is implemented

- Next.js + Tailwind frontend with a modern market-style UI
- Express backend with local JSON data storage
- Weighted bullish/bearish score engine (0-100)
- Student-readable signal cards:
  - Momentum
  - Investor Activity
  - News Sentiment
  - Volatility
  - Company Strength
  - Risk Level
- Search by company, ticker, or sector
- `Get Info` button for student-friendly AI insight summaries
- Price chart with 1W / 1M / 3M view
- Recent news panel with sentiment labels
- Open access dashboard (no login required)
- Local-device watchlist persistence
- In-memory caching:
  - Stock dashboard: 5 minutes
  - News: 30 minutes
- PostgreSQL migration schema included for next phase

## Project structure

- `frontend/` Next.js app
- `backend/` Express API
- `data/` local JSON data source
- `backend/sql/schema.sql` PostgreSQL schema for migration

## Local API routes

- `GET /stocks/search?q=...`
- `POST /stocks/insights` with `{ "query": "NVDA" }` or `{ "query": "AI Chips" }`
- `GET /stocks/:ticker?period=1w|1m|3m`

## Environment variables

Copy and set:

- Root: `.env.example` -> `.env`
- Backend: `backend/.env.example` -> `backend/.env` (optional, root `.env` is read)
- Frontend: `frontend/.env.local.example` -> `frontend/.env.local`

Required for local run:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

Optional for AI-generated insight text:

- `GEMINI_API_KEY=...`

If Gemini key is not set, the insights endpoint still works using a deterministic local fallback summary.

## Run

From repo root:

```bash
npm install
npm run server
```

In a second terminal:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scoring model

`score =`

- `momentum * 0.25`
- `volume * 0.15`
- `sentiment * 0.20`
- `earnings * 0.15`
- `volatility * 0.10`
- `market * 0.10`
- `valuation * 0.05`

Normalized to `0-100`:

- `0-40` Bearish
- `40-60` Neutral
- `60-80` Bullish
- `80-100` Very Bullish

## Notes

- Data is intentionally local JSON for portability and easy Docker migration next.
- Financial jargon is translated into plain-language explanations for students.
