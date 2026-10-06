import { apiFetch } from "./api.js";

export const watchlistApi = {
  getWatchlist: async () => {
    return apiFetch("/watchlist/");
  },

  addToWatchlist: async (symbol) => {
    return apiFetch("/watchlist/add/", {
      method: "POST",
      body: JSON.stringify({
        symbol,
      }),
    });
  },

  removeFromWatchlist: async (id) => {
    return apiFetch(`/watchlist/${id}/`, {
      method: "DELETE",
    });
  },
};