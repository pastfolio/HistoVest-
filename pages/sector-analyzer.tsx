import { useEffect, useState, useRef } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

interface SectorAnalysisProps {
  initialSector?: string;
}

export default function SectorAnalysis({ initialSector }: SectorAnalysisProps) {
  const [stockData, setStockData] = useState<any>(null);
  const [macroData, setMacroData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>(initialSector || "");

  // Sort sectors alphabetically
  const sortedSectors = [
    // Technology
    "3D printing", "artificial intelligence (AI)", "augmented reality (AR)", "blockchain technology", "cloud computing", "consumer electronics", "cybersecurity", "data centers", "edge computing", "fintech", "gaming technology", "internet of things (IoT)", "IT services", "quantum computing", "robotics", "semiconductors", "software-as-a-service (SaaS)", "telecommunications equipment", "virtual reality (VR)", "web3",
    // Finance
    "asset management", "credit rating agencies", "cryptocurrencies", "hedge funds", "insurance", "investment banks", "mortgage lenders", "payment processing", "private equity", "REITs", "stock exchanges", "venture capital",
    // Energy
    "carbon credit trading", "geothermal energy", "hydrogen fuel cells", "natural gas", "natural gas liquids (NGLs)", "nuclear energy", "offshore drilling", "oil & gas exploration", "oil refining & marketing", "renewable energy", "solar power", "wind energy",
    // Healthcare
    "biotech", "cannabis biotechnology", "gene editing (CRISPR)", "genomics", "healthcare", "healthcare IT", "medical devices", "nutraceuticals", "personalized medicine", "pharmaceuticals", "telemedicine",
    // Industrials
    "construction & engineering", "defense & aerospace", "industrials",
    // Consumer Goods
    "consumer discretionary", "consumer staples", "luxury goods",
    // Retail & E-commerce
    "big box retail", "department stores", "e-commerce",
    // Transportation
    "airlines", "railroads", "transportation",
    // Commodities & Materials
    "agriculture", "cocoa & coffee production", "copper & industrial metals", "corn & soybean production", "diamond industry", "fertilizers & chemicals", "fishing & aquaculture", "forestry & timber", "gold mining", "metals & mining", "nickel & cobalt", "palm oil industry", "plastic recycling", "pulp & paper industry", "rare earth metals", "silver & precious metals", "water treatment",
    // Utilities
    "utilities",
    // Media & Entertainment
    "media",
    // Automobiles & EVs
    "automotive", "electric vehicles",
    // Travel & Hospitality
    "cruise lines", "hotels & resorts",
    // Aerospace & Space Tech
    "space industry",
    // Food & Beverage
    "alcohol & beverage", "fast food",
    // Social Media & Communication
    "social media",
    // Emerging Tech & Future Sectors
    "clean energy",
  ].sort(); // Sort alphabetically

  useEffect(() => {
    if (!selectedSector) return;

    setLoading(true);
    setError(null);
    setAiAnalysis(""); // Reset AI analysis for new sector, but keep stock/macro data if already loaded

    const url = `/api/sector-analyzer?sector=${encodeURIComponent(selectedSector)}`;
    const eventSource = new EventSource(url);
    const eventSourceRef = eventSource; // Store EventSource reference locally

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        setLoading(false);
        console.log("✅ Stream completed");
        return;
      }

      const data = JSON.parse(event.data);
      console.log("📥 Received:", data);

      if (data.type === "stock-macro") {
        setStockData(data.data.stockData);
        setMacroData(data.data.macroData);
      } else if (data.type === "aiText") {
        setAiAnalysis((prev) => prev + data.text);
      } else if (data.type === "error") {
        setError(data.message);
        eventSource.close();
        setLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error("❌ SSE Error:", err);
      setError("Failed to connect to the server.");
      eventSource.close();
      setLoading(false);
    };

    return () => {
      if (eventSourceRef) {
        eventSourceRef.close();
      }
    };
  }, [selectedSector]); // Re-run effect only when sector changes

  const handleSectorSelect = (sector: string) => {
    setSelectedSector(sector);
  };

  return (
    <div className={`${inter.className} min-h-screen bg-black text-white p-6`}>
      {/* Header (Unchanged, without MENU button) */}
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
          HistoVest
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Access up to date, easy to read, institutional style analysis for every sector. Compare historical sector cycles to now. Up to date sector news.
        </p>
      </header>

      {/* Main Content Area (Wide Table of Sectors, Black and White) */}
      <main className="w-full">
        {/* Sector Table (Alphabetical, Clickable, Thin Lines, Full Width) */}
        {!selectedSector && !loading && !aiAnalysis && !stockData && !macroData && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-2 text-lg text-gray-400">Sectors</th>
                </tr>
              </thead>
              <tbody>
                {sortedSectors.map((sector, index) => (
                  <tr
                    key={sector}
                    className={`border-b border-gray-800 hover:bg-gray-900 transition duration-200 ${
                      index % 2 === 0 ? "bg-black" : "bg-black"
                    }`}
                  >
                    <td
                      onClick={() => handleSectorSelect(sector)}
                      className="p-2 text-lg text-white cursor-pointer hover:text-gray-200"
                    >
                      {sector.charAt(0).toUpperCase() + sector.slice(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto text-center">
              Click a sector to view detailed analysis and market insights.
            </p>
          </div>
        )}

        {/* Loading/Error States (centered, professional look) */}
        {loading && !aiAnalysis && (
          <p className="text-center text-xl text-gray-400 animate-pulse mt-12">
            Loading sector data...
          </p>
        )}
        {error && (
          <p className="text-center text-xl text-red-400 bg-red-900/20 p-4 rounded-md max-w-2xl mx-auto mt-12">
            {error}
          </p>
        )}

        {/* Stock Market Overview (positioned below, professional spacing) */}
        {stockData && macroData && (
          <section className="w-full max-w-4xl mx-auto mb-16 mt-12">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
                Stock Market Overview
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-lg">
                  <thead>
                    <tr className="bg-gray-800 text-gray-300"> {/* Dark blue header */}
                      <th className="p-4 font-medium">Ticker</th>
                      <th className="p-4 font-medium">Price ($)</th>
                      <th className="p-4 font-medium">Market Cap</th>
                      <th className="p-4 font-medium">P/E Ratio</th>
                      <th className="p-4 font-medium">Dividend Yield</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stockData).map(([ticker, info]: [string, any], index) => (
                      <tr
                        key={ticker}
                        className={`border-b border-gray-800 ${
                          index % 2 === 0 ? "bg-black" : "bg-gray-850"
                        } text-gray-200 hover:bg-gray-800 transition duration-200`}
                      >
                        <td className="p-4 font-medium">{ticker}</td>
                        <td className="p-4">{info.price || "N/A"}</td>
                        <td className="p-4">{info.marketCap || "N/A"}</td>
                        <td className="p-4">{info.peRatio || "N/A"}</td>
                        <td className="p-4">{info.dividendYield || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Sector Analysis (positioned below, professional spacing) */}
        {(aiAnalysis || loading) && (
          <section className="w-full max-w-4xl mx-auto">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
                {selectedSector
                  ? `${selectedSector.charAt(0).toUpperCase() + selectedSector.slice(1)} Analysis`
                  : "Sector Analysis"}
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {aiAnalysis || (loading ? "Generating detailed analysis..." : "")}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}