"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function PriceChart({ data }) {
  return (
    <div className="glass h-80 rounded-3xl p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-blue-100/70">Price Trend</p>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4fd2ff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#4fd2ff" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(180,210,255,0.14)" strokeDasharray="4 4" />
            <XAxis dataKey="date" tick={{ fill: "#c5dcff", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fill: "#c5dcff", fontSize: 11 }} width={56} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#0b1d4a", border: "1px solid rgba(170,210,255,0.24)", borderRadius: 12 }}
              formatter={(value) => [`$${value}`, "Price"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area type="monotone" dataKey="close" stroke="#56d2ff" strokeWidth={2.2} fill="url(#areaFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
