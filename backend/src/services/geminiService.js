let cachedModel = process.env.GEMINI_MODEL || "";
let modelResolvedAt = 0;

async function resolveModel(apiKey) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Gemini model list failed (${response.status})`);
  }
  const body = await response.json();
  const models = Array.isArray(body.models) ? body.models : [];
  const eligible = models.filter((model) =>
    Array.isArray(model.supportedGenerationMethods) &&
    model.supportedGenerationMethods.includes("generateContent")
  );
  const byPreference = eligible.sort((a, b) => {
    const aName = String(a.name || "");
    const bName = String(b.name || "");
    const rank = (name) => {
      if (name.includes("flash-lite")) return 0;
      if (name.includes("flash")) return 1;
      if (name.includes("pro")) return 2;
      return 3;
    };
    return rank(aName) - rank(bName);
  });
  const picked = byPreference[0]?.name || "";
  return picked.replace(/^models\//, "");
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for insights.");
  }

  if (!cachedModel || Date.now() - modelResolvedAt > 6 * 60 * 60 * 1000) {
    cachedModel = await resolveModel(apiKey);
    modelResolvedAt = Date.now();
  }
  if (!cachedModel) {
    throw new Error("No Gemini model available for generateContent.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cachedModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          required: ["overview", "trend", "risk", "whyAttention", "studentTakeaway", "reasons"],
          properties: {
            overview: { type: "STRING" },
            trend: { type: "STRING" },
            risk: { type: "STRING" },
            whyAttention: { type: "STRING" },
            studentTakeaway: { type: "STRING" },
            reasons: { type: "ARRAY", items: { type: "STRING" } }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    let parsedDetail = "";
    try {
      parsedDetail = JSON.parse(detail)?.error?.message || "";
    } catch {
      parsedDetail = "";
    }
    const fullDetail = (parsedDetail || detail || "").slice(0, 500);
    if (response.status === 404) {
      cachedModel = await resolveModel(apiKey);
      modelResolvedAt = Date.now();
      if (cachedModel) {
        return callGemini(prompt);
      }
    }
    if (response.status === 429) {
      throw new Error(`Gemini quota exceeded (429): ${fullDetail}`);
    }
    throw new Error(`Gemini request failed (${response.status}): ${fullDetail}`);
  }

  const body = await response.json();
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error("Gemini response was empty.");
  }
  return text;
}

function parseLineFormat(rawText) {
  const text = rawText.replace(/^```[\s\S]*?\n/, "").replace(/```$/m, "").trim();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const out = {
    overview: "",
    trend: "",
    risk: "",
    whyAttention: "",
    studentTakeaway: "",
    reasons: []
  };

  let inReasons = false;
  for (const line of lines) {
    if (/^REASONS\s*:/i.test(line)) {
      inReasons = true;
      continue;
    }
    if (inReasons) {
      const reason = line.replace(/^-+\s*/, "").trim();
      if (reason) out.reasons.push(reason);
      continue;
    }
    if (/^OVERVIEW\s*:/i.test(line)) out.overview = line.split(":").slice(1).join(":").trim();
    if (/^TREND\s*:/i.test(line)) out.trend = line.split(":").slice(1).join(":").trim();
    if (/^RISK\s*:/i.test(line)) out.risk = line.split(":").slice(1).join(":").trim();
    if (/^WHY_ATTENTION\s*:/i.test(line)) out.whyAttention = line.split(":").slice(1).join(":").trim();
    if (/^STUDENT_TAKEAWAY\s*:/i.test(line)) out.studentTakeaway = line.split(":").slice(1).join(":").trim();
  }

  return out;
}

function normalizeInsightShape(parsed) {
  if (!parsed || typeof parsed !== "object") return parsed;
  const pick = (...values) => {
    for (const value of values) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  };
  let reasons = parsed.reasons ?? parsed.REASONS ?? [];
  if (Array.isArray(reasons)) {
    reasons = reasons
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") return String(item.text || item.reason || "").trim();
        return "";
      })
      .filter(Boolean);
  }
  if (typeof reasons === "string") {
    reasons = reasons
      .split("\n")
      .map((item) => item.replace(/^-+\s*/, "").trim())
      .filter(Boolean);
  }
  return {
    overview: pick(parsed.overview, parsed.OVERVIEW, parsed.summary, parsed.SUMMARY),
    trend: pick(parsed.trend, parsed.TREND, parsed.marketTrend, parsed.market_trend),
    risk: pick(parsed.risk, parsed.RISK, parsed.riskLevel, parsed.risk_level),
    whyAttention: pick(parsed.whyAttention, parsed.WHY_ATTENTION, parsed.why_attention, parsed.whyInvestorsCare, parsed.why_investors_care),
    studentTakeaway: pick(parsed.studentTakeaway, parsed.STUDENT_TAKEAWAY, parsed.student_takeaway, parsed.takeaway, parsed.TAKEAWAY),
    reasons
  };
}

export async function generateStudentInsight(payload) {
  const tickerMatch = /\(([A-Z.\-]+)\)/.exec(payload.title || "");
  const expectedTicker = tickerMatch ? tickerMatch[1] : "";
  const expectedName = String(payload.title || "").split("(")[0].trim();
  const prompt = [
    "You are StockSense, a tutor for beginners learning stocks.",
    "Return ONLY valid JSON. No markdown fences. No extra keys.",
    "Required keys: overview, trend, risk, whyAttention, studentTakeaway, reasons.",
    "If JSON output fails, output EXACTLY in this line format:",
    "OVERVIEW: ...",
    "TREND: ...",
    "RISK: ...",
    "WHY_ATTENTION: ...",
    "STUDENT_TAKEAWAY: ...",
    "REASONS:",
    "- ...",
    "- ...",
    "- ...",
    "Do not add any other sections.",
    "The reasons must be 3-5 short bullets explaining why the stock is bullish, neutral, or bearish.",
    "Reasons must be specific to the stock. Mention the exact ticker at least once.",
    "If headlines are provided, quote at least one headline verbatim in reasons.",
    "Tone: plain English, no jargon, max 2 sentences per field.",
    `Context title: ${payload.title}`,
    `Current score: ${payload.score}/100 (${payload.status})`,
    `Key metrics: price=${payload.price}, peRatio=${payload.peRatio}, earningsGrowth=${payload.earningsGrowth}`,
    `Signals: momentum=${payload.signalSummary.momentum}, investorInterest=${payload.signalSummary.investorInterest}, news=${payload.signalSummary.newsSentiment}, volatility=${payload.signalSummary.volatility}, companyStrength=${payload.signalSummary.companyStrength}, risk=${payload.signalSummary.riskLevel}`,
    `Recent news headlines: ${payload.news.map((n) => n.headline).join(" | ")}`,
    `Extra context: ${payload.reason}`
  ].join("\n");

  const parseGeminiOutput = (raw) => {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    let parsed = null;

    try {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      const jsonSlice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
      parsed = JSON.parse(jsonSlice);
    } catch {
      parsed = parseLineFormat(cleaned);
    }

    const normalized = normalizeInsightShape(parsed);
    if (!Array.isArray(normalized.reasons)) normalized.reasons = [];
    return { normalized, parsed };
  };

  const isValidInsight = (insight) => {
    const required = ["overview", "trend", "risk", "whyAttention", "studentTakeaway"];
    const valid = required.every((key) => typeof insight[key] === "string" && insight[key].trim());
    const reasonsValid =
      Array.isArray(insight.reasons) &&
      insight.reasons.length >= 3 &&
      insight.reasons.every((item) => typeof item === "string" && item.trim());
    const combined = `${insight.overview} ${insight.whyAttention} ${insight.reasons.join(" ")}`.toLowerCase();
    const tickerSpecific = expectedTicker ? combined.includes(expectedTicker.toLowerCase()) : true;
    const nameSpecific = expectedName ? combined.includes(expectedName.toLowerCase()) : true;
    return valid && reasonsValid && (tickerSpecific || nameSpecific);
  };

  const raw = await callGemini(prompt);
  const firstPass = parseGeminiOutput(raw);
  if (isValidInsight(firstPass.normalized)) return firstPass.normalized;
  const keys = firstPass.parsed && typeof firstPass.parsed === "object" ? Object.keys(firstPass.parsed).join(",") : "no-object";
  throw new Error(`Gemini response missing required fields. keys=${keys}`);
}
