import { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import useAsync from "../../hooks/useAsync.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { portfolioApi } from "../../services/portfolioApi.js";
import { stockApi } from "../../services/stockApi.js";
import { watchlistApi } from "../../services/watchlistApi.js";
import WatchlistCard from "../../components/WatchlistCard/WatchlistCard.jsx";
import HoldingCards from "../../components/HoldingCards/HoldingCards.jsx";
import PerformanceChart from "../../components/PerformanceChart/PerformanceChart.jsx";
import SectorAllocation from "../../components/PortfolioSummary/SectorAllocation.jsx";
import TransactionTable from "../../components/TransactionTable/TransactionTable.jsx";
import { Loading, Empty, ErrorState } from "../../components/common/State.jsx";
import { money, signedMoney, pct, tone } from "../../utils/format.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const portfolio = useAsync(() => portfolioApi.getPortfolio(), []);
  const stocks = useAsync(() => stockApi.getStocks(), []);
  const txns = useAsync(() => portfolioApi.getTransactions(), []);
  const [watch, setWatch] = useState(null);
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    watchlistApi.getWatchlist().then(setWatch);
  }, []);

  const remove = (symbol) => watchlistApi.removeFromWatchlist(symbol).then(setWatch);
  const summary = portfolio.data?.summary;

  return (
    <div className="dash">
      <header>
        <h1 className="dash-title">Welcome, <span>{user?.username}</span></h1>
        <p className="muted small">Here's your investment portfolio overview</p>
      </header>

      {portfolio.loading && <Loading text="Loading portfolio..." />}
      {portfolio.error && <ErrorState text="Unable to load your portfolio. Please try again." onRetry={portfolio.reload} />}

      {portfolio.data && (
        <div className="dash-top">
          <div className="dash-left">
            <section className="dash-card">
              <span className="muted">Total Holding</span>
              <span className="dash-big num">{money(summary.totalValue)}</span>
              <span className={`num small ${tone(summary.profitLoss)}`}>
                {signedMoney(summary.profitLoss)} ({pct(summary.profitLossPercent)})
              </span>
            </section>

            <section className="dash-card dash-glow">
              <h2>Ready for your next trade?</h2>
              <p className="muted small">
                You have <strong className="num">{money(summary.cash)}</strong> available to invest.
              </p>
              <button className="pill filled" onClick={() => navigate("/stocks")}>Explore stocks</button>
            </section>
          </div>

          <WatchlistCard symbols={watch} stocks={stocks.data} onRemove={remove} />
          <HoldingCards holdings={portfolio.data.holdings} />
        </div>
      )}

      <PerformanceChart />

      <div className="dash-bottom">
        <section className="dash-card">
          <div className="section-head">
            <h2>Recent transactions</h2>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
              <option value="ALL">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
          {txns.loading && <Loading text="Loading transactions..." />}
          {txns.error && <ErrorState text="Unable to load transactions. Please try again." onRetry={txns.reload} />}
          {txns.data && (() => {
            const rows = txns.data.filter((t) => typeFilter === "ALL" || t.type === typeFilter);
            return rows.length ? <TransactionTable transactions={rows} /> : <Empty text="No transactions match this filter." />;
          })()}
        </section>

        {portfolio.data && (
          <section className="dash-card">
            <h2>Sector allocation</h2>
            <SectorAllocation data={portfolio.data.allocation} />
          </section>
        )}
      </div>
    </div>
  );
}
