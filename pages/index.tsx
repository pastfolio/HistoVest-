"use client";

import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [user, setUser] = useState(null);

  // Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();
  }, []);

  return (
    <>
      {/* 🔹 Meta Tags for SEO */}
      <Head>
        <title>HistoVest - Sector Analysis & Historical Stock Simulation</title>
        <meta
          name="description"
          content="Explore 70+ unique sectors with live, easy-to-understand data and simulate decades of market history with HistoVest’s Historical Stock Simulator."
        />
        <meta
          name="keywords"
          content="HistoVest, sector analysis, historical stock simulator, live market data, investment insights, stock market trends, financial tools"
        />
        <meta name="author" content="HistoVest" />
        <meta property="og:title" content="HistoVest - Sector Analysis & Historical Stock Simulation" />
        <meta
          property="og:description"
          content="Analyze 70+ sectors with live data and simulate historical stock performance with HistoVest. Simple, powerful financial insights for all investors."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.histovest.com" />
        <meta property="og:image" content="https://www.histovest.com/preview-image.jpg" />
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

          body {
            font-family: 'Inter', sans-serif;
          }
        `}</style>
      </Head>

      <main className="bg-black min-h-screen text-white">
        {/* 🔹 Hero Section */}
        <section className="relative flex items-center justify-center h-screen px-6">
          <div className="text-center z-10">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
              HistoVest
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-4">
              Explore 70+ unique sectors with live data, simple to understand.
            </p>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10">
              Simulate decades of market history with our Historical Stock Simulator to test strategies.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="/stock-data"
                className="px-8 py-3 bg-white text-black font-semibold border border-gray-800 hover:bg-gray-200 transition duration-300"
              >
                Historical Stock Lookup
              </Link>
              <Link
                href="/historical-stock-simulator"
                className="px-8 py-3 bg-gray-800 text-white font-semibold border border-gray-800 hover:bg-gray-700 transition duration-300"
              >
                Historical Stock Simulator
              </Link>
              <Link
                href="/sector-analyzer"
                className="px-8 py-3 bg-gray-800 text-white font-semibold border border-gray-800 hover:bg-gray-700 transition duration-300"
              >
                Sector Analyzer
              </Link>
            </div>

            {/* 🔹 Auth Section */}
            <div className="mt-8 flex justify-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-6 py-2 bg-gray-700 text-white font-semibold hover:bg-gray-600 transition duration-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setUser(null);
                    }}
                    className="px-6 py-2 bg-gray-700 text-white font-semibold hover:bg-gray-600 transition duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-6 py-2 bg-gray-700 text-white font-semibold hover:bg-gray-600 transition duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-2 bg-gray-700 text-white font-semibold hover:bg-gray-600 transition duration-300"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 🔹 Features Section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">Why HistoVest?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-900 border border-gray-800">
                <h3 className="text-2xl font-semibold mb-4">Sector Analyzer</h3>
                <p className="text-gray-400 text-lg">
                  Access live data across 70+ sectors, from tech to healthcare, with simple, actionable insights to guide your investments.
                </p>
              </div>
              <div className="p-6 bg-gray-900 border border-gray-800">
                <h3 className="text-2xl font-semibold mb-4">Historical Stock Simulator</h3>
                <p className="text-gray-400 text-lg">
                  Backtest your strategies with decades of historical market data. Learn from past events to build smarter investment plans.
                </p>
              </div>
              <div className="p-6 bg-gray-900 border border-gray-800">
                <h3 className="text-2xl font-semibold mb-4">Historical Stock Lookup</h3>
                <p className="text-gray-400 text-lg">
                  Analyze the past performance of any stock with detailed historical data, helping you make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 🔹 Call-to-Action Section */}
        <section className="py-16 px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto text-lg">
            Join thousands of investors using HistoVest to analyze sectors and backtest strategies. Start exploring now.
          </p>
          <Link href="/historical-stock-simulator">
            <button className="px-8 py-3 bg-white text-black font-semibold border border-gray-800 hover:bg-gray-200 transition duration-300">
              Try the Simulator Now
            </button>
          </Link>
        </section>

        {/* 🔹 Footer */}
        <footer className="bg-gray-950 py-8 px-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} HistoVest. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}