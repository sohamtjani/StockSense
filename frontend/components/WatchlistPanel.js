export default function WatchlistPanel({ items, onPick }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-soft">
      <p className="mb-2 text-sm font-semibold text-blue-100">Your Stocks</p>
      <div className="space-y-2">
        {items.length ? (
          items.map((ticker) => (
            <button
              key={ticker}
              onClick={() => onPick(ticker)}
              className="w-full rounded-lg border border-blue-100/20 bg-white/5 px-3 py-2 text-left text-sm font-semibold hover:bg-white/10"
            >
              {ticker}
            </button>
          ))
        ) : (
          <p className="text-xs text-blue-100/70">Save stocks and they will stay on this device.</p>
        )}
      </div>
    </div>
  );
}
