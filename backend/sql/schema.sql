-- PostgreSQL schema for future migration

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY,
  ticker TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  sector TEXT,
  market_cap BIGINT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_metrics (
  id UUID PRIMARY KEY,
  stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
  price NUMERIC(12,2),
  volume BIGINT,
  volatility NUMERIC(8,4),
  momentum NUMERIC(8,4),
  pe_ratio NUMERIC(8,2),
  earnings_growth NUMERIC(8,4),
  market_trend NUMERIC(8,4),
  news_sentiment NUMERIC(8,4),
  bullish_score NUMERIC(5,2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY,
  stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  sentiment TEXT,
  published_at TIMESTAMPTZ NOT NULL
);
