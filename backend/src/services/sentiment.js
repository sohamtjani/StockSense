const POSITIVE = ["growth", "beat", "surge", "strong", "record", "up", "bullish", "expands", "wins", "rally"];
const NEGATIVE = ["miss", "drop", "weak", "risk", "lawsuit", "down", "bearish", "cuts", "decline", "fall"];

export function classifySentiment(text) {
  const value = text.toLowerCase();
  let score = 0;
  for (const word of POSITIVE) {
    if (value.includes(word)) score += 1;
  }
  for (const word of NEGATIVE) {
    if (value.includes(word)) score -= 1;
  }
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

export function sentimentToNumeric(sentiment) {
  if (sentiment === "positive") return 0.8;
  if (sentiment === "negative") return 0.2;
  return 0.5;
}
