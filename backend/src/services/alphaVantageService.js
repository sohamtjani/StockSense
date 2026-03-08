import { insightsCache } from "../cache.js";
import { classifySentiment } from "./sentiment.js";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const API_KEY = process.env.FMP_API_KEY || process.env.FINANCIAL_MODELING_PREP_API_KEY || "foOPssgkgZYz1D3fNYHaOiOlgaPFTDQ1";

let lastFmpRequestAt = 0;
let fmpQueue = Promise.resolve();

function ensureApiReady() {
  if (!API_KEY) throw new Error("FMP API key missing. Set FMP_API_KEY.");
}

function toUrl(path, params = {}) {
  const query = new URLSearchParams({ ...params, apikey: API_KEY });
  return `${FMP_BASE_URL}${path}?${query.toString()}`;
}

async function fetchFmp(path, params = {}, ttlMs = 60_000) {
  ensureApiReady();
  const key = `fmp:${path}:${JSON.stringify(params)}`;
  const cached = insightsCache.get(key);
  if (cached) return cached;

  const response = await (fmpQueue = fmpQueue.catch(() => undefined).then(async () => {
    const elapsed = Date.now() - lastFmpRequestAt;
    if (elapsed < 320) {
      await new Promise((resolve) => setTimeout(resolve, 320 - elapsed));
    }

    lastFmpRequestAt = Date.now();
    return fetch(toUrl(path, params));
  }));

  if (!response.ok) {
    throw new Error(`FMP HTTP ${response.status}`);
  }

  const text = await response.text();
  if (text.startsWith("Restricted Endpoint")) {
    throw new Error(text.slice(0, 140));
  }

  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON from FMP");
  }

  insightsCache.set(key, data, ttlMs);
  return data;
}

function asNum(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function searchSymbols(keywords) {
  const [symbolMatches, nameMatches] = await Promise.allSettled([
    fetchFmp("/search-symbol", { query: keywords }, 10 * 60_000),
    fetchFmp("/search-name", { query: keywords }, 10 * 60_000)
  ]);

  const merged = [];
  const seen = new Set();

  for (const source of [symbolMatches, nameMatches]) {
    if (source.status !== "fulfilled" || !Array.isArray(source.value)) continue;

    for (const item of source.value) {
      const ticker = String(item.symbol || "").toUpperCase();
      if (!ticker || seen.has(ticker)) continue;
      seen.add(ticker);

      merged.push({
        ticker,
        companyName: item.name || ticker,
        region: item.exchange || item.exchangeFullName || "",
        currency: item.currency || "",
        matchScore: 1
      });
    }
  }

  return merged;
}

export async function getDailySeries(symbol) {
  const data = await fetchFmp("/historical-price-eod/full", { symbol: symbol.toUpperCase() }, 5 * 60_000);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No daily data found for ${symbol} from FMP`);
  }

  const points = data
    .map((item) => ({
      date: item.date,
      close: asNum(item.close),
      volume: asNum(item.volume)
    }))
    .filter((p) => p.date && p.close > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!points.length) {
    throw new Error(`No daily data found for ${symbol} from FMP`);
  }

  return points;
}

export async function getGlobalQuote(symbol) {
  const data = await fetchFmp("/quote", { symbol: symbol.toUpperCase() }, 60_000);
  const quote = Array.isArray(data) ? data[0] : null;

  if (!quote) {
    return { price: 0, changePercent: 0, volume: 0 };
  }

  return {
    price: asNum(quote.price),
    changePercent: asNum(quote.changePercentage),
    volume: asNum(quote.volume)
  };
}

export async function getOverview(symbol) {
  const upper = symbol.toUpperCase();
  const [profileRes, ratiosRes, growthRes] = await Promise.allSettled([
    fetchFmp("/profile", { symbol: upper }, 30 * 60_000),
    fetchFmp("/ratios-ttm", { symbol: upper }, 30 * 60_000),
    fetchFmp("/income-statement-growth", { symbol: upper }, 30 * 60_000)
  ]);

  const profile = profileRes.status === "fulfilled" && Array.isArray(profileRes.value) ? profileRes.value[0] : null;
  const ratios = ratiosRes.status === "fulfilled" && Array.isArray(ratiosRes.value) ? ratiosRes.value[0] : null;
  const growth = growthRes.status === "fulfilled" && Array.isArray(growthRes.value) ? growthRes.value[0] : null;

  if (!profile) {
    return {
      ticker: upper,
      companyName: upper,
      sector: "Unknown",
      industry: "Unknown",
      marketCap: 0,
      peRatio: 0,
      earningsGrowth: 0,
      analystTargetPrice: 0
    };
  }

  return {
    ticker: String(profile.symbol || upper).toUpperCase(),
    companyName: profile.companyName || profile.name || upper,
    sector: profile.sector || "Unknown",
    industry: profile.industry || "Unknown",
    marketCap: asNum(profile.marketCap),
    peRatio: asNum(ratios?.priceToEarningsRatioTTM || profile.pe),
    earningsGrowth: asNum(growth?.growthRevenue || growth?.growthNetIncome || growth?.growthEPS),
    analystTargetPrice: asNum(profile.targetPrice)
  };
}

function htmlToPlain(html = "") {
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeTickerField(value = "") {
  return String(value)
    .split(",")
    .map((v) => v.trim().split(":").pop()?.toUpperCase())
    .filter(Boolean);
}

function matchesCompanyName(text, companyName) {
  if (!companyName) return false;
  const raw = String(companyName).toLowerCase();
  const cleaned = raw
    .replace(/\b(inc|inc\.|corp|corp\.|co|co\.|ltd|ltd\.|company|corporation|class)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const variants = new Set([raw, cleaned].filter(Boolean));
  for (const part of cleaned.split(" ")) {
    if (part.length >= 4) variants.add(part);
  }
  const hay = String(text).toLowerCase();
  for (const v of variants) {
    if (v.length >= 4 && hay.includes(v)) return true;
  }
  return false;
}

export async function getNewsSentiment(symbol, limit = 8, companyName = "") {
  const articles = await fetchFmp("/fmp-articles", {}, 30 * 60_000);
  if (!Array.isArray(articles)) return [];

  const ticker = symbol.toUpperCase();
  const related = articles.filter((item) => {
    const linked = normalizeTickerField(item.tickers || "");
    if (linked.includes(ticker)) return true;
    const title = String(item.title || "");
    const content = String(item.content || "");
    if (title.toUpperCase().includes(` ${ticker} `) || title.toUpperCase().startsWith(`${ticker} `) || title.toUpperCase().endsWith(` ${ticker}`)) {
      return true;
    }
    return matchesCompanyName(`${title} ${content}`, companyName);
  });

  const picked = (related.length ? related : articles).slice(0, limit);

  return picked.map((item, idx) => {
    const summary = htmlToPlain(item.content || "");
    return {
      id: `${ticker}-fmp-${idx}-${item.date || Date.now()}`,
      ticker,
      headline: item.title || "Market update",
      summary,
      url: item.link || "https://financialmodelingprep.com/",
      source: item.site || "Financial Modeling Prep",
      publishedAt: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      sentiment: classifySentiment(`${item.title || ""} ${summary}`)
    };
  });
}
