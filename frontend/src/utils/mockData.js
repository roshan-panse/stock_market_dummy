// Central mock data. Shapes mirror what a Django REST API would return.
const make = (id, symbol, companyName, sector, currentPrice, previousClose) => ({
  id,
  symbol,
  companyName,
  sector,
  currentPrice,
  previousClose,
  open: +(previousClose * 1.002).toFixed(2),
  change: +(currentPrice - previousClose).toFixed(2),
  changePercent: +(((currentPrice - previousClose) / previousClose) * 100).toFixed(2),
});

export const stocks = [
  make(1, "RELIANCE", "Reliance Industries", "Energy", 2850.4, 2815.6),
  make(2, "TCS", "Tata Consultancy Services", "IT", 3421.2, 3439.4),
  make(3, "INFY", "Infosys", "IT", 1542.8, 1510.6),
  make(4, "HDFCBANK", "HDFC Bank", "Banking", 1680.0, 1666.0),
  make(5, "ICICIBANK", "ICICI Bank", "Banking", 1124.5, 1131.2),
  make(6, "ONGC", "Oil & Natural Gas Corp", "Energy", 265.3, 262.1),
  make(7, "SUNPHARMA", "Sun Pharmaceutical", "Pharma", 1710.9, 1698.4),
  make(8, "DRREDDY", "Dr. Reddy's Laboratories", "Pharma", 1285.6, 1297.3),
  make(9, "WIPRO", "Wipro", "IT", 462.7, 458.9),
  make(10, "SBIN", "State Bank of India", "Banking", 812.4, 806.7),
];

// Deterministic random walk that ends at the stock's current price.
const POINTS = { "1D": 48, "1W": 35, "1M": 30, "6M": 60, "1Y": 52 };
export function makePriceHistory(stock, range) {
  const n = POINTS[range] ?? 30;
  let seed = stock.id * 97 + n;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280) - 0.5;
  const raw = [0];
  for (let i = 1; i < n; i++) raw.push(raw[i - 1] + rand());
  const drift = raw[n - 1];
  const scale = stock.currentPrice * 0.012;
  return raw.map((v, i) => ({
    label: range === "1D" ? `${9 + Math.floor(i / 8)}:${String((i % 8) * 7 + 15).padStart(2, "0")}` : `#${i + 1}`,
    price: +(stock.currentPrice + (v - drift) * scale).toFixed(2),
  }));
}

export const holdings = [
  { id: 1, symbol: "RELIANCE", quantity: 20, avgPrice: 2700 },
  { id: 2, symbol: "TCS", quantity: 10, avgPrice: 3300 },
  { id: 3, symbol: "INFY", quantity: 15, avgPrice: 1500 },
  { id: 4, symbol: "HDFCBANK", quantity: 12, avgPrice: 1600 },
  { id: 5, symbol: "SUNPHARMA", quantity: 6, avgPrice: 1650 },
];

export const cashBalance = 35500;

export const watchlistSymbols = ["RELIANCE", "TCS", "INFY", "SBIN", "WIPRO"];

export const transactions = [
  { id: 1, date: "2026-09-28", symbol: "RELIANCE", type: "BUY", quantity: 10, price: 2800 },
  { id: 2, date: "2026-09-27", symbol: "TCS", type: "BUY", quantity: 5, price: 3300 },
  { id: 3, date: "2026-09-25", symbol: "INFY", type: "SELL", quantity: 3, price: 1500 },
  { id: 4, date: "2026-09-22", symbol: "HDFCBANK", type: "BUY", quantity: 12, price: 1600 },
  { id: 5, date: "2026-09-18", symbol: "SUNPHARMA", type: "BUY", quantity: 6, price: 1650 },
  { id: 6, date: "2026-09-12", symbol: "ONGC", type: "SELL", quantity: 20, price: 258 },
];
