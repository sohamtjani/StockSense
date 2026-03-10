"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Customized,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const TOGGLE_DEFS = [
  {
    key: "candles",
    label: "Price Candles",
    shortTerm: "Shows each day open/high/low/close so you can see if a move was strong or weak intraday.",
    longTerm: "Helps you see how daily structure builds larger trends over weeks and months."
  },
  {
    key: "volume",
    label: "Volume",
    shortTerm: "Confirms if a price move had real participation or was a low-conviction move.",
    longTerm: "Persistent high volume around key moves often marks durable trend shifts."
  },
  {
    key: "ma20",
    label: "20-Day MA",
    shortTerm: "Smooths noise to show near-term momentum and short trend direction.",
    longTerm: "Useful for timing entries in the context of a broader trend, not for predicting tops/bottoms."
  },
  {
    key: "ma50",
    label: "50-Day MA",
    shortTerm: "A steadier trend line than MA20; helps avoid overreacting to daily swings.",
    longTerm: "A core institutional reference line that often acts like dynamic support/resistance."
  },
  {
    key: "ma200",
    label: "200-Day MA",
    shortTerm: "Keeps short-term trades grounded in the bigger market direction.",
    longTerm: "One of the best big-picture trend filters for bull vs. bear regimes."
  },
  {
    key: "support",
    label: "Support Levels",
    shortTerm: "Highlights areas where buyers have stepped in before, which can aid risk planning.",
    longTerm: "Repeated support zones reveal long-term demand and sentiment floors."
  },
  {
    key: "resistance",
    label: "Resistance Levels",
    shortTerm: "Marks areas where rallies previously stalled and sellers became active.",
    longTerm: "Breaks above repeated resistance can signal structural trend improvement."
  },
  {
    key: "trendLines",
    label: "Trend Lines",
    shortTerm: "Shows whether the recent trend is still intact, flattening, or breaking.",
    longTerm: "Trend channels teach market structure better than single-day price reactions."
  },
  {
    key: "rsi",
    label: "RSI",
    shortTerm: "Measures momentum stretch (overheated vs. weak) so you avoid chasing extremes blindly.",
    longTerm: "Useful as a context signal to compare momentum cycles across regimes."
  },
  {
    key: "bollinger",
    label: "Bollinger Bands",
    shortTerm: "Shows when price is unusually stretched from its recent average.",
    longTerm: "Helps understand volatility expansion/compression cycles over time."
  }
];

const DEFAULT_TOGGLES = {
  candles: true,
  volume: false,
  ma20: false,
  ma50: false,
  ma200: false,
  support: false,
  resistance: false,
  trendLines: false,
  rsi: false,
  bollinger: false
};

function toNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function movingAverage(data, period, key = "close") {
  if (!data.length) return [];
  let sum = 0;
  return data.map((row, idx) => {
    sum += row[key];
    if (idx >= period) sum -= data[idx - period][key];
    if (idx < period - 1) return null;
    return sum / period;
  });
}

function rollingStd(data, period, key = "close") {
  return data.map((_, idx) => {
    if (idx < period - 1) return null;
    const window = data.slice(idx - period + 1, idx + 1).map((r) => r[key]);
    const mean = average(window);
    const variance = average(window.map((v) => (v - mean) ** 2));
    return Math.sqrt(variance);
  });
}

function computeRsi(data, period = 14) {
  if (data.length < period + 1) return data.map(() => null);

  const rsi = data.map(() => null);
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i += 1) {
    const delta = data[i].close - data[i - 1].close;
    avgGain += Math.max(delta, 0);
    avgLoss += Math.max(-delta, 0);
  }
  avgGain /= period;
  avgLoss /= period;

  const toRsi = (gain, loss) => {
    if (loss === 0) return 100;
    const rs = gain / loss;
    return 100 - 100 / (1 + rs);
  };

  rsi[period] = toRsi(avgGain, avgLoss);
  for (let i = period + 1; i < data.length; i += 1) {
    const delta = data[i].close - data[i - 1].close;
    const gain = Math.max(delta, 0);
    const loss = Math.max(-delta, 0);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsi[i] = toRsi(avgGain, avgLoss);
  }

  return rsi;
}

function clusterLevels(points, tolerance) {
  const clusters = [];

  for (const point of points) {
    const hit = clusters.find((c) => Math.abs(c.price - point.price) <= tolerance);
    if (!hit) {
      clusters.push({ price: point.price, hits: 1, lastIndex: point.index });
      continue;
    }
    hit.price = (hit.price * hit.hits + point.price) / (hit.hits + 1);
    hit.hits += 1;
    hit.lastIndex = Math.max(hit.lastIndex, point.index);
  }

  return clusters
    .sort((a, b) => (b.hits === a.hits ? b.lastIndex - a.lastIndex : b.hits - a.hits))
    .slice(0, 2)
    .map((c) => c.price);
}

