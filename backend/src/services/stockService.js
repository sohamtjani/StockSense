import { newsCache, stockCache } from "../cache.js";
import {
  getDailySeries,
  getGlobalQuote,
  getNewsSentiment,
  getOverview,
  searchSymbols
} from "./alphaVantageService.js";
import { sentimentToNumeric } from "./sentiment.js";
import {
  computeBullishScore,
  computeEarningsSignal,
  computeMarketSignal,
  computeMomentum,
  computeValuationSignal,
  computeVolatilitySignal,
  computeVolumeSignal,
  explainSignals,
  scoreLabel
} from "./scoring.js";

function periodToDays(period) {
  if (period === "1w") return 7;
  if (period === "3m") return 90;
  return 30;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function avgSentiment(newsItems) {
  if (!newsItems.length) return 0.5;
  const total = newsItems.reduce((sum, n) => sum + sentimentToNumeric(n.sentiment), 0);
  return total / newsItems.length;
}

function computeMarketTrend(prices) {
  if (!prices.length) return 0;
  const latest = prices[prices.length - 1].close;
  const window = prices.slice(-50);
  const avg = window.reduce((sum, p) => sum + p.close, 0) / window.length;
  if (!avg) return 0;
  return clamp((latest - avg) / avg, -0.2, 0.2);
}

function buildMetrics({ prices, newsItems, earningsGrowth, peRatio }) {
  const momentum = computeMomentum(prices);
  const volume = computeVolumeSignal(prices);
  const volatility = computeVolatilitySignal(prices);
  const earnings = computeEarningsSignal(earningsGrowth || 0);
  const marketTrend = computeMarketTrend(prices);
  const market = computeMarketSignal(marketTrend);
  const valuation = computeValuationSignal(peRatio || 0);
  const sentiment = avgSentiment(newsItems);

  return {
    momentum,
    volume,
    sentiment,
    earnings,
    volatility,
    market,
    valuation,
    marketTrend
  };
}

export async function resolveTickerInput(input) {
  const value = String(input || "").trim();
  if (!value) return null;

  const tickerRegex = /^[A-Za-z][A-Za-z0-9.\-]{0,11}$/;
  if (tickerRegex.test(value)) return value.toUpperCase();

  const matches = await searchSymbols(value);
  if (!matches.length) return null;
  return matches[0].ticker;
}

function quickScoreFromChange(changePercent) {
  return Math.round(clamp(50 + changePercent * 2.5, 0, 100));
}

export async function searchStocks(query = "") {
  const q = String(query || "").trim();
  if (!q) return [];

  const tickerRegex = /^[A-Za-z][A-Za-z0-9.\-]{0,11}$/;
  if (tickerRegex.test(q)) {
    const ticker = q.toUpperCase();
    let price = 0;
    let changePercent = 0;
    let companyName = ticker;
    try {
      const quote = await getGlobalQuote(ticker);
      price = quote.price || 0;
      changePercent = quote.changePercent || 0;
    } catch {
      // Keep fallback row so typed tickers are always selectable.
    }

    try {
      const matches = await searchSymbols(ticker);
      companyName = matches.find((m) => m.ticker === ticker)?.companyName || companyName;
    } catch {
      // Non-fatal, still return ticker row.
    }

    const score = quickScoreFromChange(changePercent);
    return [
      {
        ticker,
        companyName,
        sector: "Unknown",
        price,
        bullishScore: score,
        status: scoreLabel(score)
      }
    ];
  }

  let matches = [];
  try {
    matches = await searchSymbols(q);
  } catch {
    return [];
  }
  const top = matches.slice(0, 3);

  const results = await Promise.all(
    top.map(async (item) => {
      try {
        const quote = await getGlobalQuote(item.ticker);

        const score = quickScoreFromChange(quote.changePercent);

        return {
          ticker: item.ticker,
          companyName: item.companyName,
          sector: "Unknown",
          price: quote.price || 0,
          bullishScore: score,
          status: scoreLabel(score)
        };
      } catch {
        const score = 50;
        return {
          ticker: item.ticker,
          companyName: item.companyName,
          sector: "Unknown",
          price: 0,
          bullishScore: score,
          status: scoreLabel(score)
        };
      }
    })
  );

  return results;
}

export async function getStockDashboard(tickerInput, period = "1m") {
  const ticker = await resolveTickerInput(tickerInput);
  if (!ticker) return null;

  const cacheKey = `${ticker}-${period}`;
  const cachedStock = stockCache.get(cacheKey);
  const cachedNews = newsCache.get(`${ticker}-news`);
  if (cachedStock && cachedNews) {
    return { ...cachedStock, news: cachedNews };
  }

  const prices = await getDailySeries(ticker);

  const [quoteResult, overviewResult] = await Promise.allSettled([
    getGlobalQuote(ticker),
    getOverview(ticker)
  ]);

  const quote = quoteResult.status === "fulfilled" ? quoteResult.value : { price: 0, changePercent: 0, volume: 0 };
  const overview =
    overviewResult.status === "fulfilled"
      ? overviewResult.value
      : {
          ticker,
          companyName: ticker,
          sector: "Unknown",
          industry: "Unknown",
          marketCap: 0,
          peRatio: 0,
          earningsGrowth: 0,
          analystTargetPrice: 0
        };
  let newsItems = [];
  try {
    newsItems = await getNewsSentiment(ticker, 8, overview.companyName);
  } catch {
    newsItems = [];
  }

  const metrics = buildMetrics({
    prices,
    newsItems,
    earningsGrowth: overview.earningsGrowth,
    peRatio: overview.peRatio
  });

  const bullishScore = computeBullishScore(metrics);
  const status = scoreLabel(bullishScore);
  const signals = explainSignals(metrics);

  const days = periodToDays(period);
  const chart = prices.slice(-days).map((p) => ({
    date: p.date,
    open: p.open,
    high: p.high,
    low: p.low,
    close: p.close,
    volume: p.volume
  }));

  const latestPrice = quote.price > 0 ? quote.price : prices[prices.length - 1].close;

  const response = {
    stock: {
      ticker,
      companyName: overview.companyName,
      sector: overview.sector,
      marketCap: overview.marketCap,
      peRatio: overview.peRatio,
      earningsGrowth: overview.earningsGrowth,
      marketTrend: metrics.marketTrend
    },
    price: latestPrice,
    bullishScore,
    status,
    signals,
    chart,
    metrics
  };

  stockCache.set(cacheKey, response, 5 * 60 * 1000);
  newsCache.set(`${ticker}-news`, newsItems, 30 * 60 * 1000);

  return {
    ...response,
    news: newsItems
  };
}
