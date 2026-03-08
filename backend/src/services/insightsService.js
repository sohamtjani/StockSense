import { insightsCache } from "../cache.js";
import { getOverview, searchSymbols } from "./alphaVantageService.js";
import { generateStudentInsight } from "./geminiService.js";
import { getStockDashboard, resolveTickerInput } from "./stockService.js";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getSignalSummary(signals) {
  return {
    momentum: signals.momentum.title,
    investorInterest: signals.investorInterest.title,
    newsSentiment: signals.newsSentiment.title,
    volatility: signals.volatility.title,
    companyStrength: signals.companyStrength.title,
    riskLevel: signals.riskLevel.title
  };
}

async function resolveIndustryQuery(query) {
  const matches = await searchSymbols(query);
  if (!matches.length) return null;

  const candidates = [];
  for (const match of matches.slice(0, 6)) {
    try {
      const overview = await getOverview(match.ticker);
      candidates.push({ ticker: match.ticker, overview });
    } catch {
      // Continue on sparse symbols.
    }
  }

  if (!candidates.length) return null;

  const q = normalize(query);
  const filtered = candidates.filter(
    (c) =>
      normalize(c.overview.sector).includes(q) ||
      normalize(c.overview.industry).includes(q) ||
      normalize(c.overview.companyName).includes(q)
  );

  const picked = filtered.length ? filtered : candidates;
  return {
    industryName: picked[0].overview.sector || picked[0].overview.industry || "Market",
    tickers: picked.slice(0, 4).map((p) => p.ticker)
  };
}

export async function validateAndResolveQuery(rawQuery) {
  const query = String(rawQuery || "").trim();
  if (!query) {
    return { valid: false, error: "Enter a ticker or industry (examples: NVDA, AAPL, Semiconductor)." };
  }

  const ticker = await resolveTickerInput(query);
  if (ticker) {
    const dashboard = await getStockDashboard(ticker, "1m");
    if (dashboard) return { valid: true, type: "ticker", value: ticker };
  }

  const industry = await resolveIndustryQuery(query);
  if (industry && industry.tickers.length) {
    return { valid: true, type: "industry", value: industry.industryName, tickers: industry.tickers };
  }

  return {
    valid: false,
    error: "No valid ticker or industry match found from Alpha Vantage. Try a listed ticker (for example: NVDA, GOOGL, AAPL)."
  };
}

function buildIndustryTakeaway(dashboards, industry) {
  const avgScore = Math.round(dashboards.reduce((sum, d) => sum + d.bullishScore, 0) / dashboards.length);
  const leaders = dashboards
    .slice()
    .sort((a, b) => b.bullishScore - a.bullishScore)
    .slice(0, 2)
    .map((d) => d.stock.ticker)
    .join(" and ");

  return {
    title: `${industry} Industry`,
    score: avgScore,
    status: avgScore >= 70 ? "BULLISH" : avgScore >= 45 ? "NEUTRAL" : "BEARISH",
    price: "mixed",
    peRatio: "mixed",
    earningsGrowth: "mixed",
    reason: `Industry score is based on Financial Modeling Prep data for ${dashboards.map((d) => d.stock.ticker).join(", ")}.`,
    signalSummary: {
      momentum: "Mixed",
      investorInterest: "Mixed",
      newsSentiment: "Mixed",
      volatility: "Mixed",
      companyStrength: "Mixed",
      riskLevel: avgScore >= 70 ? "Low" : avgScore >= 45 ? "Medium" : "High"
    },
    news: dashboards.flatMap((d) => d.news).slice(0, 6),
    trend: avgScore >= 70 ? "Sector trend is currently up." : avgScore >= 45 ? "Sector trend is mostly sideways." : "Sector trend is currently down.",
    risk: avgScore >= 70 ? "Risk looks moderate-low at the sector level." : "Risk looks medium to high due to mixed signals.",
    attention: `Investors are most focused on ${leaders} in this group.`,
    takeaway: "Use this as a starting map, then compare each company’s own chart and news."
  };
}

export async function getInsightsForQuery(rawQuery) {
  const resolved = await validateAndResolveQuery(rawQuery);
  if (!resolved.valid) return resolved;

  const cacheKey = `insight:${resolved.type}:${resolved.value}:${(resolved.tickers || []).join(",")}`;
  const cached = insightsCache.get(cacheKey);
  if (cached) return { valid: true, ...cached };

  if (resolved.type === "ticker") {
    const dashboard = await getStockDashboard(resolved.value, "1m");
    if (!dashboard) return { valid: false, error: "Ticker not found." };

    const payload = {
      title: `${dashboard.stock.companyName} (${dashboard.stock.ticker})`,
      score: dashboard.bullishScore,
      status: dashboard.status,
      price: dashboard.price,
      peRatio: dashboard.stock.peRatio,
      earningsGrowth: dashboard.stock.earningsGrowth,
      signalSummary: getSignalSummary(dashboard.signals),
      news: dashboard.news,
      reason: `${dashboard.stock.companyName} is in ${dashboard.stock.sector} with latest price ${dashboard.price}.`,
      trend: dashboard.signals.momentum.title,
      risk: dashboard.signals.riskLevel.title,
      attention: dashboard.news[0]?.headline || "No stock-specific headlines were found in the current feed.",
      takeaway: "Start with trend and risk, then verify with current headlines."
    };

    const insight = await generateStudentInsight(payload);

    const response = {
      inputType: "ticker",
      canonical: dashboard.stock.ticker,
      title: payload.title,
      score: dashboard.bullishScore,
      status: dashboard.status,
      insight
    };

    insightsCache.set(cacheKey, response, 15 * 60 * 1000);
    return { valid: true, ...response };
  }

  const dashboards = [];
  for (const ticker of resolved.tickers.slice(0, 4)) {
    const d = await getStockDashboard(ticker, "1m");
    if (d) dashboards.push(d);
  }

  if (!dashboards.length) {
    return { valid: false, error: "Industry matched, but no live stock data could be loaded." };
  }

  const payload = buildIndustryTakeaway(dashboards, resolved.value);
  const insight = await generateStudentInsight(payload);

  const response = {
    inputType: "industry",
    canonical: resolved.value,
    title: payload.title,
    score: payload.score,
    status: payload.status,
    basket: dashboards.map((d) => d.stock.ticker),
    insight
  };

  insightsCache.set(cacheKey, response, 15 * 60 * 1000);
  return { valid: true, ...response };
}
