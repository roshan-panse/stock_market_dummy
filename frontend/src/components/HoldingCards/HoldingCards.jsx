import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HoldingCards.css";
import { money, pct, tone } from "../../utils/format.js";
import { Empty } from "../common/State.jsx";

export default function HoldingCards({ holdings }) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? holdings : holdings.slice(0, 4);

  return (
    <section className="dash-card">
      <div className="hc-head">
        <h2>My Portfolio</h2>
        {holdings.length > 4 && (
          <button className="pill outline" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show less" : "See all"}
          </button>
        )}
      </div>

      {holdings.length === 0 ? (
        <Empty text="You don't own any stocks yet. Browse Stocks to place your first buy." />
      ) : (
        <div className="hc-grid">
          {shown.map((h) => {
            const plPct = (h.profitLoss / h.invested) * 100;
            return (
              <button key={h.symbol} className="hc-card" onClick={() => navigate(`/stocks/${h.symbol}`)}>
                <strong className="num hc-value">{money(h.currentValue)}</strong>
                <span className={`small num ${tone(h.profitLoss)}`}>{pct(plPct)}</span>
                <span className="hc-foot">
                  <span className="ticker-icon">{h.symbol.slice(0, 2)}</span>
                </span>
                <span className="hc-meta small">
                  <span>{h.symbol}</span>
                  <span className="muted">Units <strong>{h.quantity}</strong></span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
