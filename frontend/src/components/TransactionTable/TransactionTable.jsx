import { money, shortDate } from "../../utils/format.js";
import "./TransactionTable.css";

export default function TransactionTable({ transactions }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th><th>Stock</th><th>Type</th><th className="r">Qty</th>
            <th className="r">Price</th><th className="r">Total</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{shortDate(t.date)}</td>
              <td><strong>{t.symbol}</strong></td>
              <td><span className={`tag ${t.type === "BUY" ? "tag-buy" : "tag-sell"}`}>{t.type}</span></td>
              <td className="r num">{t.quantity}</td>
              <td className="r num">{money(t.price)}</td>
              <td className="r num">{money(t.quantity * t.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
