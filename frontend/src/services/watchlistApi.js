import { mock } from "./api.js";
import { watchlistSymbols } from "../utils/mockData.js";

let list = [...watchlistSymbols]; // stands in for the database

export const watchlistApi = {
  getWatchlist: () => mock(list, 250),
  addToWatchlist: (symbol) => {
    if (!list.includes(symbol)) list = [...list, symbol];
    return mock(list, 150);
  },
  removeFromWatchlist: (symbol) => {
    list = list.filter((s) => s !== symbol);
    return mock(list, 150);
  },
};
