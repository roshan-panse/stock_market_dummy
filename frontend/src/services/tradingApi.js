import { mock } from "./api.js";

// React never decides if a trade is valid. Django will accept or reject it.
export const tradingApi = {
  // Later: POST /trade/buy/
  buyStock: (symbol, quantity) => mock({ ok: true, message: `Buy order for ${quantity} ${symbol} sent.` }, 600),
  // Later: POST /trade/sell/
  sellStock: (symbol, quantity) => mock({ ok: true, message: `Sell order for ${quantity} ${symbol} sent.` }, 600),
};
