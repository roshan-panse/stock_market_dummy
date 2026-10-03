import { apiFetch } from "./api.js";

export const portfolioApi = {
  getPortfolio: async () => {
    return apiFetch("/portfolio/");
  },

  getTransactions: async () => {
    return [];
  },

  getPerformance: async () => {
    return [];
  },
};