function computeSupportResistance(data) {
  if (data.length < 8) return { supports: [], resistances: [] };

  const lows = [];
  const highs = [];
  for (let i = 2; i < data.length - 2; i += 1) {
    const l = data[i].low;
    const h = data[i].high;
    if (l <= data[i - 1].low && l <= data[i - 2].low && l <= data[i + 1].low && l <= data[i + 2].low) {
      lows.push({ price: l, index: i });
    }
    if (h >= data[i - 1].high && h >= data[i - 2].high && h >= data[i + 1].high && h >= data[i + 2].high) {
      highs.push({ price: h, index: i });
    }
  }

  const avgPrice = average(data.map((d) => d.close));
  const tolerance = Math.max(avgPrice * 0.015, 0.5);
  return {
    supports: clusterLevels(lows, tolerance),
    resistances: clusterLevels(highs, tolerance)
  };
}

function regression(points) {
  if (points.length < 2) return null;
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (!denom) return null;
  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  return { m, b };
}

function formatVolume(value) {
  const v = toNum(value);
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return `${Math.round(v)}`;
}

function CandleLayer({ data, xAxisMap, yAxisMap, enabled }) {
  if (!enabled || !data?.length) return null;

  const xAxis = Object.values(xAxisMap || {})[0];
  const yAxis = Object.values(yAxisMap || {}).find((axis) => axis?.yAxisId === "price") || Object.values(yAxisMap || {})[0];
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const xScale = xAxis.scale;
  const yScale = yAxis.scale;
  const bandwidth = typeof xScale.bandwidth === "function" ? xScale.bandwidth() : 8;
  const candleWidth = Math.max(2, Math.min(10, bandwidth * 0.66));

  return (
    <g>
      {data.map((point) => {
        const xBase = xScale(point.date);
        if (xBase === undefined || xBase === null) return null;
        const centerX = xBase + (bandwidth ? bandwidth / 2 : 0);
        const openY = yScale(point.open);
        const closeY = yScale(point.close);
        const highY = yScale(point.high);
        const lowY = yScale(point.low);
        if (![openY, closeY, highY, lowY].every(Number.isFinite)) return null;

        const rise = point.close >= point.open;
        const top = Math.min(openY, closeY);
        const bodyHeight = Math.max(1, Math.abs(openY - closeY));
        const bodyColor = rise ? "#34d399" : "#fb7185";

        return (
          <g key={point.date}>
            <line x1={centerX} y1={highY} x2={centerX} y2={lowY} stroke={bodyColor} strokeWidth={1} />
            <rect
              x={centerX - candleWidth / 2}
              y={top}
              width={candleWidth}
              height={bodyHeight}
              fill={rise ? "rgba(52,211,153,0.28)" : "rgba(251,113,133,0.32)"}
              stroke={bodyColor}
              strokeWidth={1}
              rx={1}
            />
          </g>
        );
      })}
    </g>
  );
}

