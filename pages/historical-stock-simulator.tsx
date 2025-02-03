"use client";

import { useState } from "react";
import Head from "next/head"; // Import Head for adding meta tags

interface Stock {
  symbol: string;
  percentage: string;
}

export default function Simulator() {
  const [stocks, setStocks] = useState<Stock[]>([{ symbol: "", percentage: "" }]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [portfolioStartValue, setPortfolioStartValue] = useState<number>(100000);
  const [portfolioEndValue, setPortfolioEndValue] = useState<number | null>(null);
  const [growth, setGrowth] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null); // 🔹 AI Summary State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addStock = () => {
    if (stocks.length < 10) {
      setStocks([...stocks, { symbol: "", percentage: "" }]);
    }
  };

  const handleStockChange = (index: number, field: "symbol" | "percentage", value: string) => {
    const updatedStocks = [...stocks];
    updatedStocks[index][field] = value;
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

    const totalPercentage = stocks.reduce((sum, stock) => sum + (parseFloat(stock.percentage) || 0), 0);
    if (totalPercentage > 100) {
      setError("Total allocation cannot exceed 100%.");
      setLoading(false);
      return;
    }

    try {
      // 🔹 Fetch Portfolio Calculation
      const response = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, startDate, endDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate portfolio");
      }

      const result = await response.json();
      setPortfolioStartValue(100000);
      setPortfolioEndValue(parseFloat(result.endValue));
      setGrowth(result.growth);

      // 🔹 Fetch AI Summary
      const aiResponse = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startValue: 100000,
          endValue: parseFloat(result.endValue),
          stocks,
          startDate,
          endDate,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error("Failed to fetch AI summary");
      }

      const aiResult = await aiResponse.json();
      setSummary(aiResult.summary);

    } catch (err) {
      console.error("Error calculating portfolio:", err);
      setError("An error occurred while calculating the portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setStocks([{ symbol: "", percentage: "" }]);
    setStartDate("");
    setEndDate("");
    setPortfolioStartValue(100000);
    setPortfolioEndValue(null);
    setGrowth(null);
    setSummary(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-darkGray text-white flex justify-center items-center">
      <div className="max-w-3xl w-full p-6 bg-darkGray text-white rounded-lg shadow-lg">
        <Head>
          <title>HistoFin - Historical Stock Simulator</title>
        </Head>

        <h1 className="text-2xl font-bold text-gold text-center">HistoVest Simulator</h1>

        <div className="mt-4">
          <h2 className="text-lg font-bold text-gold">Configure Portfolio</h2>
          {stocks.map((stock, index) => (
            <div key={index} className="flex space-x-3 items-center mt-2">
              <input
                type="text"
                placeholder="Stock Symbol (e.g., AAPL)"
                value={stock.symbol}
                onChange={(e) => handleStockChange(index, "symbol", e.target.value)}
                className="p-2 bg-mediumGray text-white border border-gray-700 rounded-md w-1/2"
              />
              <input
                type="number"
                placeholder="0"
                value={stock.percentage}
                onChange={(e) => handleStockChange(index, "percentage", e.target.value)}
                className="p-2 bg-mediumGray text-white border border-gray-700 rounded-md w-1/4"
              />
              <button onClick={() => removeStock(index)} className="px-3 py-2 bg-red-600 text-white font-semibold rounded-md">
                Remove
              </button>
            </div>
          ))}
          {stocks.length < 10 && (
            <button onClick={addStock} className="mt-3 px-4 py-2 bg-gold text-black font-bold rounded-md w-full hover:opacity-90">
              Add Stock
            </button>
          )}
        </div>

        {/* 🔹 ADD DATE SELECTORS BACK HERE */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gold">Select Date Range</h2>
          <div className="flex space-x-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 bg-mediumGray text-white border border-gray-700 rounded-md w-1/2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 bg-mediumGray text-white border border-gray-700 rounded-md w-1/2"
            />
          </div>
        </div>

        <button onClick={calculatePortfolio} disabled={loading} className="mt-6 px-4 py-3 bg-gold text-black font-bold rounded-md w-full">
          {loading ? "Calculating..." : "Show Portfolio"}
        </button>

        {portfolioEndValue !== null && (
          <div className="mt-6 p-4 bg-black border border-gray-700 rounded-md">
            <h2 className="text-lg font-bold text-gold">Portfolio Performance</h2>
            <p>Total End Value: ${portfolioEndValue.toLocaleString()}</p>
            <p>Growth: {growth}%</p>
          </div>
        )}

        {/* 🔹 Display AI Summary */}
        {summary && (
          <div className="mt-6 p-4 bg-black border border-gray-700 rounded-md">
            <h2 className="text-lg font-bold text-gold">AI-Generated Insights</h2>
            <p className="text-lightGray whitespace-pre-line">{summary}</p>
          </div>
        )}

        {error && <p className="mt-3 text-red-500 font-bold">{error}</p>}
      </div>
    </div>
  );
}
