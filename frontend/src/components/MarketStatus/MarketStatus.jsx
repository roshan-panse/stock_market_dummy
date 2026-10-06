import { useEffect, useState } from "react";
import { stockApi } from "../../services/stockApi.js";

export default function MarketStatus() {
  const [marketOpen, setMarketOpen] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    stockApi.getMarketStatus().then((data) => {
      setMarketOpen(data.isOpen);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="market-status">
      <span className="market-time">
        {currentTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })}{" "}
        IST
      </span>

      {marketOpen === true && (
        <span className="market-open">● OPEN</span>
      )}

      {marketOpen === false && (
        <span className="market-closed">● CLOSED</span>
      )}
    </div>
  );
}