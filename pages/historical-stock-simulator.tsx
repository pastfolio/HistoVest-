"use client";

import { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { DollarSign, Calendar, Plus, BarChart2 } from "lucide-react";
import StockLookup from "../components/StockLookup";
import ReactMarkdown from "react-markdown";

interface Stock {
  symbol: string;
  percentage: string;
}

export default function Simulator() {
  const [stocks, setStocks] = useState<Stock[]>([{ symbol: "", percentage: "" }]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<string>("100000");
  const [portfolioEndValue, setPortfolioEndValue] = useState<number | null>(null);
  const [growth, setGrowth] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingCalc, setLoadingCalc] = useState<boolean>(false);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Add stock to portfolio (up to 10 max)
  const addStock = () => {
    if (stocks.length < 10) setStocks([...stocks, { symbol: "", percentage: "" }]);
  };

  // ✅ Handle stock changes (symbol or percentage)
  const handleStockChange = (index: number, field: "symbol" | "percentage", value: string) => {
    const updatedStocks = [...stocks];
    updatedStocks[index][field] = field === "symbol" ? value.toUpperCase() : value;
    setStocks(updatedStocks);
  };

  // ✅ Validate user input
  const validateInputs = () => {
    if (stocks.some(stock => stock.symbol.trim() === "")) return "Please select a valid stock symbol.";
    if (new Set(stocks.map(stock => stock.symbol)).size !== stocks.length) return "Duplicate stock symbols detected.";
    if (new Date(startDate) >= new Date(endDate)) return "Start date must be before the end date.";
    if (Number(investmentAmount) <= 0) return "Investment amount must be greater than zero.";
    return null;
  };

  // ✅ Portfolio Calculation (separated from AI)
  const calculatePortfolio = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoadingCalc(true);
    setError(null);
    setPortfolioEndValue(null);
    setGrowth(null);
    setSummary(null);

    try {
      const response = await fetch("/api/calculate-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, startDate, endDate, investmentAmount }),
      });

      if (!response.ok) throw new Error("Failed to calculate portfolio");

      const result = await response.json();
      setPortfolioEndValue(parseFloat(result.endValue));
      setGrowth(result.growth);
      setLoadingCalc(false);

      // ✅ After calculation, trigger AI summary generation
      generateSummary();

    } catch (err) {
      console.error("Error calculating portfolio:", err);
      setError("An error occurred. Please try again.");
      setLoadingCalc(false);
    }
  };

  // ✅ AI Summary Generation (separate API call)
  const generateSummary = async () => {
    setLoadingSummary(true);

    try {
      const aiResponse = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, startDate, endDate }),
      });

      if (!aiResponse.ok) throw new Error("Failed to generate portfolio summary");

      const aiResult = await aiResponse.json();
      setSummary(aiResult.summary);
      setLoadingSummary(false);

    } catch (err) {
      console.error("Error generating AI summary:", err);
      setError("An error occurred generating the portfolio summary.");
      setLoadingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex justify-center items-center px-6">
      <Head>
        <title>HistoVest Simulator</title>
      </Head>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full p-10 bg-black/30 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl"
      >
        <h1 className="text-4xl font-extrabold text-center text-[#facc15] tracking-wide flex items-center justify-center gap-2">
          <BarChart2 size={36} /> HistoVest Simulator
        </h1>
        {/* ADDED DESCRIPTION FROM SCREENSHOT */}
        <p className="mt-4 text-center text-gray-300">
          The HistoVest Simulator is a powerful stock investment backtesting tool that allows users to analyze historical market performance. 
          Simulate stock portfolios, calculate historical returns, and optimize investment strategies with real stock data. 
          Our advanced portfolio analysis tool provides insights into market trends, stock growth, and investment returns over custom date ranges.
          Whether you're testing an investment strategy, evaluating historical stock performance, or refining your financial model, 
          HistoVest helps investors make data-driven decisions.
        </p>

        {/* INVESTMENT AMOUNT INPUT */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-[#facc15] flex items-center gap-2">
            <DollarSign /> Investment Amount ($)
          </h2>
          <input
            type="number"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            className="p-3 bg-gray-800 text-white border border-gray-600 w-full rounded-lg focus:ring-2 focus:ring-[#facc15] text-center"
          />
        </div>

        {/* STOCK INPUT SECTION */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-[#facc15]">Configure Portfolio</h2>
          {stocks.map((stock, index) => (
            <div key={index} className="flex space-x-3 items-center mt-3">
              <StockLookup onSelectStock={(symbol) => handleStockChange(index, "symbol", symbol)} />
              <input
                type="number"
                placeholder="%"
                value={stock.percentage}
                onChange={(e) => handleStockChange(index, "percentage", e.target.value)}
                className="p-3 bg-gray-800 text-white border border-gray-600 w-1/3 rounded-lg text-center"
              />
            </div>
          ))}
          {stocks.length < 10 && (
            <motion.button 
              onClick={addStock} 
              whileTap={{ scale: 0.95 }}
              className="mt-4 flex items-center justify-center px-4 py-3 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:opacity-90 gap-2"
            >
              <Plus /> Add Stock
            </motion.button>
          )}
        </div>

        {/* DATE SELECTION */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-[#facc15] flex items-center gap-2">
            <Calendar /> Select Date Range
          </h2>
          <div className="flex space-x-3">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-3 bg-gray-800 text-white border border-gray-600 w-1/2 rounded-lg text-center"/>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-3 bg-gray-800 text-white border border-gray-600 w-1/2 rounded-lg text-center"/>
          </div>
        </div>

        {/* ✅ CALCULATE BUTTON */}
        <motion.button 
          onClick={calculatePortfolio}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-6 py-4 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold uppercase rounded-lg hover:opacity-90"
        >
          {loadingCalc ? "Calculating..." : "Calculate Portfolio"}
        </motion.button>

        {/* RESULTS & SUMMARY */}
        {portfolioEndValue !== null && <p>Total End Value: ${portfolioEndValue.toLocaleString()}</p>}
        {growth && <p>Growth: {growth}%</p>}

        {loadingSummary && <p>Generating Portfolio Summary...</p>}
        
        {summary && (
          <div className="summary-container mt-6">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}
      </motion.div>
    </div>
  );
}