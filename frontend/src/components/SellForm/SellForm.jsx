import { useState } from "react";
import "../BuyForm/BuyForm.css";
import { money } from "../../utils/format.js";
import { tradingApi } from "../../services/tradingApi.js";
import QuantityField from "../BuyForm/QuantityField.jsx";
import { Row } from "../BuyForm/BuyForm.jsx";

export default function SellForm({ stock, owned }) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (owned === 0) {
    return <p className="muted">You don't own any shares of {stock.symbol} yet.</p>;
  }

  const confirm = async () => {
    setBusy(true);
    const res = await tradingApi.sellStock(stock.symbol, qty);
    setMsg(res.message);
    setBusy(false);
  };

  return (
    <div className="trade-form">
      <Row label="Current price" value={money(stock.currentPrice)} />
      <Row label="Owned" value={`${owned} shares`} />
      <div className="field-label">Quantity</div>
      <QuantityField value={qty} onChange={setQty} max={owned} />
      <Row label="Estimated total" value={money(qty * stock.currentPrice)} strong />
      <button className="btn btn-danger btn-block" disabled={busy} onClick={confirm}>
        {busy ? "Sending..." : "Confirm sell"}
      </button>
      {msg && <p className="trade-msg">{msg}</p>}
    </div>
  );
}
