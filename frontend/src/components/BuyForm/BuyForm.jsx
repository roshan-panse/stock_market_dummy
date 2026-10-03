import { useState } from "react";
import "./BuyForm.css";
import { money } from "../../utils/format.js";
import { tradingApi } from "../../services/tradingApi.js";
import QuantityField from "./QuantityField.jsx";

export default function BuyForm({ stock, cash, onSuccess }) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const total = qty * stock.currentPrice;

const confirm = async () => {
  setBusy(true);
  setMsg("");

  try {
    const res = await tradingApi.buyStock(stock.symbol, qty);

    // Show success message
    setMsg(res.message);

    // Wait 2 seconds before refreshing portfolio
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      }
    }, 2000);
  } catch (error) {
    setMsg(error.message || "Buy order failed.");
  } finally {
    setBusy(false);
  }
};
  return (
    <div className="trade-form">
      <Row label="Current price" value={money(stock.currentPrice)} />

      <div className="field-label">Quantity</div>

      <QuantityField value={qty} onChange={setQty} />

      <Row label="Estimated total" value={money(total)} strong />

      <Row label="Available cash" value={money(cash)} />

      <button
        className="btn btn-primary btn-block"
        disabled={busy}
        onClick={confirm}
      >
        {busy ? "Sending..." : "Confirm buy"}
      </button>

      {msg && <p className="trade-msg">{msg}</p>}
    </div>
  );
}

export function Row({ label, value, strong }) {
  return (
    <div className="row">
      <span className="muted">{label}</span>
      <span className={`num ${strong ? "strong" : ""}`}>
        {value}
      </span>
    </div>
  );
}