export default function PriceChart({ data }) {
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);
  const [activeInfo, setActiveInfo] = useState("");

  const computed = useMemo(() => {
    const normalized = (Array.isArray(data) ? data : []).map((row, idx) => {
      const close = toNum(row.close);
      const open = toNum(row.open, close);
      const high = Math.max(toNum(row.high, close), open, close);
      const low = Math.min(toNum(row.low, close), open, close);
      return {
        idx,
        date: row.date,
        open,
        high,
        low,
        close,
        volume: toNum(row.volume, 0)
      };
    });

    if (!normalized.length) {
      return { points: [], supports: [], resistances: [] };
    }

    const ma20 = movingAverage(normalized, 20);
    const ma50 = movingAverage(normalized, 50);
    const ma200 = movingAverage(normalized, 200);
    const std20 = rollingStd(normalized, 20);
    const rsi = computeRsi(normalized, 14);
    const { supports, resistances } = computeSupportResistance(normalized);

    const regWindow = Math.min(80, normalized.length);
    const start = normalized.length - regWindow;
    const lowReg = regression(normalized.slice(start).map((row, i) => ({ x: start + i, y: row.low })));
    const highReg = regression(normalized.slice(start).map((row, i) => ({ x: start + i, y: row.high })));

    const points = normalized.map((row, idx) => {
      const upper = ma20[idx] != null && std20[idx] != null ? ma20[idx] + std20[idx] * 2 : null;
      const lower = ma20[idx] != null && std20[idx] != null ? ma20[idx] - std20[idx] * 2 : null;
      return {
        ...row,
        ma20: ma20[idx],
        ma50: ma50[idx],
        ma200: ma200[idx],
        bollUpper: upper,
        bollLower: lower,
        rsi: rsi[idx],
        trendSupport: lowReg && idx >= start ? lowReg.m * idx + lowReg.b : null,
        trendResistance: highReg && idx >= start ? highReg.m * idx + highReg.b : null
      };
    });

    return { points, supports, resistances };
  }, [data]);

  const hasData = computed.points.length > 0;

  const priceDomain = useMemo(() => {
    if (!computed.points.length) return ["auto", "auto"];
    const values = [];
    for (const p of computed.points) {
      values.push(p.low, p.high, p.close);
      if (toggles.ma20 && p.ma20 != null) values.push(p.ma20);
      if (toggles.ma50 && p.ma50 != null) values.push(p.ma50);
      if (toggles.ma200 && p.ma200 != null) values.push(p.ma200);
      if (toggles.bollinger && p.bollUpper != null && p.bollLower != null) values.push(p.bollUpper, p.bollLower);
      if (toggles.trendLines && p.trendSupport != null && p.trendResistance != null) values.push(p.trendSupport, p.trendResistance);
    }
    if (toggles.support) values.push(...computed.supports);
    if (toggles.resistance) values.push(...computed.resistances);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.06 || max * 0.02 || 1;
    return [Math.max(0, min - pad), max + pad];
  }, [computed.points, computed.supports, computed.resistances, toggles]);

  function setToggle(key) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const activeInfoCopy = TOGGLE_DEFS.find((item) => item.key === activeInfo);

  return (
    <div className="glass rounded-3xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Educational Chart Lab</p>
        <p className="text-[11px] text-blue-100/65">Source: FMP daily historical data (OHLCV)</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {TOGGLE_DEFS.map((item) => {
          const on = toggles[item.key];
          return (
            <div key={item.key} className="flex items-center gap-2 rounded-xl border border-blue-100/15 bg-white/5 px-2 py-2">
              <button
                type="button"
                onClick={() => setToggle(item.key)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition ${
                  on ? "bg-cyan-300 text-slate-900" : "bg-slate-900/40 text-blue-100"
                }`}
              >
                {item.label}
              </button>
              <button
                type="button"
                aria-label={`About ${item.label}`}
                onClick={() => setActiveInfo((prev) => (prev === item.key ? "" : item.key))}
                className="h-7 w-7 rounded-full border border-cyan-200/35 bg-cyan-400/10 text-xs font-black text-cyan-100"
              >
                i
              </button>
            </div>
          );
        })}
      </div>

      {activeInfoCopy ? (
        <div className="mt-3 rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-3 text-xs text-cyan-50">
          <p className="font-bold uppercase tracking-[0.1em] text-cyan-100">{activeInfoCopy.label}</p>
          <p className="mt-1">
            <span className="font-semibold text-cyan-200">Short term:</span> {activeInfoCopy.shortTerm}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-cyan-200">Long term:</span> {activeInfoCopy.longTerm}
          </p>
        </div>
      ) : null}

      <div className="mt-4 h-[360px]">
        {!hasData ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-blue-100/20 bg-slate-950/40 text-sm text-blue-100/70">
            No chart data available for this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={computed.points} syncId="stocksense-edu" margin={{ top: 12, right: 12, left: 2, bottom: 4 }}>
              <CartesianGrid stroke="rgba(180,210,255,0.14)" strokeDasharray="4 4" />
              <XAxis dataKey="date" tick={{ fill: "#c5dcff", fontSize: 11 }} tickFormatter={(v) => String(v).slice(5)} />
              <YAxis yAxisId="price" tick={{ fill: "#c5dcff", fontSize: 11 }} width={56} domain={priceDomain} />

              <Tooltip
                contentStyle={{ background: "#0b1d4a", border: "1px solid rgba(170,210,255,0.24)", borderRadius: 12 }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name) => {
                  if (name === "Volume") return [formatVolume(value), name];
                  return [`$${toNum(value).toFixed(2)}`, name];
                }}
              />

              {!toggles.candles ? <Line yAxisId="price" dataKey="close" stroke="#56d2ff" strokeWidth={2.1} dot={false} name="Close" /> : null}
              <Line yAxisId="price" dataKey="close" stroke="transparent" dot={false} name="Close" />
              <Customized component={<CandleLayer enabled={toggles.candles} />} />

              {toggles.ma20 ? <Line yAxisId="price" dataKey="ma20" stroke="#f59e0b" dot={false} strokeWidth={1.7} name="MA 20" /> : null}
              {toggles.ma50 ? <Line yAxisId="price" dataKey="ma50" stroke="#22d3ee" dot={false} strokeWidth={1.7} name="MA 50" /> : null}
              {toggles.ma200 ? <Line yAxisId="price" dataKey="ma200" stroke="#a78bfa" dot={false} strokeWidth={1.9} name="MA 200" /> : null}

              {toggles.bollinger ? (
                <>
                  <Line yAxisId="price" dataKey="bollUpper" stroke="#fda4af" strokeDasharray="6 4" dot={false} name="Boll Upper" />
                  <Line yAxisId="price" dataKey="bollLower" stroke="#86efac" strokeDasharray="6 4" dot={false} name="Boll Lower" />
                </>
              ) : null}

              {toggles.support
                ? computed.supports.map((level, idx) => (
                    <ReferenceArea
                      key={`support-zone-${idx}`}
                      yAxisId="price"
                      y1={level * 0.995}
                      y2={level * 1.005}
                      fill="rgba(74,222,128,0.14)"
                      strokeOpacity={0}
                    />
                  ))
                : null}
              {toggles.support
                ? computed.supports.map((level, idx) => (
                    <ReferenceLine
                      key={`support-line-${idx}`}
                      yAxisId="price"
                      y={level}
                      stroke="#4ade80"
                      strokeDasharray="4 4"
                      label={{ value: `Support ${idx + 1}`, fill: "#9ae6b4", fontSize: 10 }}
                    />
                  ))
                : null}

              {toggles.resistance
                ? computed.resistances.map((level, idx) => (
                    <ReferenceArea
                      key={`res-zone-${idx}`}
                      yAxisId="price"
                      y1={level * 0.995}
                      y2={level * 1.005}
                      fill="rgba(251,113,133,0.14)"
                      strokeOpacity={0}
                    />
                  ))
                : null}
              {toggles.resistance
                ? computed.resistances.map((level, idx) => (
                    <ReferenceLine
                      key={`res-line-${idx}`}
                      yAxisId="price"
                      y={level}
                      stroke="#fb7185"
                      strokeDasharray="4 4"
                      label={{ value: `Resistance ${idx + 1}`, fill: "#fecdd3", fontSize: 10 }}
                    />
                  ))
                : null}

              {toggles.trendLines ? (
                <>
                  <Line yAxisId="price" dataKey="trendSupport" stroke="#22c55e" strokeDasharray="8 5" strokeWidth={1.5} dot={false} name="Trend Support" />
                  <Line yAxisId="price" dataKey="trendResistance" stroke="#ef4444" strokeDasharray="8 5" strokeWidth={1.5} dot={false} name="Trend Resistance" />
                </>
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {toggles.volume && hasData ? (
        <div className="mt-4 h-28 rounded-2xl border border-blue-100/15 bg-slate-950/35 p-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-blue-100/70">Volume</p>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={computed.points} syncId="stocksense-edu" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(180,210,255,0.10)" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fill: "#c5dcff", fontSize: 10 }} tickFormatter={formatVolume} width={52} />
              <Tooltip
                contentStyle={{ background: "#0b1d4a", border: "1px solid rgba(170,210,255,0.24)", borderRadius: 12 }}
                formatter={(value) => [formatVolume(value), "Volume"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="volume" fill="rgba(96,165,250,0.52)" name="Volume" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {toggles.rsi && hasData ? (
        <div className="mt-4 h-32 rounded-2xl border border-blue-100/15 bg-slate-950/35 p-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-blue-100/70">RSI (14)</p>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={computed.points} syncId="stocksense-edu" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(180,210,255,0.10)" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} tick={{ fill: "#c5dcff", fontSize: 10 }} width={34} />
              <Tooltip
                contentStyle={{ background: "#0b1d4a", border: "1px solid rgba(170,210,255,0.24)", borderRadius: 12 }}
                formatter={(value) => [toNum(value).toFixed(2), "RSI"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <ReferenceLine y={70} stroke="rgba(251,113,133,0.8)" strokeDasharray="5 4" />
              <ReferenceLine y={30} stroke="rgba(52,211,153,0.8)" strokeDasharray="5 4" />
              <Line dataKey="rsi" stroke="#fbbf24" dot={false} strokeWidth={1.8} name="RSI" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}
