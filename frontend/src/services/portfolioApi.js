import { mock } from "./api.js";
import { stocks, holdings, cashBalance, transactions, makePriceHistory } from "../utils/mockData.js";

// range -> [number of points, milliseconds between points]
const STEP = { "1D": [48, 0], "1W": [35, 4.8 * 3600e3], "1M": [30, 864e5], "6M": [60, 3 * 864e5], "1Y": [52, 7 * 864e5] };
const MONTH = (d) => d.toLocaleDateString("en-IN", { month: "short" });

export const portfolioApi = {
  // Later: GET /portfolio/  (Django will do these calculations)
  getPortfolio: () => {
    const rows = holdings.map((h) => {
      const s = stocks.find((x) => x.symbol === h.symbol);
      const invested = h.quantity * h.avgPrice;
      const value = h.quantity * s.currentPrice;
      return {
        ...h,
        companyName: s.companyName,
        sector: s.sector,
        currentPrice: s.currentPrice,
        invested,
        currentValue: value,
        profitLoss: +(value - invested).toFixed(2),
      };
    });
    const invested = rows.reduce((a, r) => a + r.invested, 0);
    const holdingsValue = rows.reduce((a, r) => a + r.currentValue, 0);
    const profitLoss = holdingsValue - invested;
    const bySector = {};
    rows.forEach((r) => (bySector[r.sector] = (bySector[r.sector] || 0) + r.currentValue));
    return mock({
      summary: {
        totalValue: holdingsValue + cashBalance,
        invested,
        profitLoss,
        profitLossPercent: (profitLoss / invested) * 100,
        cash: cashBalance,
      },
      holdings: rows,
      allocation: Object.entries(bySector).map(([sector, value]) => ({ sector, value })),
    });
  },
  getTransactions: () => mock(transactions),

  // Later: GET /portfolio/performance/?range=1Y
  // Total portfolio value (holdings + cash) over time, built from each stock's price history.
  getPerformance: (range) => {
    const histories = holdings.map((h) => ({
      qty: h.quantity,
      points: makePriceHistory(stocks.find((x) => x.symbol === h.symbol), range),
    }));
    const [n, step] = STEP[range] ?? STEP["1M"];
    const now = Date.now();
    let prevMonth = "";
    const data = Array.from({ length: n }, (_, i) => {
      const value = histories.reduce((a, h) => a + h.qty * h.points[i].price, cashBalance);
      const d = new Date(now - (n - 1 - i) * step);
      let label, full;
      if (range === "1D") {
        label = full = histories[0].points[i].label;
      } else if (range === "1Y" || range === "6M") {
        const m = MONTH(d);
        label = m !== prevMonth ? m : ""; // show each month name once
        prevMonth = m;
        full = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      } else {
        label = range === "1W" ? d.toLocaleDateString("en-IN", { weekday: "short" }) : String(d.getDate());
        full = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      }
      return { label, full, value: Math.round(value) };
    });
    return mock(data, 250);
  },
};
