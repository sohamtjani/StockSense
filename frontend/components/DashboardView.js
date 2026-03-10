"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import InsightsPanel from "@/components/InsightsPanel";
import NewsPanel from "@/components/NewsPanel";
import PriceChart from "@/components/PriceChart";
import ScoreMeter from "@/components/ScoreMeter";
import SignalCards from "@/components/SignalCards";
import StockSearchBar from "@/components/StockSearchBar";
import WatchlistPanel from "@/components/WatchlistPanel";
import { apiGet, apiPost } from "@/lib/api";

const periods = [
  { key: "1w", label: "1D-1W" },
  { key: "1m", label: "1 Month" },
  { key: "3m", label: "3 Months" }
];

const WATCHLIST_KEY = "stocksense_watchlist";

export default function DashboardView() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [ticker, setTicker] = useState("NVDA");
  const [period, setPeriod] = useState("1m");
  const [dashboard, setDashboard] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(WATCHLIST_KEY);
      if (stored) setWatchlist(JSON.parse(stored));
    } catch {
      setWatchlist([]);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await apiGet(`/stocks/search?q=${encodeURIComponent(query)}`);
        setSearchResults(res.results || []);
      } catch {
        setSearchResults([]);
      }
    };
    const t = setTimeout(run, 180);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const run = async () => {
      try {
        setError("");
        const res = await apiGet(`/stocks/${ticker}?period=${period}`);
        setDashboard(res);
        setInsights(null);
      } catch (err) {
        setError(err.message);
      }
    };
    run();
  }, [ticker, period]);

  function addToWatchlist() {
    if (!dashboard?.stock?.ticker) return;
    const next = [...new Set([...watchlist, dashboard.stock.ticker])];
    setWatchlist(next);
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  }

  async function handleGetInfo() {
    const target = query.trim() || dashboard?.stock?.ticker;
    if (!target) {
      setError("Type a ticker or industry before requesting insights.");
      return;
    }

    try {
      setError("");
      setLoadingInsights(true);
      const res = await apiPost("/stocks/insights", { query: target });
      setInsights(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingInsights(false);
    }
  }

  const header = useMemo(() => {
    if (!dashboard) return null;
    return {
      name: dashboard.stock.companyName,
      ticker: dashboard.stock.ticker,
      sector: dashboard.stock.sector,
      price: dashboard.price,
      marketCap: dashboard.stock.marketCap
    };
  }, [dashboard]);

  return (
    <main className="mx-auto max-w-[1360px] px-4 py-6 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-100/70">StockSense Dashboard</p>
        <Link
          href="/"
          className="rounded-full border border-blue-200/30 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-100 transition hover:border-cyan-200/60 hover:text-cyan-100"
        >
          Back to Landing
        </Link>
      </div>

      <section className="mb-5 grid gap-4 xl:grid-cols-12">
        <div className="market-hero rounded-3xl p-6 xl:col-span-8">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/90">StockSense • Market View</p>
          {header ? (
            <>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                    {header.ticker}
                    <span className="ml-3 text-xl font-semibold text-cyan-200/90 md:text-2xl">{header.name}</span>
                  </h1>
                  <p className="mt-2 text-sm text-blue-100/80">{header.sector}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-blue-100/70">Current Price</p>
                  <p className="text-4xl font-black">${header.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
                <div className="metric-pill rounded-xl px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-blue-100/70">Status</p>
                  <p className="text-sm font-bold">{dashboard.status}</p>
                </div>
                <div className="metric-pill rounded-xl px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-blue-100/70">Market Cap</p>
                  <p className="text-sm font-bold">${(header.marketCap / 1_000_000_000).toFixed(0)}B</p>
                </div>
                <div className="metric-pill rounded-xl px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-blue-100/70">P/E Ratio</p>
                  <p className="text-sm font-bold">{dashboard.stock.peRatio}</p>
                </div>
                <div className="metric-pill rounded-xl px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-blue-100/70">Earnings Growth</p>
                  <p className="text-sm font-bold">{Math.round(dashboard.stock.earningsGrowth * 100)}%</p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="space-y-4 xl:col-span-4">
          <StockSearchBar
            query={query}
            setQuery={setQuery}
            results={searchResults}
            onSelect={(t) => {
              setTicker(t);
              setQuery("");
            }}
            onGetInfo={handleGetInfo}
            infoLoading={loadingInsights}
          />
          <WatchlistPanel items={watchlist} onPick={(t) => setTicker(t)} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-4">
          {dashboard ? <ScoreMeter score={dashboard.bullishScore} status={dashboard.status} /> : null}
          <button onClick={addToWatchlist} className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-slate-900">
            Save {dashboard?.stock?.ticker || "Stock"} to Your List
          </button>
          <InsightsPanel
            insights={insights}
            loading={loadingInsights}
            onRequest={handleGetInfo}
            hasTarget={Boolean(query.trim() || dashboard?.stock?.ticker)}
          />
        </div>

        <div className="space-y-4 xl:col-span-8">
          {error ? <div className="rounded-xl border border-rose-300/40 bg-rose-500/20 px-3 py-2 text-sm text-rose-100">{error}</div> : null}

          {dashboard ? <SignalCards signals={dashboard.signals} /> : null}

          <div className="glass rounded-3xl p-3">
            <div className="mb-3 flex gap-2">
              {periods.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    p.key === period ? "bg-cyan-300 text-slate-900" : "bg-white/10 text-blue-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {dashboard ? <PriceChart data={dashboard.chart} /> : null}
          </div>

          {dashboard ? <NewsPanel news={dashboard.news} /> : null}
        </div>
      </section>

      <footer className="mt-8 rounded-2xl border border-blue-200/15 bg-white/5 px-4 py-4 text-sm text-blue-100/85">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p>StockSense 2026</p>
          <p>Contact: sohamjani8@gmail.com</p>
          <p>Soham Jani 2026</p>
        </div>
      </footer>
    </main>
  );
}
