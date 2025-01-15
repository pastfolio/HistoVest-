"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically load StockChart
const StockChart = dynamic(() => import("./StockChart"), { ssr: false });

export default function StockDataPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [date, setDate] = useState("2022-12-12");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchStockData = async () => {
    setError("");
    setData(null);

    try {
      const response = await fetch(`/api/stock?symbol=${symbol}&date=${date}`);
      const result = await response.json();

      console.log("API Response:", result);

      if (response.ok) {
        if (result && result.close) {
          setData(result);
        } else {
          console.error("Incomplete API data:", result);
          setError("Incomplete data received from the API.");
        }
      } else {
        setError(result.error || "Failed to fetch stock data");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to fetch stock data");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Stock Data Lookup</h1>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol (e.g., AAPL)"
          style={{
            padding: "8px",
            fontSize: "16px",
            marginRight: "10px",
          }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "8px", fontSize: "16px", marginRight: "10px" }}
        />
        <button
          onClick={fetchStockData}
          style={{
            padding: "8px 12px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && (
        <div style={{ marginTop: "20px", border: "1px solid #ddd", padding: "10px" }}>
          <h2>{symbol} Stock Data</h2>
          <p><strong>Open:</strong> {data.open?.toFixed(2) || "N/A"}</p>
          <p><strong>Close:</strong> {data.close?.toFixed(2) || "N/A"}</p>
          <p><strong>High:</strong> {data.high?.toFixed(2) || "N/A"}</p>
          <p><strong>Low:</strong> {data.low?.toFixed(2) || "N/A"}</p>
          <p><strong>Volume:</strong> {data.volume?.toLocaleString() || "N/A"}</p>
          <div style={{ marginTop: "20px" }}>
            <StockChart
              data={
                data && data.close
                  ? [{ close: data.close, date }]
                  : []
              }
              selectedDate={date}
            />
          </div>
        </div>
      )}
    </div>
  );
}
