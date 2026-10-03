import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./SectorAllocation.css";
import { money } from "../../utils/format.js";

export const COLORS = ["#e13e10", "#ee0dd0", "#240ee8", "#32f518fa", "#22e18e"];

export default function SectorAllocation({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="alloc">
      <div className="alloc-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="sector" innerRadius="60%" outerRadius="90%" stroke="none">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1a121a", border: "1px solid rgba(217,167,211,.25)", borderRadius: 8 }}
              itemStyle={{ color: "#e6e9ee" }}
              formatter={(v) => money(v)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="legend">
        {data.map((d, i) => (
          <li key={d.sector}>
            <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
            <span>{d.sector}</span>
            <span className="num muted">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
