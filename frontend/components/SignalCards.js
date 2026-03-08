const entries = [
  ["Momentum", "momentum", "from-cyan-300/20 to-cyan-500/5"],
  ["Investor Activity", "investorInterest", "from-orange-300/20 to-orange-500/5"],
  ["News Sentiment", "newsSentiment", "from-lime-300/20 to-lime-500/5"],
  ["Volatility", "volatility", "from-fuchsia-300/20 to-fuchsia-500/5"],
  ["Company Strength", "companyStrength", "from-emerald-300/20 to-emerald-500/5"],
  ["Risk Level", "riskLevel", "from-rose-300/20 to-rose-500/5"]
];

export default function SignalCards({ signals }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {entries.map(([label, key, gradient]) => {
        const signal = signals?.[key];
        return (
          <div key={key} className={`rounded-2xl border border-blue-200/15 bg-gradient-to-br ${gradient} p-4`}>
            <p className="text-[11px] uppercase tracking-[0.14em] text-blue-100/70">{label}</p>
            <p className="mt-2 text-lg font-bold text-white">{signal?.icon} {signal?.title}</p>
            <p className="mt-1 text-sm text-blue-100/85">{signal?.description}</p>
          </div>
        );
      })}
    </div>
  );
}
