"use client";

import { useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import StockPriceDisplay from "../../components/StockLookup/StockPriceDisplay";
import StockSummary from "../../components/StockLookup/StockSummary";

const StockChart = dynamic(() => import("./StockChart"), { ssr: false });

export default function StockDataPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [date, setDate] = useState("2022-12-12");
  const [range, setRange] = useState(30);
  const [data, setData] = useState({ daily: null, historical: [], metadata: null });
  const [closingPrice, setClosingPrice] = useState(null);
  const [closingDate, setClosingDate] = useState(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    setSummaryLoading(true);
    setSearched(true);
    setData({ daily: null, historical: [], metadata: null });
    setSummary("");
    setClosingPrice(null);
    setClosingDate(null);

    try {
      const stockResponse = await fetch(`/api/stock?symbol=${symbol}&date=${date}&range=${range}`);
      const stockResult = await stockResponse.json();

      if (stockResponse.ok) {
        setData(stockResult);

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
            setClosingDate(new Date(closestDateEntry.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }));
          } else {
            setClosingPrice(null);
          }
        } else {
          setClosingPrice(null);
        }
      } else {
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
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setSummaryLoading(false), 2000); // Add delay for smooth transition
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-gray-200 px-6">
      {/* 🔹 Meta Tags for SEO */}
      <Head>
        <title>HistoVest - AI-Powered Historical Stock Research</title>
        <meta name="description" content="Analyze stock performance on any date and understand what influenced price changes. Get AI-generated insights on market trends, economic events, and financial news." />
        <meta property="og:title" content="HistoVest - AI-Powered Historical Stock Research" />
        <meta property="og:description" content="Analyze stock performance on a specific date with AI-generated insights into market trends and financial events. Research smarter with HistoVest." />
      </Head>

      {/* 🔹 Page Header */}
      <section className="text-center max-w-5xl mx-auto py-6">
        <h1 className="text-5xl font-extrabold text-[#facc15]">📊 Historical Stock Research</h1>
        <p className="text-lg text-gray-400 mt-2">
          Enter a stock symbol and date to see its past performance. Get AI-driven insights on market trends and financial events.
        </p>
      </section>

      {/* 🔹 Stock Lookup Form */}
      <div className="max-w-3xl mx-auto mt-6 flex flex-wrap gap-4 justify-center items-center">
        <input 
          type="text" 
          value={symbol} 
          onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
          placeholder="Stock Symbol (e.g., AAPL)" 
          className="bg-gray-800 text-white p-3 text-lg rounded-md border border-gray-700 text-center w-36" 
        />
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="bg-gray-800 text-white p-3 text-lg rounded-md border border-gray-700 text-center" 
        />
        <input 
          type="number" 
          value={range} 
          onChange={(e) => setRange(parseInt(e.target.value))} 
          placeholder="Days" 
          className="bg-gray-800 text-white p-3 text-lg rounded-md border border-gray-700 text-center w-20" 
        />
        <button 
          onClick={fetchStockData} 
          className="bg-[#facc15] text-black font-bold py-3 px-6 rounded-md hover:bg-yellow-600 transition"
        >
          Search
        </button>
      </div>

      {/* 🔹 Closing Price (Smooth Load-In) */}
      {searched && closingPrice && (
        <div className="max-w-3xl mx-auto mt-6 text-center text-3xl font-semibold text-white transition-opacity duration-500">
          📉 Closing Price: <span className="text-[#facc15]">${closingPrice}</span> on {closingDate}
        </div>
      )}

      {/* 🔹 Full-Width Stock Chart (Smooth Load-In) */}
      {searched && data.historical.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8 transition-opacity duration-700">
          <h2 className="text-xl font-bold text-[#facc15] mb-4 text-center">📈 Stock Price Chart</h2>
          <div className="w-full">
            <StockChart data={data.historical} selectedDate={date} range={range} />
          </div>
        </div>
      )}

      {/* 🔹 Full-Width AI Summary (Pulsing Loading Effect) */}
      {searched && (
        <div className="max-w-6xl mx-auto mt-8 transition-opacity duration-700">
          <h2 className="text-xl font-bold text-[#facc15] mb-4 text-center">🤖 AI Stock Analysis</h2>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 text-lg text-gray-300 leading-relaxed">
            {summaryLoading ? (
              <p className="text-gray-400 text-center animate-pulse">⏳ Generating AI-powered summary...</p>
            ) : (
              summary || "No summary available."
            )}
          </div>
        </div>
      )}
    </div>
  );
}
