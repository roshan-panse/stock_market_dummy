import { useState, useMemo, useEffect } from "react";

import "./Stocks.css";
import useAsync from "../../hooks/useAsync.js";
import { stockApi } from "../../services/stockApi.js";
import { watchlistApi } from "../../services/watchlistApi.js";
import StockTable from "../../components/StockTable/StockTable.jsx";
import { Loading, Empty, ErrorState } from "../../components/common/State.jsx";


export default function Stocks() {


 

  const { data, loading, error, reload } = useAsync(() => stockApi.getStocks(), []);


  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [sort, setSort] = useState("symbol");
  const [watch, setWatch] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    watchlistApi.getWatchlist().then(setWatch);
  }, []);
  const toggleWatch = async (symbol) => {
    const item = watch.find((entry) => entry.symbol === symbol);

    if (item) {
      await watchlistApi.removeFromWatchlist(item.id);
    } else {
      await watchlistApi.addToWatchlist(symbol);
    }

    const updated = await watchlistApi.getWatchlist();
    setWatch(updated);
  };
  const sectors = useMemo(() => ["All", ...new Set((data || []).map((s) => s.sector))], [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const list = data.filter(
      (s) =>
        (sector === "All" || s.sector === sector) &&
        (!q || s.symbol.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q))
    );
    const sorters = {
      symbol: (a, b) => a.symbol.localeCompare(b.symbol),
      price: (a, b) => b.currentPrice - a.currentPrice,
      gainers: (a, b) => b.changePercent - a.changePercent,
      losers: (a, b) => a.changePercent - b.changePercent,
    };
    return [...list].sort(sorters[sort]);
  }, [data, query, sector, sort]);

  return (
    <div className="stack">
      <div className="stocks-title">
        <h1 className="page-title">Stocks</h1>

      
      </div>
      {lastUpdated && (
        <p className="muted small">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
      <div className="toolbar">
        <input className="search" placeholder="Search by symbol or company" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Sector">
          {sectors.map((s) => <option key={s} value={s}>{s === "All" ? "All sectors" : s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="symbol">Sort: A to Z</option>
          <option value="price">Sort: Highest price</option>
          <option value="gainers">Sort: Top gainers</option>
          <option value="losers">Sort: Top losers</option>
        </select>
      </div>

      {loading && !data && <Loading text="Loading stocks..." />}
      {error && <ErrorState text="Unable to load stocks. Please try again." onRetry={reload} />}
      {data && (rows.length ? (
        <StockTable stocks={rows} watchlist={watch} onToggleWatch={toggleWatch} />
      ) : (
        <Empty text="No stocks match your search." />
      ))}
    </div>
  );
}
