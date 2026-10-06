import { useState } from "react";
import "../BuyForm/BuyForm.css";
import { money } from "../../utils/format.js";
import { tradingApi } from "../../services/tradingApi.js";
import QuantityField from "../BuyForm/QuantityField.jsx";
import { Row } from "../BuyForm/BuyForm.jsx";

export default function SellForm({ stock, owned, onSuccess }) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const total = qty * stock.currentPrice;

  const confirm = async () => {
    setBusy(true);
    setMsg("");

    try {
      const res = await tradingApi.sellStock(stock.symbol, qty);

      setMsg(res.message);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (error) {
      setMsg(error.message || "Sell order failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="trade-form">
      <Row
        label="Current price"
        value={money(stock.currentPrice)}
      />

      <div className="field-label">Quantity</div>

      <QuantityField
        value={qty}
        onChange={setQty}
      />

      <Row
        label="Estimated total"
        value={money(total)}
        strong
      />

      <Row
        label="Owned shares"
        value={owned}
      />

      <button
        className="btn btn-primary btn-block"
        disabled={busy || owned === 0}
        onClick={confirm}
      >
        {busy ? "Sending..." : "Confirm sell"}
      </button>

      {msg && <p className="trade-msg">{msg}</p>}
    </div>
  );
}