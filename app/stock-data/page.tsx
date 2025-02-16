"use client";

import { useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Link from "next/link";
import StockPriceDisplay from "../../components/StockLookup/StockPriceDisplay"; // ✅ Keeping this new file
import StockSummary from "../../components/StockLookup/StockSummary"; // ✅ Keeping this new AI summary
const StockChart = dynamic(() => import("./StockChart"), { ssr: false }); // ✅ Keeping the old chart

export default function StockDataPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [date, setDate] = useState("2022-12-12");
  const [range, setRange] = useState(30);
  const [data, setData] = useState({ daily: null, historical: [], metadata: null });
  const [closingPrice, setClosingPrice] = useState(null);
  const [closingDate, setClosingDate] = useState(null);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    setError("");
    setData({ daily: null, historical: [], metadata: null });
    setSummary("");
    setClosingPrice(null);
    setClosingDate(null);

    try {
      const stockResponse = await fetch(`/api/stock?symbol=${symbol}&date=${date}&range=${range}`);
      const stockResult = await stockResponse.json();

      if (stockResponse.ok) {
        setData(stockResult);

        // ✅ Find the closest available closing price before the selected date
        if (stockResult.historical.length > 0) {
          let closestDateEntry = null;

          for (let i = stockResult.historical.length - 1; i >= 0; i--) {
            const entry = stockResult.historical[i];
            const entryDate = new Date(entry.date).toISOString().split("T")[0];

            if (entryDate <= date) {
              closestDateEntry = entry;
              break;
            }
          }

          if (closestDateEntry) {
            setClosingPrice(closestDateEntry.close.toFixed(2));
            setClosingDate(new Date(closestDateEntry.date).toISOString().split("T")[0]);
          } else {
            setClosingPrice("No data available");
          }
        } else {
          setClosingPrice("No data available");
        }
      } else {
        setError(stockResult.error || "Failed to fetch stock data");
        return;
      }

      // ✅ Fetch AI summary **even if no exact price is found**
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
          content="Analyze stock performance on any date and understand what influenced price changes. Get AI-generated insights on market trends, economic events, and financial news." 
        />
        <meta name="keywords" content="historical stock research, stock performance analysis, AI financial insights, market trends, stock lookup, economic events, stock price history" />
        <meta name="author" content="HistoVest" />
        <meta property="og:title" content="HistoVest - AI-Powered Historical Stock Research" />
        <meta property="og:description" content="Analyze stock performance on a specific date with AI-generated insights into market trends and financial events. Research smarter with HistoVest." />
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
          Enter a stock symbol and date to see how it performed. Get AI-powered insights on market trends, economic events, and financial news that may have influenced the price.
        </p>
      </section>

      {/* 🔹 Display Closing Price at the Top */}
      <StockPriceDisplay closingPrice={closingPrice} closingDate={closingDate} selectedDate={date} />

      {/* 🔹 Search Section */}
      <div className="mt-8 bg-gray-900 p-6 rounded-xl w-full max-w-3xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-[#facc15] text-center mb-4">🔍 Research Stock Price Performance</h2>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Enter stock symbol (e.g., AAPL)" className="bg-gray-800 text-white p-3 text-lg rounded-md border border-gray-700 text-center w-40" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-gray-800 text-white p-3 text-lg rounded-md border border-gray-700 text-center" />
          <input type="number" value={range} onChange={(e) => setRange(parseInt(e.target.value))} placeholder="Range" className="bg-gray-800 text-white p-3 text-lg rounded-md border border-gray-700 text-center w-20" />
          <button onClick={fetchStockData} className="bg-[#facc15] text-black font-bold py-3 px-6 rounded-md hover:bg-yellow-600 transition">Search</button>
        </div>
      </div>

      {/* 🔹 AI-Generated Stock Analysis */}
      <StockSummary summary={summary} />

      {/* 🔹 Stock Price Chart */}
      {data.historical.length > 0 && (
        <div className="mt-6 w-full max-w-4xl">
          <h2 className="text-xl font-bold text-[#facc15] mb-4">📈 Stock Price Chart</h2>
          <StockChart data={data.historical} selectedDate={date} range={range} />
        </div>
      )}
    </div>
  );
}
