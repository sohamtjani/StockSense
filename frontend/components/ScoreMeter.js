function statusClass(status) {
  if (status.includes("VERY")) return "text-emerald-300";
  if (status === "BULLISH") return "text-cyan-200";
  if (status === "NEUTRAL") return "text-amber-200";
  return "text-rose-200";
}

export default function ScoreMeter({ score, status }) {
  const fill = Math.max(0, Math.min(100, score));

  return (
    <div className="glass rounded-3xl p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Overall Market Score</p>
      <div className="mt-4 flex items-center gap-5">
        <div className="score-ring grid h-28 w-28 place-items-center rounded-full p-[7px]">
          <div className="grid h-full w-full place-items-center rounded-full bg-[#09163c] text-2xl font-extrabold text-white">
            {fill}
          </div>
        </div>
        <div>
          <p className="text-xs text-blue-100/70">Status</p>
          <p className={`text-2xl font-extrabold tracking-wide ${statusClass(status)}`}>{status}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-blue-100/70">
            <span>0-40 Bearish</span>
            <span>40-60 Neutral</span>
            <span>60-80 Bullish</span>
            <span>80-100 Very Bullish</span>
          </div>
        </div>
      </div>
    </div>
  );
}
