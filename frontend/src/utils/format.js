const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
export const money = (n) => inr.format(n);
export const signedMoney = (n) => (n >= 0 ? "+" : "-") + inr.format(Math.abs(n));
export const pct = (n) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
export const tone = (n) => (n >= 0 ? "up" : "down");
export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
