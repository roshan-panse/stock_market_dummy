import { money, pct, tone } from "../../utils/format.js";
import "./StockCard.css";

export default function StockCard({ stock, onClick }) {
  return (
    <button className="stock-card" onClick={onClick}>
      <span className="stock-card-symbol">{stock.symbol}</span>
      <span className="muted small">{stock.companyName}</span>
      <span className="stock-card-price num">{money(stock.currentPrice)}</span>
      <span className={`num ${tone(stock.changePercent)}`}>{pct(stock.changePercent)}</span>
    </button>
  );
}
