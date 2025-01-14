"use client"; // Ensures this runs in the client

import { useState } from "react";
import StockChart from "./StockChart";

export default function StockDataPage() {
  const [symbol, setSymbol] = useState("");
  const [date, setDate] = useState("");
  const [stockData, setStockData] = useState([]);
  const [error, setError] = useState("");

  const fetchStockData = async () => {
    if (!symbol) {
      setError("Please enter a stock symbol.");
      return;
    }

    setError(""); // Reset errors
    setStockData([]); // Clear previous data

    try {
      const response = await fetch(`/api/stock?symbol=${symbol}`);
      const data = await response.json();

      console.log("Stock Data Response:", data); // ✅ Debugging

      if (response.ok) {
        setStockData(data); // ✅ Pass full dataset to chart
      } else {
        setError(data.error || "Failed to fetch stock data.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-black mb-6">Stock Data Lookup</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Stock Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="p-2 border rounded-md"
        />

        <button
          onClick={fetchStockData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {stockData.length > 0 && (
        <div className="mt-6 p-4 border rounded-md shadow-md bg-white w-96">
          <h2 className="text-xl font-semibold">Stock Data for {symbol}</h2>
          <p>
            <strong>Date:</strong>{" "}
            {stockData.length > 0 ? new Date(stockData[stockData.length - 1].date).toLocaleDateString() : "N/A"}
          </p>
          <p>
            <strong>Open:</strong> {stockData.length > 0 ? stockData[stockData.length - 1].open.toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>High:</strong> {stockData.length > 0 ? stockData[stockData.length - 1].high.toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>Low:</strong> {stockData.length > 0 ? stockData[stockData.length - 1].low.toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>Close:</strong> {stockData.length > 0 ? stockData[stockData.length - 1].close.toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>Volume:</strong> {stockData.length > 0 ? stockData[stockData.length - 1].volume.toLocaleString() : "N/A"}
          </p>

          {/* TradingView Chart */}
          {stockData.length > 0 && <StockChart data={stockData} />}
        </div>
      )}
    </main>
  );
}
