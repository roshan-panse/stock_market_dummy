import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "./PriceChart.css";
import { money } from "../../utils/format.js";

export default function PriceChart({ data, positive = true }) {
  const color = positive ? "#3ddc97" : "#ff6b6b";
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
          <XAxis dataKey="label" hide />
          <YAxis domain={["auto", "auto"]} width={64} tick={{ fill: "#8b94a3", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => Math.round(v)} />
          <Tooltip
            contentStyle={{ background: "#1a121a", border: "1px solid rgba(217,167,211,.25)", borderRadius: 8 }}
            labelStyle={{ color: "#8b94a3" }}
            formatter={(v) => [money(v), "Price"]}
          />
          <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
