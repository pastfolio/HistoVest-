"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Ensure this import works

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

            {/* ✅ Login/Signup Section */}
            <div className="mt-8 flex justify-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-300"
                  >
                    🏠 Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setUser(null);
                    }}
                    className="px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition duration-300"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition duration-300"
                  >
                    🔐 Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-300"
                  >
                    ✨ Sign Up
                  </Link>
                </>
              )}
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
      </main>
    </>
  );
}
