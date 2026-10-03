import { useState } from "react";
import "./StockDetails.css";
import { useParams, Link } from "react-router-dom";
import useAsync from "../../hooks/useAsync.js";
import { stockApi } from "../../services/stockApi.js";
import { portfolioApi } from "../../services/portfolioApi.js";
import PriceChart from "../../components/PriceChart/PriceChart.jsx";
import BuyForm from "../../components/BuyForm/BuyForm.jsx";
import SellForm from "../../components/SellForm/SellForm.jsx";
import { Loading, ErrorState } from "../../components/common/State.jsx";
import { money, signedMoney, pct, tone } from "../../utils/format.js";

const RANGES = ["1D", "1W", "1M", "6M", "1Y"];

function StockHeader({ stock }) {
  return (
    <div className="stock-header">
      <div>
        <h1 className="page-title">{stock.symbol}</h1>
        <p className="muted">{stock.companyName}</p>
      </div>
      <div className="stock-header-price">
        <span className="big num">{money(stock.currentPrice)}</span>
        <span className={`num ${tone(stock.change)}`}>
          {signedMoney(stock.change)} ({pct(stock.changePercent)})
        </span>
      </div>
    </div>
  );
}

function StockStats({ stock }) {
  const items = [["Previous close", money(stock.previousClose)], ["Open", money(stock.open)], ["Sector", stock.sector]];
  return (
    <div className="stats">
      {items.map(([k, v]) => (
        <div key={k}><span className="muted small">{k}</span><span className="num">{v}</span></div>
      ))}
    </div>
  );
}

function ChartSection({ stock }) {
  const [range, setRange] = useState("1M");
  const hist = useAsync(() => stockApi.getPriceHistory(stock.symbol, range), [stock.symbol, range]);
  return (
    <section className="card">
      <div className="tabs">
        {RANGES.map((r) => (
          <button key={r} className={r === range ? "tab active" : "tab"} onClick={() => setRange(r)}>{r}</button>
        ))}
      </div>
      {hist.loading && <Loading text="Loading chart..." />}
      {hist.error && <ErrorState text="Unable to load the chart." onRetry={hist.reload} />}
      {hist.data && <PriceChart data={hist.data} positive={stock.change >= 0} />}
    </section>
  );
}

export default function StockDetails() {
  const { symbol } = useParams();
  const [side, setSide] = useState("buy");
  const stock = useAsync(() => stockApi.getStock(symbol), [symbol]);
  const portfolio = useAsync(() => portfolioApi.getPortfolio(), []);

  if (stock.loading) return <Loading text="Loading stock..." />;
  if (stock.error) return (
    <div className="stack">
      <ErrorState text={`Unable to find ${symbol}.`} />
      <Link to="/stocks" className="link">Back to all stocks</Link>
    </div>
  );

  const s = stock.data;
  const cash = portfolio.data?.summary.cash ?? 0;
  const owned = portfolio.data?.holdings.find((h) => h.symbol === s.symbol)?.quantity ?? 0;

  return (
    <div className="stack">
      <Link to="/stocks" className="link small">← All stocks</Link>
      <StockHeader stock={s} />
      <div className="details-grid">
        <div className="stack">
          <ChartSection stock={s} />
          <StockStats stock={s} />
        </div>
        <section className="card trade-panel">
          <div className="tabs">
            <button className={side === "buy" ? "tab active" : "tab"} onClick={() => setSide("buy")}>Buy</button>
            <button className={side === "sell" ? "tab active" : "tab"} onClick={() => setSide("sell")}>Sell</button>
          </div>
          <h2>{side === "buy" ? "Buy" : "Sell"} {s.symbol}</h2>
          {portfolio.loading ? <Loading /> : side === "buy" ? <BuyForm
            key="b"
            stock={s}
            cash={cash}
            onSuccess={portfolio.reload}
          /> : <SellForm key="s" stock={s} owned={owned} />}
          <p className="muted small">The server checks every order. This screen only shows an estimate.</p>
        </section>
      </div>
    </div>
  );
}
