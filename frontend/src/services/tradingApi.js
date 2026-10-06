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


  sellStock: (symbol, quantity) => {
  return apiFetch("/trading/sell/", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      quantity,
    }),
  });
},
};