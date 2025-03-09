import { useEffect, useState, useRef } from "react";
import { Inter } from "next/font/google";
import { FaBars } from "react-icons/fa";

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
  const eventSourceRef = useRef<EventSource | null>(null);

  const sortedSectors = [
    "agriculture", "airlines", "artificial intelligence (ai)", "asset management",
    "automotive", "big box retail", "biotech", "blockchain technology",
    "chemicals", "clean energy", "cloud computing", "construction",
    "consumer goods", "corn & soybean production", "cybersecurity", "data centers",
    "defense", "department stores", "drones", "electric vehicles",
    "energy", "entertainment", "fintech", "fishing & aquaculture",
    "food & beverage", "gaming", "gene editing (crispr)", "healthcare",
    "hedge funds", "hospitality", "hydrogen fuel cells", "information technology",
    "insurance", "investment banks", "logistics", "luxury goods",
    "media", "medical devices", "mining", "mortgage lenders",
    "natural gas", "nickel & cobalt", "nuclear energy", "offshore drilling",
    "oil & gas exploration", "oil refining & marketing", "palm oil industry",
    "payment processing", "pharmaceuticals", "private equity",
    "quantum computing", "railroads", "real estate", "reits",
    "renewable energy", "robotics", "semiconductors", "software-as-a-service (saas)",
    "solar power", "space industry", "steel", "stock exchanges",
    "telemedicine", "tobacco", "tourism", "transportation",
    "venture capital", "wind energy",
  ].sort();

  useEffect(() => {
    if (!selectedSector) return;

    setLoading(true);
    setStockData(null);
    setMacroData(null);
    setAiAnalysis("");
    setError(null);

    const url = `/api/sector-analysis?sector=${encodeURIComponent(selectedSector)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        setLoading(false);
      } else {
        const data = JSON.parse(event.data);
        console.log("📥 Stream Event:", data);
        if (data.stockData) setStockData(data.stockData);
        if (data.macroData) setMacroData(data.macroData);
        if (data.aiAnalysis) setAiAnalysis((prev) => prev + data.aiAnalysis);
        if (data.error) setError(data.error);
      }
    };

    eventSource.onerror = () => {
      setError("Failed to connect to the server.");
      setLoading(false);
      eventSource.close();
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [selectedSector]);

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
      eventSourceRef.current.close();
    }
  };

  const handleChangeSector = () => {
    setIsDropdownOpen(true);
  };

  return (
    <div className={`${inter.className} min-h-screen bg-black text-white p-6`}>
      {/* Header */}
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
          HistoVest
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Access up-to-date, easy-to-read, institutional-style analysis for every sector. Compare historical cycles to today.
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
          {selectedSector && !loading && (
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
            {sortedSectors.map((sectorOption) => (
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
      {loading && <p className="text-center text-xl text-gray-400 animate-pulse mt-12">Loading sector data...</p>}
      {error && <p className="text-center text-xl text-red-400 bg-red-900/20 p-4 rounded-md max-w-2xl mx-auto mt-12">{error}</p>}

      {/* Stock Market Overview */}
      {stockData && macroData && (
        <section className="w-full max-w-4xl mx-auto mb-16 mt-12">
          <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
            <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
              Stock Market Overview
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-lg">
                <thead>
                  <tr className="bg-gray-800 text-gray-300">
                    <th className="p-4 font-medium">Ticker</th>
                    <th className="p-4 font-medium">Price ($)</th>
                    <th className="p-4 font-medium">Market Cap</th>
                    <th className="p-4 font-medium">P/E Ratio</th>
                    <th className="p-4 font-medium">Dividend Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stockData).map(([ticker, info]: [string, any]) => (
                    <tr
                      key={ticker}
                      className="border-b border-gray-800 text-gray-200 hover:bg-gray-800 transition duration-200"
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

      {/* AI Analysis */}
      {aiAnalysis && (
        <section className="w-full max-w-4xl mx-auto">
          <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
            <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">{selectedSector} Analysis</h2>
            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
          </div>
        </section>
      )}
    </div>
  );
}