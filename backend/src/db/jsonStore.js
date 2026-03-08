import fs from "fs/promises";
import path from "path";
import { DATA_DIR } from "../config.js";

const paths = {
  stocks: path.join(DATA_DIR, "stocks.json"),
  users: path.join(DATA_DIR, "users.json"),
  watchlists: path.join(DATA_DIR, "watchlists.json"),
  news: path.join(DATA_DIR, "news.json")
};

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function getStocks() {
  return readJson(paths.stocks, []);
}

export async function getStockByTicker(ticker) {
  const stocks = await getStocks();
  return stocks.find((s) => s.ticker.toLowerCase() === ticker.toLowerCase()) || null;
}

export async function getUsers() {
  return readJson(paths.users, []);
}

export async function saveUsers(users) {
  await writeJson(paths.users, users);
}

export async function getWatchlists() {
  return readJson(paths.watchlists, []);
}

export async function saveWatchlists(watchlists) {
  await writeJson(paths.watchlists, watchlists);
}

export async function getNews() {
  return readJson(paths.news, []);
}
