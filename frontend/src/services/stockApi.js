const API_URL = import.meta.env.VITE_API_URL;
import { apiFetch } from "./api.js";

export const stockApi = {
  getStocks: async () => {
    const response = await fetch(`${API_URL}/stocks/`);

    if (!response.ok) {
      throw new Error("Failed to fetch stocks");
    }

    return response.json();
  },

  getStock: async (symbol) => {
    const response = await fetch(`${API_URL}/stocks/`);

    if (!response.ok) {
      throw new Error("Failed to fetch stocks");
    }

    const stocks = await response.json();

    const stock = stocks.find((s) => s.symbol === symbol);

    if (!stock) {
      throw new Error("Stock not found");
    }

    return stock;
  },

  getPriceHistory: async (symbol, range) => {
  const response = await fetch(
    `${API_URL}/stocks/${symbol}/price-history/?range=${range}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch price history");
  }

  return response.json();
},




 getMarketStatus: () => {
  return apiFetch("/stocks/market-status/");
},
};