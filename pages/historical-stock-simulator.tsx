"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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

export default function HistoricalStockSimulator() {
  const router = useRouter();
  const { data } = router.query;

  // ✅ Main state
  const [stocks, setStocks] = useState<Stock[]>([{ symbol: "", percentage: "" }]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<string>("100000");
  const [portfolioEndValue, setPortfolioEndValue] = useState<number | null>(null);
  const [growth, setGrowth] = useState<number | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingCalc, setLoadingCalc] = useState<boolean>(false);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // ✅ Load data from URL when the page loads
  useEffect(() => {
    if (data) {
      try {
        const decodedData = JSON.parse(atob(data as string));

        setStocks(decodedData.stocks || [{ symbol: "", percentage: "" }]);
        setStartDate(decodedData.startDate || "");
        setEndDate(decodedData.endDate || "");
        setInvestmentAmount(decodedData.investmentAmount || "100000");
        setPortfolioEndValue(decodedData.portfolioEndValue ?? null);
        setGrowth(decodedData.growth ?? null);
        setSummary(decodedData.summary ?? null);
      } catch (error) {
        console.error("Error decoding portfolio data:", error);
      }
    }
  }, [data]);

  // ✅ Update URL whenever data changes (for shareable links)
  useEffect(() => {
    if (!stocks.length || !startDate || !endDate || !investmentAmount) return;

    const encodedData = btoa(
      JSON.stringify({
        stocks,
        startDate,
        endDate,
        investmentAmount,
        portfolioEndValue,
        growth,
        summary,
      })
    );

    router.replace(
      { pathname: "/historical-stock-simulator", query: { data: encodedData } },
      undefined,
      { shallow: true }
    );
  }, [stocks, startDate, endDate, investmentAmount, portfolioEndValue, growth, summary]);

  // ✅ Ensure stock tickers persist correctly
  const handleStockChange = (index: number, field: "symbol" | "percentage", value: string) => {
    setStocks((prevStocks) =>
      prevStocks.map((stock, i) => (i === index ? { ...stock, [field]: value } : stock))
    );
  };

  // ✅ Add a stock to the portfolio
  const addStock = () => {
    if (stocks.length < 10) {
      setStocks([...stocks, { symbol: "", percentage: "" }]);
    }
  };

  // ✅ Prevent calculation when no stocks are selected
  const calculatePortfolio = async () => {
    if (stocks.length === 0 || stocks.every((stock) => stock.symbol.trim() === "")) {
      setError("Please add at least one stock to calculate.");
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

      const result = await response.json();
      setPortfolioEndValue(parseFloat(result.endValue));
      setGrowth(result.growth);
      setLoadingCalc(false);
      generateSummary();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoadingCalc(false);
    }
  };

  // ✅ Generate AI Summary
  const generateSummary = async () => {
    setLoadingSummary(true);
    setSummary(null);

    try {
      const aiResponse = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, startDate, endDate }),
      });

      const aiResult = await aiResponse.json();
      setSummary(aiResult.summary);
      setLoadingSummary(false);
    } catch (err) {
      setError("An error occurred generating the portfolio summary.");
      setLoadingSummary(false);
    }
  };

  // ✅ Generate shareable link
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/historical-stock-simulator?data=${btoa(
          JSON.stringify({ stocks, startDate, endDate, investmentAmount, portfolioEndValue, growth, summary })
        )}`
      : "";

  // ✅ Format Growth with + or - sign
  const formattedGrowth = growth !== null ? (growth >= 0 ? `+${growth}%` : `${growth}%`) : "--";

  // ✅ Copy Link to Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex justify-center items-center px-6">
      <Head>
        <title>HistoVest Stock Simulator - Backtest Historical Investments</title>
      </Head>

      <div className="max-w-4xl w-full p-10 bg-black/30 border border-gray-700 shadow-2xl rounded-xl">
        <Header />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <InvestmentInput investmentAmount={investmentAmount} setInvestmentAmount={setInvestmentAmount} />
          <StockInput stocks={stocks} handleStockChange={handleStockChange} addStock={addStock} />
        </div>

        <DateSelector startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />

        <CalculatorButton calculatePortfolio={calculatePortfolio} loadingCalc={loadingCalc} />

        {error && <p className="text-red-500 text-lg mt-4">{error}</p>}

        {portfolioEndValue !== null && (
          <PortfolioResults
            portfolioEndValue={portfolioEndValue}
            growth={formattedGrowth}
            summary={summary}
            loadingSummary={loadingSummary}
          />
        )}

        {portfolioEndValue !== null && (
          <div className="mt-6 text-center">
            <button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
            >
              {copied ? "✅ Link Copied!" : "📋 Copy Shareable Link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
