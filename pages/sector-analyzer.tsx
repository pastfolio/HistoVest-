import { useEffect, useState, useRef } from "react";
import { Inter } from "next/font/google";
import { FaBars } from "react-icons/fa"; // Only Bars icon needed

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null); // Keep for closing streams

  const sectors = [
    // Technology
    "technology", "software-as-a-service (SaaS)", "semiconductors", "cybersecurity", "artificial intelligence (AI)",
    "cloud computing", "fintech", "blockchain technology",
    // Finance
    "finance", "investment banks", "asset management", "insurance", "REITs",
    // Energy
    "energy", "oil & gas exploration", "renewable energy", "nuclear energy",
    // Healthcare
    "healthcare", "biotech", "pharmaceuticals", "medical devices",
    // Industrials
    "industrials", "defense & aerospace", "construction & engineering",
    // Consumer Goods
    "consumer discretionary", "consumer staples", "luxury goods",
    // Retail & E-commerce
    "e-commerce", "big box retail", "department stores",
    // Transportation
    "transportation", "airlines", "railroads",
    // Commodities & Materials
    "metals & mining", "gold mining", "agriculture",
    // Utilities
    "utilities", "water treatment",
    // Media & Entertainment
    "media", "gaming technology",
    // Automobiles & EVs
    "automotive", "electric vehicles",
    // Travel & Hospitality
    "hotels & resorts", "cruise lines",
    // Aerospace & Space Tech
    "space industry",
    // Food & Beverage
    "fast food", "alcohol & beverage",
    // Social Media & Communication
    "social media", "telecommunications",
    // Emerging Tech & Future Sectors
    "quantum computing", "web3", "clean energy", "autonomous vehicles",
  ];

  useEffect(() => {
    if (!selectedSector) return;

    setLoading(true);
    setError(null);
    setAiAnalysis(""); // Reset AI analysis for new sector, but keep stock/macro data if already loaded

    const url = `/api/sector-analyzer?sector=${encodeURIComponent(selectedSector)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource; // Store EventSource reference

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
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [selectedSector]); // Re-run effect only when sector changes

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleSectorSelect = (sector: string) => {
    setSelectedSector(sector);
    setIsDropdownOpen(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close(); // Close existing stream
    }
  };

  const handleChangeSector = () => {
    setIsDropdownOpen(true); // Open the dropdown for changing sectors
  };

  return (
    <div className={`${inter.className} min-h-screen bg-black text-white p-6`}>
      {/* Header */}
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
          HistoVest
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Access up to date, easy to read, institutional style analysis for every sector. Compare historical sector cycles to now. Up to date sector news.
        </p>
      </header>

      {/* Sector Selection and Change Sector Button */}
      <div className="flex justify-center mb-16 relative" ref={dropdownRef}>
        <div className="flex gap-4">
          <button
            onClick={toggleDropdown}
            disabled={loading}
            className={`px-4 py-2 bg-black text-white font-semibold rounded-md shadow-md hover:bg-gray-800 transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            } flex items-center gap-2`}
          >
            <FaBars className="text-lg" />
            {selectedSector
              ? `${selectedSector.charAt(0).toUpperCase() + selectedSector.slice(1)}`
              : "Select Sector"}
          </button>
          {loading && (
            <button
              onClick={handleChangeSector}
              className="px-4 py-2 bg-black text-white font-semibold rounded-md shadow-md hover:bg-gray-800 transition duration-300 flex items-center gap-2"
            >
              Change Sector
            </button>
          )}
        </div>
        {isDropdownOpen && (
          <div className="absolute top-14 z-10 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-72 overflow-y-auto w-64">
            {sectors.map((sectorOption) => (
              <div
                key={sectorOption}
                onClick={() => handleSectorSelect(sectorOption)}
                className="px-4 py-2 text-gray-200 hover:bg-gray-700 cursor-pointer transition duration-200"
              >
                {sectorOption.charAt(0).toUpperCase() + sectorOption.slice(1)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading/Error States */}
      {loading && !aiAnalysis && (
        <p className="text-center text-xl text-gray-400 animate-pulse">
          Loading sector data...
        </p>
      )}
      {error && (
        <p className="text-center text-xl text-red-400 bg-red-900/20 p-4 rounded-md max-w-2xl mx-auto">
          {error}
        </p>
      )}

      {/* Stock Market Overview */}
      {stockData && macroData && (
        <section className="mb-16">
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

      {/* Sector Analysis */}
      {(aiAnalysis || loading) && (
        <section>
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
      {!aiAnalysis && !loading && (
        <p className="text-center text-lg text-gray-500 mt-4">
          Select a sector to view analysis.
        </p>
      )}
    </div>
  );
}