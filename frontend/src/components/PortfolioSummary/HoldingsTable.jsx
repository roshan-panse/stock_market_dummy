import { useNavigate } from "react-router-dom";
import { money, signedMoney, tone } from "../../utils/format.js";

export default function HoldingsTable({ holdings }) {
  const navigate = useNavigate();
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Stock</th><th className="r">Qty</th><th className="r">Avg price</th>
            <th className="r">Current</th><th className="r">Invested</th><th className="r">P/L</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.symbol} className="clickable" onClick={() => navigate(`/stocks/${h.symbol}`)}>
              <td><strong>{h.symbol}</strong></td>
              <td className="r num">{h.quantity}</td>
              <td className="r num">{money(h.avgPrice)}</td>
              <td className="r num">{money(h.currentPrice)}</td>
              <td className="r num">{money(h.invested)}</td>
              <td className={`r num ${tone(h.profitLoss)}`}>{signedMoney(h.profitLoss)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
