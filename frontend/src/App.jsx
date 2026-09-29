import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import AuthModal from "./components/AuthModal/AuthModal.jsx";
import ProtectedRoute from "./pages/routes/ProtectedRoute.jsx";
import Landing from "./pages/Landing/Landing.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Portfolio from "./pages/Portfolio/Portfolio.jsx";
import Stocks from "./pages/Stocks/Stocks.jsx";
import StockDetails from "./pages/StockDetails/StockDetails.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          {/* Public: first thing every visitor sees */}
          <Route path="/" element={<Landing />} />

          {/* Private: need to be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/stocks/:symbol" element={<StockDetails />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <AuthModal />
    </>
  );
}
