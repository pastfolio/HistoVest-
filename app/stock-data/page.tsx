"use client";
import { useState } from "react";

export default function StockData() {
  const [symbol, setSymbol] = useState("AAPL");
  const [date, setDate] = useState("");
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState("");

  const fetchStockData = async () => {
    setError(""); // Reset errors
    setStockData(null); // Clear previous data

    if (!symbol || !date) {
      setError("Please enter a stock symbol and select a date.");
      return;
    }

    try {
      const response = await fetch(`/api/stock?symbol=${symbol}&date=${date}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stock data");
      }

      setStockData(data);
    } catch (err: any) {
      setError(err.message);
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
          placeholder="Enter stock symbol"
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button onClick={fetchStockData} style={{ padding: "8px", backgroundColor: "blue", color: "white" }}>
          Search
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {stockData && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h2>Stock Data for {symbol}</h2>
          <p><strong>Date:</strong> {new Date(stockData.date).toLocaleDateString()}</p>
          <p><strong>Open:</strong> {stockData.open.toFixed(2)}</p>
          <p><strong>High:</strong> {stockData.high.toFixed(2)}</p>
          <p><strong>Low:</strong> {stockData.low.toFixed(2)}</p>
          <p><strong>Close:</strong> {stockData.close.toFixed(2)}</p>
          <p><strong>Volume:</strong> {stockData.volume.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
