"use client";

import Link from "next/link";
import Head from "next/head"; // Added for SEO meta tags

export default function HomePage() {
  return (
    <main className="bg-black min-h-screen text-white">
      {/* 🔹 Meta Tags for SEO */}
      <Head>
        <title>HistoVest - Analyze Sectors & Historical Stock Data</title>
        <meta
          name="description"
          content="Analyze market sectors and learn from historical events with our Historical Stock Simulator. Unlock data-driven investment insights."
        />
        <meta
          name="keywords"
          content="HistoVest, stock market analysis, historical stock simulator, sector analysis, investment insights, AI finance tools"
        />
        <meta property="og:title" content="HistoVest - Analyze Sectors & Historical Stock Data" />
        <meta
          property="og:description"
          content="Explore market sectors and historical stock trends with our cutting-edge simulator. Make smarter investment decisions."
        />
        <meta property="og:image" content="/histovest-og-image.jpg" />
        <meta property="og:url" content="https://histovest.com" />
      </Head>

      {/* 🔹 Hero Section */}
      <section className="text-center py-16 bg-black">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to HistoVest</h1>
        <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
          Analyze market sectors and learn from historical events with our Historical Stock Simulator.
        </p>
        <Link href="/stock-research">
          <button className="bg-white text-black py-2 px-6 rounded hover:bg-gray-200 transition duration-300">
            Go to Stock Lookup
          </button>
        </Link>
      </section>

      {/* 🔹 Features Section */}
      <section className="bg-gray-900 py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose HistoVest?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
            <div className="p-6 bg-black border border-gray-800 rounded-lg">
              <h3 className="font-bold text-xl mb-2">Historical Stock Lookup</h3>
              <p className="text-gray-400">
                Analyze stock performance from any period with ease.
              </p>
            </div>
            <div className="p-6 bg-black border border-gray-800 rounded-lg">
              <h3 className="font-bold text-xl mb-2">Historical Stock Simulator</h3>
              <p className="text-gray-400">
                Test your strategies using historical data without the risk.
              </p>
            </div>
            <div className="p-6 bg-black border border-gray-800 rounded-lg">
              <h3 className="font-bold text-xl mb-2">Sector Analysis</h3>
              <p className="text-gray-400">
                Explore trends and insights across industries with detailed data.
              </p>
            </div>
            <div className="p-6 bg-black border border-gray-800 rounded-lg">
              <h3 className="font-bold text-xl mb-2">Easy-to-Use Interface</h3>
              <p className="text-gray-400">
                Navigate our platform effortlessly, even as a beginner.
              </p>
            </div>
            <div className="p-6 bg-black border border-gray-800 rounded-lg">
              <h3 className="font-bold text-xl mb-2">Secure Platform</h3>
              <p className="text-gray-400">
                Your data is protected with top-notch security protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 Social Media Links Section */}
      <footer className="bg-gray-950 py-8 text-gray-400">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Follow Us</h2>
          <div className="flex justify-center space-x-6">
            <a
              href="https://www.tiktok.com/@histovest"
              target="_blank"
              className="text-white hover:text-gray-200 transition"
              rel="noopener noreferrer"
            >
              TikTok: @histovest
            </a>
            <a
              href="https://www.instagram.com/histovest1"
              target="_blank"
              className="text-white hover:text-gray-200 transition"
              rel="noopener noreferrer"
            >
              Instagram: histovest1
            </a>
            <a
              href="https://www.youtube.com/@histovest"
              target="_blank"
              className="text-white hover:text-gray-200 transition"
              rel="noopener noreferrer"
            >
              YouTube: @histovest
            </a>
          </div>
          <p className="text-sm mt-4">
            © {new Date().getFullYear()} HistoVest. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}