"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaInfoCircle } from "react-icons/fa"; // Info icon for range input

const StockChart = dynamic(() => import("./StockChart"), { ssr: false });

export default function StockDataPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [date, setDate] = useState("2022-12-12");
  const [range, setRange] = useState(30);
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
      const stockResponse = await fetch(`/api/stock?symbol=${symbol}&date=${date}&range=${range}`);
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

  const formatNumber = (num: number | null) => {
    return num ? Number(num).toLocaleString("en-US", { maximumFractionDigits: 2 }) : "N/A";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gold mb-6">Stock Data Lookup</h1>

      {/* 🔹 Search Section */}
      <div className="flex flex-wrap gap-4 justify-center items-center bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
        {/* Stock Symbol Input */}
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter stock symbol (e.g., AAPL)"
          className="bg-gray-700 text-white p-3 text-lg rounded-md border border-gray-600 text-center w-40"
        />

        {/* Date Picker */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-gray-700 text-white p-3 text-lg rounded-md border border-gray-600 text-center"
        />

        {/* 🔹 Days Range Selector */}
        <div className="relative">
          <input
            type="number"
            value={range}
            onChange={(e) => setRange(parseInt(e.target.value))}
            placeholder="Range"
            className="bg-gray-700 text-white p-3 text-lg rounded-md border border-gray-600 text-center w-20"
          />
          <FaInfoCircle className="absolute top-3 right-3 text-gray-400" />
        </div>

        {/* Search Button */}
        <button
          onClick={fetchStockData}
          className="bg-gold text-black font-bold py-3 px-5 rounded-md hover:bg-yellow-600 transition"
        >
          Search
        </button>
      </div>

      {/* 🔹 Go to Simulator Button */}
      <div className="text-center mt-4">
        <Link href="/simulator">
          <button className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition">
            Go to Simulator
          </button>
        </Link>
      </div>

      {/* 🔹 Display Selected Stock Info */}
      {data.daily && (
        <div className="bg-gray-800 p-5 mt-6 rounded-lg border border-gray-700 w-full max-w-lg text-center">
          <h2 className="text-xl font-bold text-gold mb-2">Stock Data</h2>
          <p><strong>Stock:</strong> {symbol}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Closing Price:</strong> ${formatNumber(data.daily.close)}</p>
        </div>
      )}

      {/* 🔹 Error Message */}
      {loading && <p className="text-gray-400 mt-4">Loading data...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* 🔹 Summary Section */}
      {summary && (
        <div className="bg-gray-800 p-5 mt-6 rounded-lg border border-gray-700 w-full max-w-2xl">
          <h2 className="text-xl font-bold text-gold mb-2">Stock Performance Summary</h2>
          <p className="text-gray-300">{summary}</p>
        </div>
      )}

      {/* 🔹 Chart Section */}
      {data.historical.length > 0 && (
        <div className="mt-6 w-full max-w-4xl">
          <h2 className="text-xl font-bold text-gold mb-4">Stock Price Chart</h2>
          <StockChart data={data.historical} selectedDate={date} range={range} />
        </div>
      )}
    </div>
  );
}
