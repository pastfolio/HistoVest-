"use client";

import { useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import InvestmentInput from "../components/InvestmentInput";
import StockInput from "../components/StockInput";
import DateSelector from "../components/DateSelector";
import CalculatorButton from "../components/CalculatorButton";
import PortfolioResults from "../components/PortfolioResults";

interface Stock {
  symbol: string;
  percentage: string;
}

export default function Simulator() {
  const [stocks, setStocks] = useState<Stock[]>([{ symbol: "", percentage: "" }]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<string>(Number(100000).toLocaleString()); // ✅ Default with commas
  const [portfolioEndValue, setPortfolioEndValue] = useState<number | null>(null);
  const [growth, setGrowth] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingCalc, setLoadingCalc] = useState<boolean>(false);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Format investment input with commas while typing
  const handleInvestmentChange = (value: string) => {
    const numericValue = value.replace(/,/g, ""); // Remove existing commas
    if (!isNaN(Number(numericValue))) {
      setInvestmentAmount(Number(numericValue).toLocaleString()); // Re-add commas
    }
  };

  // ✅ Validate user input before calculating
  const validateInputs = () => {
    if (stocks.some(stock => stock.symbol.trim() === "")) return "Please select a valid stock symbol.";
    if (new Set(stocks.map(stock => stock.symbol)).size !== stocks.length) return "Duplicate stock symbols detected.";
    if (new Date(startDate) >= new Date(endDate)) return "Start date must be before the end date.";
    if (Number(investmentAmount.replace(/,/g, "")) <= 0) return "Investment amount must be greater than zero.";
    return null;
  };

  // ✅ Function to Calculate Portfolio Performance
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
        body: JSON.stringify({ stocks, startDate, endDate, investmentAmount: investmentAmount.replace(/,/g, "") }),
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

  // ✅ AI Summary Generation Function
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
    <div className="min-h-screen bg-[#0D0D0D] text-white flex justify-center items-center px-6">
      <Head>
        <title>HistoVest Stock Simulator - Backtest Historical Investments</title>
        <meta name="description" content="Simulate stock portfolios, backtest historical investments, and optimize strategies with real stock data. HistoVest helps investors make data-driven decisions." />
        <meta name="keywords" content="stock simulator, investment backtesting, historical stock performance, portfolio analysis, finance tools, stock market trends, backtesting platform, trading simulation, investment strategies, historical stock data" />
        <meta property="og:title" content="HistoVest Stock Simulator - Backtest Investments" />
        <meta property="og:description" content="Test historical stock performance, optimize portfolios, and refine investment strategies with real stock data." />
        <meta property="og:image" content="/public/histovest-thumbnail.jpg" />
        <meta property="og:url" content="https://yourwebsite.com/historical-stock-simulator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HistoVest Stock Simulator" />
        <meta name="twitter:description" content="Backtest historical investments and optimize trading strategies with real stock market data." />
        <meta name="twitter:image" content="/public/histovest-thumbnail.jpg" />
        <link rel="canonical" href="https://yourwebsite.com/historical-stock-simulator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="max-w-4xl w-full p-10 bg-black/30 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl">
        <Header />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <InvestmentInput 
            investmentAmount={investmentAmount} 
            setInvestmentAmount={handleInvestmentChange} 
          />
          <StockInput 
            stocks={stocks} 
            handleStockChange={(index, field, value) => {
              const updatedStocks = [...stocks];
              updatedStocks[index][field] = field === "symbol" ? value.toUpperCase() : value;
              setStocks(updatedStocks);
            }} 
            addStock={() => {
              if (stocks.length < 10) setStocks([...stocks, { symbol: "", percentage: "" }]);
            }} 
          />
        </div>

        <DateSelector startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />

        <CalculatorButton calculatePortfolio={calculatePortfolio} loadingCalc={loadingCalc} />

        {/* ✅ Portfolio Results Section */}
        {portfolioEndValue !== null && (
          <div className="mt-8 bg-black/40 p-6 rounded-lg border border-gray-600 shadow-lg">
            <h3 className="text-xl font-bold text-[#facc15] flex items-center gap-2">
              💰 Total End Value: <span className="text-green-400">${portfolioEndValue.toLocaleString()}</span>
            </h3>
            <h3 className="text-lg font-bold text-[#facc15] flex items-center gap-2 mt-2">
              📈 Growth: <span className="text-green-400">{growth}%</span>
            </h3>
            {loadingSummary && <p className="text-gray-400 text-sm mt-4">Generating Portfolio Summary...</p>}
          </div>
        )}

        {summary && (
          <div className="mt-6 bg-[#111] border border-gray-600 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-[#facc15]">📊 Portfolio Analysis</h3>
            <p className="text-gray-300 mt-2">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
