"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>HistoVest - Historical Stock Analysis & Investment Simulation</title>
        <meta 
          name="description" 
          content="Analyze historical stock performance, simulate investments, and gain AI-driven insights to make smarter financial decisions with HistoVest." 
        />
        <meta name="keywords" content="historical stock data, stock market trends, investment simulator, AI financial insights, portfolio backtesting, historical stock lookup" />
        <meta name="author" content="HistoVest" />
        <meta property="og:title" content="HistoVest - Historical Stock Analysis & Investment Simulation" />
        <meta property="og:description" content="Backtest stock portfolios, analyze market trends, and explore AI-powered financial insights with HistoVest." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.histovest.com" />
        <meta property="og:image" content="https://www.histovest.com/preview-image.jpg" />
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

          body {
            font-family: 'Poppins', sans-serif;
          }
        `}</style>
      </Head>

      <main className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white min-h-screen">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center h-screen overflow-hidden">
          <div className="z-10 text-center">
            <h1 className="text-7xl font-black leading-tight text-yellow-400 mb-6">
              Explore Historical Stock Data
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              Analyze past stock performance, simulate investments, and gain insights for <span className="text-yellow-400 font-semibold">smarter financial decisions</span>.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/stock-data"
                className="px-8 py-4 bg-transparent border-2 border-yellow-400 text-yellow-400 font-bold rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300 ease-in-out shadow-lg"
              >
                📊 Historical Stock Lookup
              </Link>
              <Link
                href="/historical-stock-simulator"
                className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-500 transition-all duration-300 ease-in-out shadow-lg"
              >
                🔍 Try the Simulator
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 z-0">
            <Image
              src="/path/to/hero-image.jpg" // Replace with your image path
              alt="Stock Market Chart"
              layout="fill"
              objectFit="cover"
              quality={100}
              className="opacity-10"
            />
          </div>
        </section>

        {/* Why Use HistoVest? */}
        <section className="py-24 px-6 sm:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-5xl font-extrabold text-yellow-400 mb-8">
              Why Use HistoVest?
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Whether you're a <span className="text-yellow-400 font-semibold">trader, researcher, or financial analyst</span>, HistoVest equips you with the tools to analyze historical stock trends, backtest portfolios, and delve into data-driven financial insights. Our platform transcends traditional analysis, offering:
            </p>
            <ul className="mt-6 text-left mx-auto max-w-3xl list-disc list-inside">
              <li className="mb-2"><span className="text-yellow-400 font-semibold">Comprehensive Data Analysis:</span> Access decades of stock data to uncover market patterns.</li>
              <li className="mb-2"><span className="text-yellow-400 font-semibold">Portfolio Backtesting:</span> Simulate investment strategies under various market scenarios to forecast performance.</li>
              <li className="mb-2"><span className="text-yellow-400 font-semibold">AI-Powered Insights:</span> Use cutting-edge AI to interpret complex market trends and economic indicators, giving you a strategic advantage.</li>
            </ul>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-24 px-6 sm:px-12 bg-black/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-yellow-400 mb-16">✨ Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: "📈", title: "Historical Stock Lookup", description: "Search historical stock prices, analyze market trends, and gain insights for smarter financial decisions." },
                { icon: "💰", title: "Investment Simulator", description: "Backtest historical stock portfolios to analyze potential performance under different market conditions." },
                { icon: "🤖", title: "AI Market Insights", description: "Gain AI-generated summaries on historical stock performance, market trends, and financial analysis." }
              ].map((feature, index) => (
                <div key={index} className="bg-gray-800 p-8 rounded-3xl text-center transition-all duration-500 ease-in-out hover:shadow-2xl hover:bg-gray-700">
                  <span className="text-4xl mb-4 block">{feature.icon}</span>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}