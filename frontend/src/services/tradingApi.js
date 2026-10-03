import { apiFetch } from "./api.js";

export const tradingApi = {
  buyStock: (symbol, quantity) => {
    return apiFetch("/trading/buy/", {
      method: "POST",
      body: JSON.stringify({
        symbol,
        quantity,
      }),
    });
  },

  // Sell will be connected later.
  sellStock: async () => {
    throw new Error("Sell is not available yet.");
  },
};