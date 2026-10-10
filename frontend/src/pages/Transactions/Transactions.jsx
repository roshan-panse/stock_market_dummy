
import "./Transactions.css";
import useAsync from "../../hooks/useAsync.js";
import { portfolioApi } from "../../services/portfolioApi.js";
import TransactionTable from "../../components/TransactionTable/TransactionTable.jsx";
import { Loading, Empty, ErrorState } from "../../components/common/State.jsx";

export default function Transactions() {
  const txns = useAsync(() => portfolioApi.getTransactions(), []);

  const transactions = [...(txns.data ?? [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="dash">
      <header>
        <h1 className="dash-title">
          Transaction <span>History</span>
        </h1>
        <p className="muted small">
          View all your stock purchases and sales.
        </p>
      </header>

      <section className="dash-card">
        <h2>All transactions</h2>

        {txns.loading && <Loading text="Loading transactions..." />}

        {txns.error && (
          <ErrorState
            text="Unable to load transactions. Please try again."
            onRetry={txns.reload}
          />
        )}

        {txns.data &&
          (transactions.length > 0 ? (
            <TransactionTable transactions={transactions} />
          ) : (
            <Empty text="You have no transactions yet." />
          ))}
      </section>
    </div>
  );
}
