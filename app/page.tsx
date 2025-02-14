"use client";

import Head from "next/head";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* 🔹 Meta Tags for SEO */}
      <Head>
        <title>HistoVest - Explore Historical Stock Data</title>
        <meta 
          name="description" 
          content="Analyze historical stock performance, simulate investment strategies, and gain financial insights with HistoVest's data-driven tools." 
        />
        <meta name="keywords" content="historical stock data, stock analysis, investment simulator, financial insights, stock lookup, portfolio backtesting" />
        <meta name="author" content="HistoVest" />
        <meta property="og:title" content="HistoVest - Explore Historical Stock Data" />
        <meta property="og:description" content="Analyze historical stock performance, simulate investments, and gain insights for smarter decisions." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.histovest.com" />
        <meta property="og:image" content="https://www.histovest.com/preview-image.jpg" />
      </Head>

      {/* 🚀 Hero Section - Dark & Premium Look */}
      <main className="flex flex-col items-center bg-black min-h-screen text-gray-200 px-6">
        <section className="flex flex-col items-center justify-center text-center py-20 bg-[#111] w-full border-b border-gray-700 shadow-lg rounded-lg">
          <h1 className="text-4xl font-extrabold text-[#facc15] mb-4 drop-shadow-lg flex items-center gap-3">
            🚀 <span className="text-yellow-400">Explore Historical Stock Data</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            Analyze past stock performance, simulate investments, and gain insights for <span className="text-[#facc15] font-semibold">smarter financial decisions.</span>
          </p>
          <div className="flex space-x-4 mt-6">
            <Link
              href="/stock-data"
              className="px-6 py-3 border-2 border-[#facc15] text-[#facc15] font-semibold rounded-lg hover:bg-[#facc15] hover:text-black transition text-md shadow-md flex items-center gap-2"
            >
              📊 Stock Lookup
            </Link>
            <Link
              href="/historical-stock-simulator"
              className="px-6 py-3 bg-[#facc15] text-black font-semibold rounded-lg hover:bg-yellow-600 transition text-md shadow-md flex items-center gap-2"
            >
              🔍 Try the Simulator
            </Link>
          </div>
        </section>

        {/* ⭐ Why Use HistoVest? */}
        <section className="py-16 px-8 max-w-6xl mx-auto text-center bg-black/40 rounded-xl border border-gray-700 shadow-xl mt-12">
          <h2 className="text-3xl font-extrabold text-[#facc15] mb-6 flex items-center justify-center gap-2">
            Why Use HistoVest? 🤔
          </h2>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Whether you're a <span className="text-[#facc15] font-semibold">trader, researcher, or financial analyst</span>, HistoVest helps you 
            analyze **historical stock trends**, backtest portfolios, and explore **data-driven financial insights.** 
          </p>
        </section>

        {/* 🔹 Key Features */}
        <section className="py-16 w-full max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#facc15] mb-8">✨ Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
            <div className="bg-black/50 p-6 rounded-xl text-center border border-gray-700 hover:bg-black/60 transition shadow-lg">
              <h3 className="text-xl font-bold text-[#facc15]">📈 Stock Lookup</h3>
              <p className="text-gray-400 mt-3">
                Search **historical stock prices**, analyze trends, and gain insights for **smarter financial decisions**.
              </p>
            </div>
            <div className="bg-black/50 p-6 rounded-xl text-center border border-gray-700 hover:bg-black/60 transition shadow-lg">
              <h3 className="text-xl font-bold text-[#facc15]">💰 Investment Simulator</h3>
              <p className="text-gray-400 mt-3">
                Backtest **historical stock portfolios** to analyze **potential performance** under different market conditions.
              </p>
            </div>
            <div className="bg-black/50 p-6 rounded-xl text-center border border-gray-700 hover:bg-black/60 transition shadow-lg">
              <h3 className="text-xl font-bold text-[#facc15]">🤖 AI Market Insights</h3>
              <p className="text-gray-400 mt-3">
                Gain **AI-generated summaries** on historical stock performance, market trends, and financial analysis.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
