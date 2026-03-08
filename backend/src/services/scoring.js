const WEIGHTS = {
  momentum: 0.25,
  volume: 0.15,
  sentiment: 0.2,
  earnings: 0.15,
  volatility: 0.1,
  market: 0.1,
  valuation: 0.05
};

const clamp01 = (num) => Math.max(0, Math.min(1, num));

export function computeMomentum(prices) {
  if (!prices || prices.length < 30) return 0.5;
  const now = prices[prices.length - 1].close;
  const past = prices[prices.length - 30].close;
  const raw = (now - past) / past;
  return clamp01((raw + 0.15) / 0.3);
}

export function computeVolumeSignal(prices) {
  if (!prices || prices.length < 10) return 0.5;
  const latest = prices[prices.length - 1].volume;
  const avg = prices.slice(-30).reduce((sum, p) => sum + p.volume, 0) / Math.min(prices.length, 30);
  const ratio = latest / avg;
  return clamp01((ratio - 0.7) / 0.8);
}

export function computeVolatilitySignal(prices) {
  if (!prices || prices.length < 20) return 0.5;
  const returns = [];
  for (let i = 1; i < prices.length; i += 1) {
    returns.push((prices[i].close - prices[i - 1].close) / prices[i - 1].close);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
  const std = Math.sqrt(variance);
  const normalizedRisk = clamp01(std / 0.05);
  return 1 - normalizedRisk;
}

export function computeEarningsSignal(earningsGrowth) {
  return clamp01((earningsGrowth + 0.2) / 0.5);
}

export function computeMarketSignal(marketTrend) {
  return clamp01((marketTrend + 0.1) / 0.3);
}

export function computeValuationSignal(peRatio) {
  if (!peRatio || peRatio <= 0) return 0.5;
  if (peRatio < 15) return 0.85;
  if (peRatio < 25) return 0.7;
  if (peRatio < 35) return 0.5;
  if (peRatio < 60) return 0.35;
  return 0.2;
}

export function computeBullishScore(metrics) {
  const score01 =
    metrics.momentum * WEIGHTS.momentum +
    metrics.volume * WEIGHTS.volume +
    metrics.sentiment * WEIGHTS.sentiment +
    metrics.earnings * WEIGHTS.earnings +
    metrics.volatility * WEIGHTS.volatility +
    metrics.market * WEIGHTS.market +
    metrics.valuation * WEIGHTS.valuation;

  return Math.round(clamp01(score01) * 100);
}

export function scoreLabel(score) {
  if (score < 40) return "BEARISH";
  if (score < 60) return "NEUTRAL";
  if (score < 80) return "BULLISH";
  return "VERY BULLISH";
}

export function explainSignals({ momentum, volume, sentiment, volatility, earnings, market }) {
  const momentumText = momentum > 0.7 ? "Strong Uptrend" : momentum > 0.45 ? "Sideways" : "Downtrend";
  const volumeText = volume > 0.7 ? "High" : volume > 0.45 ? "Normal" : "Low";
  const sentimentText = sentiment > 0.65 ? "Positive" : sentiment > 0.45 ? "Mixed" : "Negative";
  const volatilityText = volatility < 0.35 ? "High" : volatility < 0.65 ? "Medium" : "Low";
  const companyStrengthText = earnings > 0.7 ? "Strong" : earnings > 0.45 ? "Stable" : "Weak";
  const riskText = market > 0.65 && volatility > 0.55 ? "Low" : market > 0.45 ? "Medium" : "High";

  return {
    momentum: {
      icon: "🚀",
      title: momentumText,
      description: "How strongly the stock has moved in the last month."
    },
    investorInterest: {
      icon: "🔥",
      title: volumeText,
      description: "How active traders are compared with normal volume."
    },
    newsSentiment: {
      icon: "🙂",
      title: sentimentText,
      description: "Whether recent headlines feel optimistic or cautious."
    },
    volatility: {
      icon: "⚡",
      title: volatilityText,
      description: "How much the price swings day to day."
    },
    companyStrength: {
      icon: "💪",
      title: companyStrengthText,
      description: "How healthy earnings growth looks right now."
    },
    riskLevel: {
      icon: "⚠️",
      title: riskText,
      description: "Simple risk summary from market direction and volatility."
    }
  };
}
