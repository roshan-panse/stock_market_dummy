import { mock, mockError } from "./api.js";
import { stocks, makePriceHistory } from "../utils/mockData.js";

export const stockApi = {
  getStocks: () => mock(stocks),
  getStock: (symbol) => {
    const s = stocks.find((x) => x.symbol === symbol);
    return s ? mock(s) : mockError("Stock not found");
  },
  getPriceHistory: (symbol, range) => {
    const s = stocks.find((x) => x.symbol === symbol);
    return s ? mock(makePriceHistory(s, range), 250) : mockError("Stock not found");
  },
};
