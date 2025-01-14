"use client"; 
import { useState } from "react";

export default function StockDataPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchStockData = async () => {
    setError("");
    setData(null);

    try {
      const response = await fetch(`/api/stock?symbol=${symbol}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
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
          <p><strong>Open:</strong> {data.open}</p>
          <p><strong>Close:</strong> {data.close}</p>
          <p><strong>High:</strong> {data.high}</p>
          <p><strong>Low:</strong> {data.low}</p>
          <p><strong>Volume:</strong> {data.volume}</p>
        </div>
      )}
    </div>
  );
}
