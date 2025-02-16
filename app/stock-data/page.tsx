"use client";

import { useState } from "react";
import Head from "next/head";
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

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col items-center p-6">
      {/* 🔹 Meta Tags for SEO */}
      <Head>
        <title>HistoVest - AI-Powered Historical Stock Research</title>
        <meta 
          name="description" 
          content="Research stock price performance on any date. Discover what influenced price changes with AI-powered insights on market trends, economic events, and financial news." 
        />
        <meta name="keywords" content="historical stock research, stock price analysis, AI market insights, stock trends, investment research, stock lookup, market analysis" />
        <meta name="author" content="HistoVest" />
        <meta property="og:title" content="HistoVest - AI-Powered Historical Stock Research" />
        <meta property="og:description" content="Analyze stock performance on a specific date with AI-generated insights on market trends and financial events. Research smarter with HistoVest." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.histovest.com/stock-data" />
        <meta property="og:image" content="https://www.histovest.com/preview-stock-data.jpg" />
      </Head>

      {/* 🔹 Page Title & Description */}
      <section className="text-center bg-[#111] py-10 px-6 w-full rounded-lg border-b border-gray-700 shadow-lg">
        <h1 className="text-4xl font-extrabold text-[#facc15] flex items-center justify-center gap-2">
          📊 Historical Stock Research
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4">
          Research stock price performance on any date. Gain AI-powered insights into market trends, economic events, and financial news that influenced price movements.
        </p>
      </section>

      {/* 🔹 Search Section */}
      <div className="mt-8 bg-gray-900 p-6 rounded-xl w-full max-w-3xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-[#facc15] text-center mb-4">🔍 Research Stock Price Performance</h2>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {/* Stock Symbol Input */}
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="bg-gray-800 text-white p-3 text-lg rounded-md border border-gray-700 text-center w-40"
          />

          {/* Date Picker */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-800 text-white p-3 text-lg rounded-md border border-gray-700 text-center"
          />

          {/* 🔹 Days Range Selector */}
          <div className="relative">
            <input
              type="number"
              value={range}
              onChange={(e) => setRange(parseInt(e.target.value))}
              placeholder="Range"
              className="bg-gray-800 text-white p-3 text-lg rounded-md border border-gray-700 text-center w-20"
            />
            <FaInfoCircle className="absolute top-3 right-3 text-gray-400" />
          </div>

          {/* Search Button */}
          <button
            onClick={fetchStockData}
            className="bg-[#facc15] text-black font-bold py-3 px-6 rounded-md hover:bg-yellow-600 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* 🔹 Go to Simulator Button */}
      <div className="text-center mt-6">
        <Link href="/historical-stock-simulator">
          <button className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition">
            🚀 Try the Historical Stock Simulator
          </button>
        </Link>
      </div>

      {/* 🔹 Display Selected Stock Info */}
      {data.daily && (
        <div className="bg-gray-900 p-6 mt-6 rounded-lg border border-gray-700 w-full max-w-lg text-center shadow-lg">
          <h2 className="text-xl font-bold text-[#facc15] mb-3">📊 Stock Data</h2>
          <p><strong>Stock:</strong> {symbol}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Closing Price:</strong> ${data.daily.close?.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
        </div>
      )}

      {/* 🔹 Error Message */}
      {loading && <p className="text-gray-400 mt-4">Loading data...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* 🔹 AI-Generated Stock Analysis */}
      {summary && (
        <div className="bg-gray-900 p-6 mt-6 rounded-lg border border-gray-700 w-full max-w-2xl shadow-lg">
          <h2 className="text-xl font-bold text-[#facc15] mb-3">🤖 AI Stock Analysis</h2>
          <p className="text-gray-300">{summary}</p>
        </div>
      )}

      {/* 🔹 Chart Section */}
      {data.historical.length > 0 && (
        <div className="mt-6 w-full max-w-4xl">
          <h2 className="text-xl font-bold text-[#facc15] mb-4">📈 Stock Price Chart</h2>
          <StockChart data={data.historical} selectedDate={date} range={range} />
        </div>
      )}
    </div>
  );
}
