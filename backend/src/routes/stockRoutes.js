import express from "express";
import { getStockDashboard, searchStocks } from "../services/stockService.js";
import { getInsightsForQuery } from "../services/insightsService.js";

const router = express.Router();
const restrictionPattern = /(FMP HTTP 402|Restricted Endpoint|Premium Query Parameter)/i;

function formatErrorMessage(error, fallbackTicker = "") {
  const raw = String(error?.message || "Unknown error");
  if (restrictionPattern.test(raw) && fallbackTicker) {
    return `Basic Plan Doesn't Include ${String(fallbackTicker).toUpperCase()}`;
  }
  return raw;
}

router.get("/search", async (req, res) => {
  try {
    const { q = "" } = req.query;
    const results = await searchStocks(String(q));
    return res.json({ results });
  } catch (error) {
    return res.status(502).json({ error: formatErrorMessage(error, req.query?.q) });
  }
});

router.post("/insights", async (req, res) => {
  try {
    const { query = "" } = req.body || {};
    const insight = await getInsightsForQuery(query);
    if (!insight.valid) {
      return res.status(400).json({ error: insight.error });
    }
    return res.json(insight);
  } catch (error) {
    return res.status(502).json({ error: formatErrorMessage(error, req.body?.query) });
  }
});

router.get("/:ticker", async (req, res) => {
  try {
    const { ticker } = req.params;
    const { period = "1m" } = req.query;
    const dashboard = await getStockDashboard(ticker, String(period));

    if (!dashboard) {
      return res.status(404).json({ error: "Stock not found" });
    }

    return res.json(dashboard);
  } catch (error) {
    return res.status(502).json({ error: formatErrorMessage(error, req.params?.ticker) });
  }
});

export default router;
