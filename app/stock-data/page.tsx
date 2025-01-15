"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically load StockChart
const StockChart = dynamic(() => import("./StockChart"), { ssr: false });

export default function StockDataPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [date, setDate] = useState("2022-12-12");
  const [range, setRange] = useState(30); // Default to 30 days
  const [data, setData] = useState({ daily: null, historical: [] });
  const [error, setError] = useState("");

  const fetchStockData = async () => {
    setError("");
    setData({ daily: null, historical: [] });

    try {
      const response = await fetch(
        `/api/stock?symbol=${symbol}&date=${date}&range=${range}`
      );
      const result = await response.json();

      console.log("API Response:", result);

      if (response.ok) {
        setData(result);
      } else {
        console.error("API Error:", result.error);
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
        <input
          type="number"
          value={range}
          onChange={(e) => setRange(parseInt(e.target.value))}
          placeholder="Range in days"
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
      {data.daily && (
        <div style={{ marginTop: "20px", border: "1px solid #ddd", padding: "10px" }}>
          <h2>{symbol} Stock Data</h2>
          <p>
            The chart below shows the closing prices for the past {range} days up to{" "}
            <strong>{new Date(date).toLocaleDateString()}</strong>.
          </p>
          <p>
            The red marker highlights the selected date: <strong>{new Date(date).toLocaleDateString()}</strong>.
          </p>
          <p><strong>Open:</strong> {data.daily.open?.toFixed(2) || "N/A"}</p>
          <p><strong>Close:</strong> {data.daily.close?.toFixed(2) || "N/A"}</p>
          <p><strong>High:</strong> {data.daily.high?.toFixed(2) || "N/A"}</p>
          <p><strong>Low:</strong> {data.daily.low?.toFixed(2) || "N/A"}</p>
          <p><strong>Volume:</strong> {data.daily.volume?.toLocaleString() || "N/A"}</p>
        </div>
      )}
      {data.historical.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <StockChart data={data.historical} selectedDate={date} />
        </div>
      )}
    </div>
  );
}
