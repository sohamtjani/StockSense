import express from "express";
import { getStockByTicker, getWatchlists, saveWatchlists } from "../db/jsonStore.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.get("/watchlist", authRequired, async (req, res) => {
  const all = await getWatchlists();
  const userItem = all.find((item) => item.userId === req.user.sub);
  return res.json({ tickers: userItem?.tickers || [] });
});

router.post("/watchlist/add", authRequired, async (req, res) => {
  const { ticker } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: "Ticker is required" });
  }

  const stock = await getStockByTicker(String(ticker));
  if (!stock) {
    return res.status(404).json({ error: "Unknown ticker" });
  }

  const all = await getWatchlists();
  let userItem = all.find((item) => item.userId === req.user.sub);

  if (!userItem) {
    userItem = { userId: req.user.sub, tickers: [] };
    all.push(userItem);
  }

  if (!userItem.tickers.includes(stock.ticker)) {
    userItem.tickers.push(stock.ticker);
  }

  await saveWatchlists(all);
  return res.json({ tickers: userItem.tickers });
});

export default router;
