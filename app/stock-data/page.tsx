"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically load StockChart
const StockChart = dynamic(() => import("./StockChart"), { ssr: false });

export default function StockDataPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [date, setDate] = useState("2022-12-12");
  const [range, setRange] = useState(30); // Default to 30 days
  const [data, setData] = useState({ daily: null, historical: [], metadata: null });
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    setError("");
    setData({ daily: null, historical: [], metadata: null });
    setSummary("");

    try {
      const stockResponse = await fetch(
        `/api/stock?symbol=${symbol}&date=${date}&range=${range}`
      );
      const stockResult = await stockResponse.json();

      if (stockResponse.ok) {
        setData(stockResult);
      } else {
        setError(stockResult.error || "Failed to fetch stock data");
        return;
      }

      const summaryResponse = await fetch(`/api/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: symbol, date }),
      });

      const summaryResult = await summaryResponse.json();

      if (summaryResponse.ok) {
        setSummary(summaryResult.summary || "No summary available.");
      } else {
        setError(summaryResult.error || "Failed to fetch summary.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to fetch data. Please check your network or try again.");
    } finally {
      setLoading(false);
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

      {loading && <p style={{ color: "gray" }}>Loading data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data.metadata && (
        <div style={{ marginTop: "20px", border: "1px solid #ddd", padding: "10px" }}>
          <h2>Stock Metadata</h2>
          <p>
            <strong>Market Cap:</strong>{" "}
            {data.metadata.marketCap ? parseFloat(data.metadata.marketCap).toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>Beta (5Y Monthly):</strong>{" "}
            {data.metadata.beta ? parseFloat(data.metadata.beta).toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>P/E Ratio:</strong>{" "}
            {data.metadata.peRatio ? parseFloat(data.metadata.peRatio).toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>Dividend Yield:</strong>{" "}
            {data.metadata.dividendYield ? parseFloat(data.metadata.dividendYield).toFixed(4) : "N/A"}
          </p>
          <p>
            <strong>Previous Close:</strong>{" "}
            {data.metadata.previousClose ? parseFloat(data.metadata.previousClose).toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>52-Week High:</strong>{" "}
            {data.metadata.week52High ? parseFloat(data.metadata.week52High).toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>52-Week Low:</strong>{" "}
            {data.metadata.week52Low ? parseFloat(data.metadata.week52Low).toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>Volume:</strong>{" "}
            {data.metadata.volume ? Math.round(data.metadata.volume) : "N/A"}
          </p>
        </div>
      )}

      {summary && (
        <div style={{ marginTop: "20px", border: "1px solid #ddd", padding: "10px" }}>
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}

      {data.historical.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <StockChart data={data.historical} selectedDate={date} range={range} />
        </div>
      )}
    </div>
  );
}
