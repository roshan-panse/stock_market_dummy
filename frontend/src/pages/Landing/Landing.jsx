import { useMemo } from "react";
import "./Landing.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import useAsync from "../../hooks/useAsync.js";
import { stockApi } from "../../services/stockApi.js";
import StockCard from "../../components/StockCard/StockCard.jsx";
import { Loading, ErrorState } from "../../components/common/State.jsx";

const FEATURES = [
  { title: "Practice with virtual cash", text: "Every account starts with pretend money, so you can learn without risking a rupee." },
  { title: "Buy and sell stocks", text: "Place orders, watch your holdings, and see what each decision did to your returns." },
  { title: "Track your portfolio", text: "See invested amount, current value, profit or loss, and how your money is spread across sectors." },
  { title: "Keep a watchlist", text: "Follow stocks you are curious about and check back on them any time." },
];

export default function Landing() {
  const { user, openAuth } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => stockApi.getStocks(), []);

  // Pick 6 random stocks each time the page loads
  const picks = useMemo(() => (data ? [...data].sort(() => Math.random() - 0.5).slice(0, 6) : []), [data]);

  // Visitors who are not logged in are asked to log in before opening a stock
  const openStock = (symbol) => (user ? navigate(`/stocks/${symbol}`) : openAuth("login"));

  return (
    <div className="landing">
      <section className="hero">
        <h1>Learn to invest before you invest.</h1>
        <p className="hero-sub">
          Paperfolio is a stock market simulator. Trade real-looking stocks with virtual money,
          build a portfolio, and learn how markets move at your own pace.
        </p>
        <div className="hero-actions">
          {user ? (
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/dashboard")}>Go to dashboard</button>
          ) : (
            <>
              <button className="btn btn-primary btn-lg" onClick={() => openAuth("signup")}>Sign up free</button>
              <button className="btn btn-ghost btn-lg" onClick={() => openAuth("login")}>Log in</button>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Stocks you can trade</h2>
        {loading && <Loading text="Loading stocks..." />}
        {error && <ErrorState text="Unable to load stocks. Please try again." onRetry={reload} />}
        {data && (
          <div className="card-grid">
            {picks.map((s) => (
              <StockCard key={s.symbol} stock={s} onClick={() => openStock(s.symbol)} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>What you can do</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer muted small">
        Paperfolio is a learning project. Prices and money are simulated and nothing here is financial advice.
      </footer>
    </div>
  );
}
