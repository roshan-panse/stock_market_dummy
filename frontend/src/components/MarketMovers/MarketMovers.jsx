
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { money, pct, tone } from "../../utils/format.js";
import { Loading, Empty } from "../common/State.jsx";
import "./MarketMovers.css";
export default function MarketMovers({ stocks, loading, error }) {
  const [mode, setMode] = useState("gainers");
  const navigate = useNavigate();

  const movers = useMemo(() => {
    if (!Array.isArray(stocks)) return [];

    const sorted = [...stocks].sort(
      (a, b) =>
        Number(b.changePercent ?? 0) -
        Number(a.changePercent ?? 0)
    );

    return mode === "gainers"
      ? sorted.filter((s) => Number(s.changePercent) > 0).slice(0, 5)
      : sorted
          .filter((s) => Number(s.changePercent) < 0)
          .sort(
            (a, b) =>
              Number(a.changePercent) -
              Number(b.changePercent)
          )
          .slice(0, 5);
  }, [stocks, mode]);

  return (
    <section className="dash-card market-movers">
      <div className="section-head">
        <h2>Market Movers</h2>
        <div className="pills">
          <button
            className={mode === "gainers" ? "pill active" : "pill"}
            onClick={() => setMode("gainers")}
          >
            Top gainers
          </button>
          <button
            className={mode === "losers" ? "pill active" : "pill"}
            onClick={() => setMode("losers")}
          >
            Top losers
          </button>
        </div>
      </div>

      {loading && <Loading text="Loading market data..." />}

      {error && (
        <p className="muted small">
          Market data is currently unavailable.
        </p>
      )}

      {!loading && !error && movers.length === 0 && (
        <Empty text="No gainers or losers to show right now." />
      )}

      {!loading && !error && movers.length > 0 && (
        <div className="mover-list">
          {movers.map((stock) => (
            <button
              key={stock.symbol}
              className="mover-row"
              onClick={() => navigate(`/stocks/${stock.symbol}`)}
            >
              <span className="mover-symbol">
                <strong>{stock.symbol}</strong>
                <span className="muted small">
                  {stock.companyName}
                </span>
              </span>

              <span className="mover-price">
                <strong className="num">
                  {money(stock.currentPrice)}
                </strong>
                <span className={`small ${tone(stock.changePercent)}`}>
                  {pct(stock.changePercent)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        className="link small"
        onClick={() => navigate("/stocks")}
      >
        View all stocks →
      </button>
    </section>
  );
}
