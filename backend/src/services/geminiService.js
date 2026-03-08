const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const body = await response.json();
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text || null;
}

function fallbackInsight(payload) {
  const scoreLabel = payload.score >= 70 ? "bullish" : payload.score >= 45 ? "neutral" : "bearish";
  const headline = payload.news?.[0]?.headline ? `Headline: ${payload.news[0].headline}` : "";
  return {
    overview: `${payload.title} currently leans ${scoreLabel} with a score of ${payload.score}/100. ${payload.reason}`,
    trend: payload.trend,
    risk: payload.risk,
    whyAttention: payload.attention,
    studentTakeaway: payload.takeaway,
    reasons: [
      `Momentum looks ${payload.signalSummary.momentum.toLowerCase()}.`,
      `News sentiment feels ${payload.signalSummary.newsSentiment.toLowerCase()}. ${headline}`.trim(),
      `Company strength is ${payload.signalSummary.companyStrength.toLowerCase()}.`
    ]
  };
}

export async function generateStudentInsight(payload) {
  const prompt = [
    "You are StockSense, a tutor for beginners learning stocks.",
    "Return ONLY valid JSON with keys: overview, trend, risk, whyAttention, studentTakeaway, reasons.",
    "The reasons field must be an array of 3-5 short bullet strings explaining why the stock is bullish, neutral, or bearish.",
    "Reasons must be specific to the stock. If headlines are provided, quote at least one headline verbatim in the reasons array.",
    "Tone: plain English, no jargon, max 2 sentences per field.",
    `Context title: ${payload.title}`,
    `Current score: ${payload.score}/100 (${payload.status})`,
    `Key metrics: price=${payload.price}, peRatio=${payload.peRatio}, earningsGrowth=${payload.earningsGrowth}`,
    `Signals: momentum=${payload.signalSummary.momentum}, investorInterest=${payload.signalSummary.investorInterest}, news=${payload.signalSummary.newsSentiment}, volatility=${payload.signalSummary.volatility}, companyStrength=${payload.signalSummary.companyStrength}, risk=${payload.signalSummary.riskLevel}`,
    `Recent news headlines: ${payload.news.map((n) => n.headline).join(" | ")}`,
    `Extra context: ${payload.reason}`
  ].join("\n");

  try {
    const raw = await callGemini(prompt);
    if (!raw) return fallbackInsight(payload);
    const parsed = JSON.parse(raw);

    const required = ["overview", "trend", "risk", "whyAttention", "studentTakeaway"];
    const valid = required.every((key) => typeof parsed[key] === "string" && parsed[key].trim());
    const reasonsValid =
      Array.isArray(parsed.reasons) &&
      parsed.reasons.length >= 3 &&
      parsed.reasons.every((item) => typeof item === "string" && item.trim());
    if (!valid || !reasonsValid) return fallbackInsight(payload);

    return parsed;
  } catch {
    return fallbackInsight(payload);
  }
}
