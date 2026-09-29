import { money, signedMoney, pct, tone } from "../../utils/format.js";
import "./PortfolioSummary.css";

export default function PortfolioSummary({ summary }) {
  return (
    <div className="summary-grid">
      <div className="card summary-main">
        <span className="muted">Total portfolio value</span>
        <span className="big num">{money(summary.totalValue)}</span>
      </div>
      <div className="card">
        <span className="muted">Invested</span>
        <span className="mid num">{money(summary.invested)}</span>
      </div>
      <div className="card">
        <span className="muted">Profit / loss</span>
        <span className={`mid num ${tone(summary.profitLoss)}`}>{signedMoney(summary.profitLoss)}</span>
        <span className={`small num ${tone(summary.profitLoss)}`}>{pct(summary.profitLossPercent)}</span>
      </div>
      <div className="card">
        <span className="muted">Available cash</span>
        <span className="mid num">{money(summary.cash)}</span>
      </div>
    </div>
  );
}
