import { useMemo } from "react";
import "./Portfolio.css";
import useAsync from "../../hooks/useAsync.js";
import { portfolioApi } from "../../services/portfolioApi.js";
import PerformanceChart from "../../components/PerformanceChart/PerformanceChart.jsx";
import SectorAllocation, { COLORS } from "../../components/PortfolioSummary/SectorAllocation.jsx";
import { Loading, ErrorState } from "../../components/common/State.jsx";
import { money, signedMoney, pct, tone } from "../../utils/format.js";

// Group holdings by sector: money invested, current value, P/L and the stocks inside.
// Sector order follows `allocation` so colours match the donut chart.
function bySector(holdings, allocation) {
  const map = {};
  holdings.forEach((h) => {
    const s = (map[h.sector] ??= { sector: h.sector, invested: 0, value: 0, stocks: [] });
    s.invested += h.invested;
    s.value += h.currentValue;
    s.stocks.push(h.symbol);
  });
  return allocation
    .map((a) => map[a.sector])
    .filter(Boolean)
    .map((s) => ({ ...s, profitLoss: s.value - s.invested, plPercent: ((s.value - s.invested) / s.invested) * 100 }));
}

function Stat({ label, children, sub }) {
  return (
    <section className="dash-card pf-stat">
      <span className="muted small">{label}</span>
      <span className="pf-stat-value num">{children}</span>
      {sub}
    </section>
  );
}

export default function Portfolio() {
  const portfolio = useAsync(() => portfolioApi.getPortfolio(), []);
  const { data } = portfolio;

  const sectors = useMemo(() => (data ? bySector(data.holdings, data.allocation) : []), [data]);
  const totalInvested = data?.summary.invested ?? 0;
  const holdingsValue = data ? data.summary.totalValue - data.summary.cash : 0;

  return (
    <div className="dash">
      <header>
        <h1 className="dash-title">My <span>Portfolio</span></h1>
        <p className="muted small">Performance, allocation and where your money is invested</p>
      </header>

      {portfolio.loading && <Loading text="Loading portfolio..." />}
      {portfolio.error && <ErrorState text="Unable to load your portfolio. Please try again." onRetry={portfolio.reload} />}

      {data && (
        <>
          <div className="pf-stats">
            <Stat label="Total portfolio value">{money(data.summary.totalValue)}</Stat>
            <Stat label="Money invested">{money(data.summary.invested)}</Stat>
            <Stat label="Current holdings value">{money(holdingsValue)}</Stat>
            <Stat
              label="Profit / loss"
              sub={<span className={`small num ${tone(data.summary.profitLoss)}`}>{pct(data.summary.profitLossPercent)}</span>}
            >
              <span className={tone(data.summary.profitLoss)}>{signedMoney(data.summary.profitLoss)}</span>
            </Stat>
          </div>

          <PerformanceChart />

          <div className="pf-mid">
            <section className="dash-card">
              <h2>Sector allocation</h2>
              <p className="muted small pf-note">Share of your holdings by current value</p>
              <SectorAllocation data={data.allocation} />
            </section>

            <section className="dash-card">
              <h2>Invested by sector</h2>
              <p className="muted small pf-note">How much of your {money(totalInvested)} went into each sector</p>
              <ul className="pf-sectors">
                {sectors.map((s, i) => {
                  const share = (s.invested / totalInvested) * 100;
                  return (
                    <li key={s.sector}>
                      <div className="pf-sector-top">
                        <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
                        <strong>{s.sector}</strong>
                        <span className="num pf-invested">{money(s.invested)}</span>
                      </div>
                      <div className="pf-bar" aria-hidden="true">
                        <span style={{ width: `${share}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <div className="pf-sector-meta small">
                        <span className="muted">{share.toFixed(1)}% of invested · {s.stocks.join(", ")}</span>
                        <span className={`num ${tone(s.profitLoss)}`}>{signedMoney(s.profitLoss)} ({pct(s.plPercent)})</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
