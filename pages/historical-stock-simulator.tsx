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
  const [investmentAmount, setInvestmentAmount] = useState<string>("100000");
  const [portfolioEndValue, setPortfolioEndValue] = useState<number | null>(null);
  const [growth, setGrowth] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingCalc, setLoadingCalc] = useState<boolean>(false);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Validate user input before calculating
  const validateInputs = () => {
    if (stocks.some(stock => stock.symbol.trim() === "")) return "Please select a valid stock symbol.";
    if (new Set(stocks.map(stock => stock.symbol)).size !== stocks.length) return "Duplicate stock symbols detected.";
    if (new Date(startDate) >= new Date(endDate)) return "Start date must be before the end date.";
    if (Number(investmentAmount) <= 0) return "Investment amount must be greater than zero.";
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
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex justify-center items-center px-6">
      <Head>
        <title>HistoVest Simulator</title>
      </Head>
      <div className="max-w-4xl w-full p-10 bg-black/30 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl">
        <Header />
        <InvestmentInput investmentAmount={investmentAmount} setInvestmentAmount={setInvestmentAmount} />
        <StockInput stocks={stocks} handleStockChange={(index, field, value) => {
          const updatedStocks = [...stocks];
          updatedStocks[index][field] = field === "symbol" ? value.toUpperCase() : value;
          setStocks(updatedStocks);
        }} addStock={() => {
          if (stocks.length < 10) setStocks([...stocks, { symbol: "", percentage: "" }]);
        }} />
        <DateSelector startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
        <CalculatorButton calculatePortfolio={calculatePortfolio} loadingCalc={loadingCalc} />
        <PortfolioResults portfolioEndValue={portfolioEndValue} growth={growth} summary={summary} loadingSummary={loadingSummary} />
      </div>
    </div>
  );
}
