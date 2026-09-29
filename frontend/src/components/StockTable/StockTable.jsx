import { useNavigate } from "react-router-dom";
import { money, pct, signedMoney, tone } from "../../utils/format.js";

// `watchlist` (array of symbols) and `onToggleWatch` are optional.
export default function StockTable({ stocks, watchlist, onToggleWatch }) {
  const navigate = useNavigate();
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th><th>Company</th><th className="r">Price</th><th className="r">Change</th>
            <th className="r">Change %</th><th className="r">Prev. close</th><th>Sector</th>
            {onToggleWatch && <th></th>}
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr key={s.symbol} className="clickable" onClick={() => navigate(`/stocks/${s.symbol}`)}>
              <td><strong>{s.symbol}</strong></td>
              <td>{s.companyName}</td>
              <td className="r num">{money(s.currentPrice)}</td>
              <td className={`r num ${tone(s.change)}`}>{signedMoney(s.change)}</td>
              <td className={`r num ${tone(s.changePercent)}`}>{pct(s.changePercent)}</td>
              <td className="r num">{money(s.previousClose)}</td>
              <td>{s.sector}</td>
              {onToggleWatch && (
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={() => onToggleWatch(s.symbol)}>
                    {watchlist.includes(s.symbol) ? "Remove" : "Watch"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
