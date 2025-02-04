"use client";

import { useState } from "react";
import Head from "next/head";

interface Stock {
  symbol: string;
  percentage: string;
}

export default function Simulator() {
  const [stocks, setStocks] = useState<Stock[]>([{ symbol: "", percentage: "" }]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [portfolioEndValue, setPortfolioEndValue] = useState<number | null>(null);
  const [growth, setGrowth] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addStock = () => {
    if (stocks.length < 10) setStocks([...stocks, { symbol: "", percentage: "" }]);
  };

  const handleStockChange = (index: number, field: "symbol" | "percentage", value: string) => {
    const updatedStocks = [...stocks];
    updatedStocks[index][field] = field === "symbol" ? value.toUpperCase() : value;
    setStocks(updatedStocks);
  };

  const removeStock = (index: number) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const calculatePortfolio = async () => {
    setLoading(true);
    setError(null);

    const today = new Date().toISOString().split("T")[0];
    if (endDate > today) {
      setError("End date cannot be in the future.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, startDate, endDate }),
      });

      if (!response.ok) throw new Error("Failed to calculate portfolio");
      const result = await response.json();
      setPortfolioEndValue(parseFloat(result.endValue));
      setGrowth(result.growth);

      const aiResponse = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, startDate, endDate }),
      });

      if (!aiResponse.ok) throw new Error("Failed to fetch AI summary");
      const aiResult = await aiResponse.json();
      setSummary(aiResult.summary);

    } catch (err) {
      console.error("Error calculating portfolio:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-white flex justify-center items-center px-6">
      <Head>
        <title>HistoVest Simulator</title>
      </Head>

      <div className="max-w-3xl w-full p-8 bg-[#1a1a1a] text-white border border-[#444] shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center text-[#facc15] tracking-wide">
          HistoVest Simulator
        </h1>

        {/* STOCK INPUT SECTION */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-[#facc15]">Configure Portfolio</h2>
          {stocks.map((stock, index) => (
            <div key={index} className="flex space-x-3 items-center mt-3">
              <input
                type="text"
                placeholder="Stock Symbol (e.g., AAPL)"
                value={stock.symbol}
                onChange={(e) => handleStockChange(index, "symbol", e.target.value)}
                className="p-2 bg-[#222] text-white border border-gray-600 w-2/3 focus:ring-2 focus:ring-[#facc15] tracking-wide"
              />
              <input
                type="number"
                placeholder="0%"
                value={stock.percentage}
                onChange={(e) => handleStockChange(index, "percentage", e.target.value)}
                className="p-2 bg-[#222] text-white border border-gray-600 w-1/4 focus:ring-2 focus:ring-[#facc15] text-center"
              />
              <button
                onClick={() => removeStock(index)}
                className="px-3 py-2 bg-red-600 text-white font-semibold transition hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          {stocks.length < 10 && (
            <button onClick={addStock} className="mt-4 px-4 py-3 w-full bg-[#facc15] text-black font-bold hover:opacity-90 uppercase">
              + Add Stock
            </button>
          )}
        </div>

        {/* DATE SELECTION */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-[#facc15]">Select Date Range</h2>
          <div className="flex space-x-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 bg-[#222] text-white border border-gray-600 w-1/2 focus:ring-2 focus:ring-[#facc15] text-center"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 bg-[#222] text-white border border-gray-600 w-1/2 focus:ring-2 focus:ring-[#facc15] text-center"
            />
          </div>
        </div>

        {/* SHOW PORTFOLIO BUTTON WITH LOADING ANIMATION */}
        <button onClick={calculatePortfolio} disabled={loading} className="mt-6 px-6 py-4 w-full bg-[#facc15] text-black font-bold hover:opacity-90 uppercase">
          {loading ? "Calculating..." : "Show Portfolio"}
        </button>

        {/* PORTFOLIO RESULTS */}
        {portfolioEndValue !== null && (
          <div className="mt-6 p-6 bg-[#222] border border-gray-700">
            <h2 className="text-lg font-semibold text-[#facc15]">Portfolio Performance</h2>
            <p className="text-gray-300">Total End Value: <span className="text-white font-medium">${portfolioEndValue.toLocaleString()}</span></p>
            <p className="text-gray-300">Growth: <span className="text-white font-medium">{growth}%</span></p>
          </div>
        )}

        {/* AI SUMMARY SECTION */}
        {summary && (
          <div className="mt-6 p-6 bg-[#222] border border-gray-700">
            <h2 className="text-lg font-semibold text-[#facc15]">AI-Generated Insights</h2>
            <p className="text-gray-300 whitespace-pre-line">{summary}</p>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 font-bold text-center">{error}</p>}
      </div>
    </div>
  );
}
