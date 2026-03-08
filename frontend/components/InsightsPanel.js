import { useState } from "react";

export default function InsightsPanel({ insights, loading, onRequest, hasTarget }) {
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && !insights && !loading && onRequest && hasTarget) {
      onRequest();
    }
  }

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Student Overview</h3>
        <div className="flex items-center gap-2">
          {insights?.score !== undefined ? (
            <span className="metric-pill rounded-full px-3 py-1 text-xs font-bold text-cyan-100">
              {insights.score}/100 • {insights.status}
            </span>
          ) : null}
          <button
            onClick={toggle}
            disabled={!hasTarget}
            className="rounded-full border border-blue-200/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100/90 disabled:opacity-50"
          >
            {expanded ? "Hide" : "Why?"}
          </button>
        </div>
      </div>

      {expanded && loading ? <p className="mt-3 text-sm text-blue-100/80">Generating insight...</p> : null}

      {expanded && !loading && insights ? (
        <div className="mt-3 space-y-3 text-sm text-blue-50">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Overview</p>
            <p className="mt-1">{insights.insight.overview}</p>
          </div>
          {Array.isArray(insights.insight.reasons) ? (
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Reasons</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-blue-50">
                {insights.insight.reasons.map((reason, idx) => (
                  <li key={`${reason}-${idx}`}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Bullish / Bearish Trend</p>
            <p className="mt-1">{insights.insight.trend}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Risk Level</p>
            <p className="mt-1">{insights.insight.risk}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Why Investors Care</p>
            <p className="mt-1">{insights.insight.whyAttention}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Student Takeaway</p>
            <p className="mt-1">{insights.insight.studentTakeaway}</p>
          </div>
        </div>
      ) : null}

      {expanded && !loading && !insights ? (
        <p className="mt-3 text-sm text-blue-100/75">
          Select a valid ticker first, then press the dropdown to load Gemini reasoning.
        </p>
      ) : null}
    </div>
  );
}
