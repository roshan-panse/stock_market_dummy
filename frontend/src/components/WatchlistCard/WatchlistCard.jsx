import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WatchlistCard.css";
import { money, pct, tone } from "../../utils/format.js";
import { Loading, Empty } from "../common/State.jsx";

const FILTERS = ["All", "Gain", "Lose"];

export default function WatchlistCard({ symbols, stocks, onRemove }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const rows = (symbols || [])
    .map((sym) => stocks?.find((s) => s.symbol === sym))
    .filter(Boolean)
    .filter((s) => filter === "All" || (filter === "Gain" ? s.changePercent >= 0 : s.changePercent < 0));

  return (
    <section className="dash-card wl">
      <div className="wl-head">
        <h2>Watchlist</h2>
        <div className="pills">
          {FILTERS.map((f) => (
            <button key={f} className={filter === f ? "pill active" : "pill"} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {!symbols || !stocks ? (
        <Loading text="Loading watchlist..." />
      ) : symbols.length === 0 ? (
        <Empty text="Your watchlist is empty. Add stocks from the Stocks page." />
      ) : rows.length === 0 ? (
        <Empty text="Nothing here right now." />
      ) : (
        <ul className="wl-list">
          {rows.map((s) => (
            <li key={s.symbol}>
              <button className="wl-main" onClick={() => navigate(`/stocks/${s.symbol}`)}>
                <span className="ticker-icon">{s.symbol.slice(0, 2)}</span>
                <span className="wl-name">
                  <strong>{s.symbol}</strong>
                  <span className="muted small">{s.sector}</span>
                </span>
                <span className="wl-price num">
                  <strong>{money(s.currentPrice)}</strong>
                  <span className={`small ${tone(s.changePercent)}`}>{pct(s.changePercent)}</span>
                </span>
              </button>
              <button className="wl-remove" aria-label={`Remove ${s.symbol}`} onClick={() => onRemove(s.symbol)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
