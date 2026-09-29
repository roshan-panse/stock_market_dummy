import { useState, useRef } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "./PerformanceChart.css";
import useAsync from "../../hooks/useAsync.js";
import { portfolioApi } from "../../services/portfolioApi.js";
import { money } from "../../utils/format.js";
import { ErrorState } from "../common/State.jsx";

const RANGES = ["1D", "1W", "1M", "6M", "1Y"];
const MAUVE = "#d9a7d3";
const compact = (v) => `${(v / 1e3).toFixed(1)}k`;

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="perf-tip">
      <span className="muted small">{p.full}</span>
      <strong className="num">{money(p.value)}</strong>
    </div>
  );
}

export default function PerformanceChart() {
  const [range, setRange] = useState("1Y");
  const perf = useAsync(() => portfolioApi.getPerformance(range), [range]);
  const last = useRef(null);
  if (perf.data) last.current = perf.data;
  const data = perf.data ?? last.current; // keep the old chart while the next range loads

  return (
    <section className="dash-card">
      <div className="perf-head">
        <h2>Portfolio Performance</h2>
        <div className="pills">
          {RANGES.map((r) => (
            <button key={r} className={range === r ? "pill outline active" : "pill outline"} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {perf.error ? (
        <ErrorState text="Unable to load performance." onRetry={perf.reload} />
      ) : (
        <div className="perf-box">
          {data && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={MAUVE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={MAUVE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
                <XAxis dataKey="label" interval={0} axisLine={false} tickLine={false} tick={{ fill: "#8b94a3", fontSize: 11 }} />
                <YAxis domain={["auto", "auto"]} width={56} axisLine={false} tickLine={false} tick={{ fill: "#8b94a3", fontSize: 11 }} tickFormatter={compact} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: MAUVE, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="value" stroke={MAUVE} strokeWidth={2} fill="url(#perfFill)" activeDot={{ r: 6, fill: MAUVE, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </section>
  );
}
