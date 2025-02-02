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
  const [cashRemaining, setCashRemaining] = useState<number>(0);
  const [summary, setSummary] = useState<string>("");
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

    // Ensure start date is not after today
    const today = new Date().toISOString().split("T")[0];
    if (endDate > today) {
      setError("End date cannot be in the future.");
      setLoading(false);
      return;
    }

    // Ensure total allocation does not exceed 100%
    const totalPercentage = stocks.reduce((sum, stock) => sum + (parseFloat(stock.percentage) || 0), 0);
    if (totalPercentage > 100) {
      setError("Total allocation cannot exceed 100%.");
      setLoading(false);
      return;
    }

    try {
      const cashPercentage = Math.max(0, 100 - totalPercentage);
      const cashAmount = (portfolioStartValue * cashPercentage) / 100;

      const response = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, startDate, endDate, cashPercentage }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate portfolio");
      }

      const result = await response.json();
      const totalPortfolioEndValue = result.endValue + cashAmount;

      setPortfolioEndValue(totalPortfolioEndValue);
      setCashRemaining(cashAmount);
      setSummary(result.summary);
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
    setCashRemaining(0);
    setSummary("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-darkGray text-white flex justify-center items-center">
      <div className="max-w-3xl w-full p-6 bg-darkGray text-white rounded-lg shadow-lg">
        {/* SEO Meta Tags */}
        <Head>
          <meta name="description" content="Track historical stock data with our stock simulator. Learn from past stock performance and investment decisions." />
          <meta name="keywords" content="historical stock simulator, stock market, stock data, stock analysis, investment strategy" />
          <meta name="author" content="HistoFin" />
          <title>HistoFin - Historical Stock Simulator</title>
        </Head>

        <h1 className="text-2xl font-bold text-gold text-center">HistoVest Simulator</h1>

        {/* Configure Portfolio Section */}
        <div className="mt-4">
          <h2 className="text-lg font-bold text-gold">Configure Portfolio</h2>
          <p className="text-lightGray">Allocate up to 100% of your portfolio. Any unallocated amount will remain as cash.</p>

          {stocks.map((stock, index) => (
            <div key={index} className="flex space-x-3 items-center mt-2">
              <input
                type="text"
                placeholder="Stock Symbol (e.g., AAPL)"
                value={stock.symbol}
                onChange={(e) => handleStockChange(index, "symbol", e.target.value)}
                className="p-2 bg-mediumGray text-white border border-gray-700 rounded-md w-1/2"
              />
              <div className="flex items-center bg-mediumGray text-white border border-gray-700 rounded-md px-2 w-1/4">
                <input
                  type="number"
                  placeholder="0"
                  value={stock.percentage}
                  onChange={(e) => handleStockChange(index, "percentage", e.target.value)}
                  className="w-full bg-transparent text-white outline-none p-2"
                />
                <span className="text-lightGray">% </span>
              </div>
              <button
                onClick={() => removeStock(index)}
                className="px-3 py-2 bg-red-600 text-white font-semibold rounded-md"
              >
                Remove
              </button>
            </div>
          ))}

          {stocks.length < 10 && (
            <button
              onClick={addStock}
              className="mt-3 px-4 py-2 bg-gold text-black font-bold rounded-md w-full hover:opacity-90"
            >
              Add Stock
            </button>
          )}
        </div>

        {/* Date Range Selection */}
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

        {/* Show Portfolio Button */}
        <button
          onClick={calculatePortfolio}
          disabled={loading || !startDate || !endDate}
          className={`mt-6 px-4 py-3 bg-gold text-black font-bold rounded-md w-full hover:opacity-90 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Calculating..." : "Show Portfolio"}
        </button>

        {/* Error Handling */}
        {error && <p className="mt-3 text-red-500 font-bold">{error}</p>}

        {/* Portfolio Performance */}
        {portfolioEndValue !== null && (
          <div className="mt-6 p-4 bg-black border border-gray-700 rounded-md">
            <h2 className="text-lg font-bold text-gold">Portfolio Performance</h2>
            <p>
              <span className="font-bold">Total Start Value:</span> $
              {portfolioStartValue.toLocaleString()}
            </p>
            <p>
              <span className="font-bold">Total End Value:</span> $
              {portfolioEndValue.toLocaleString()}
            </p>
            <p className="text-gold font-bold">
              <span className="font-bold">Cash Remaining:</span> $
              {cashRemaining.toLocaleString()}
            </p>

            <h3 className="text-gold font-bold mt-4">Performance Summary:</h3>
            <p className="text-lightGray">{summary}</p>
          </div>
        )}

        {/* Reset Simulation Button */}
        <button
          onClick={resetSimulation}
          className="mt-4 px-4 py-2 bg-gold text-black font-bold rounded-md w-full hover:opacity-90"
        >
          Reset Simulation
        </button>
      </div>
    </div>
  );
}
