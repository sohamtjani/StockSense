"use client";

export default function StockSearchBar({ query, setQuery, results, onSelect, onGetInfo, infoLoading }) {
  return (
    <div className="glass rounded-3xl p-5">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/90">
        Search by ticker or industry
      </label>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="NVIDIA, GOOGL, AAPL, AI Chips"
          className="w-full rounded-xl border border-blue-200/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-blue-100/70 outline-none transition focus:border-cyan-300/60"
        />
        <button
          onClick={onGetInfo}
          disabled={infoLoading}
          className="rounded-xl bg-cyan-300 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-950 disabled:opacity-60"
        >
          {infoLoading ? "Loading" : "Get Info"}
        </button>
      </div>

      {query.trim() && results.length > 0 ? (
        <div className="mt-3 space-y-2">
          {results.map((item) => (
            <button
              key={item.ticker}
              onClick={() => onSelect(item.ticker)}
              className="flex w-full items-center justify-between rounded-xl border border-blue-200/15 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
            >
              <span>
                <span className="block text-sm font-semibold">{item.companyName}</span>
                <span className="text-xs text-blue-100/70">{item.ticker} • {item.sector}</span>
              </span>
              <span className="rounded-full bg-cyan-300/20 px-2 py-1 text-xs font-semibold text-cyan-100">{item.bullishScore}/100</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
