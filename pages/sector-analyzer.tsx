import { useEffect, useState, useRef } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

interface SectorAnalysisProps {
  initialSector?: string;
}

export default function SectorAnalysis({ initialSector }: SectorAnalysisProps) {
  const [stockData, setStockData] = useState<any>(null);
  const [macroData, setMacroData] = useState<any>(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>(initialSector || "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Updated sector list to match the image
  const sortedSectors = [
    "3d printing",
    "it services",
    "reits",
    "agriculture",
    "airlines",
    "alcohol & beverage",
    "artificial intelligence (ai)",
    "asset management",
    "augmented reality (ar)",
    "automotive",
    "big box retail",
    "biotech",
    "blockchain technology",
    "chemicals",
    "clean energy",
    "cloud computing",
    "construction",
    "consumer goods",
    "corn & soybean production",
    "cybersecurity",
    "data centers",
    "defense",
    "department stores",
    "drones",
    "electric vehicles",
    "energy",
    "entertainment",
    "fintech",
    "fishing & aquaculture",
    "food & beverage",
    "gaming",
    "gene editing (crispr)",
    "healthcare",
    "hedge funds",
    "hospitality",
    "hydrogen fuel cells",
    "information technology",
    "insurance",
    "investment banks",
    "logistics",
    "luxury goods",
    "media",
    "medical devices",
    "mining",
    "mortgage lenders",
    "natural gas",
    "nickel & cobalt",
    "nuclear energy",
    "offshore drilling",
    "oil & gas exploration",
    "oil refining & marketing",
    "palm oil industry",
    "payment processing",
    "pharmaceuticals",
    "private equity",
    "quantum computing",
    "railroads",
    "real estate",
    "renewable energy",
    "robotics",
    "semiconductors",
    "software-as-a-service (saas)",
    "solar power",
    "space industry",
    "steel",
    "stock exchanges",
    "telemedicine",
    "tobacco",
    "tourism",
    "transportation",
    "venture capital",
    "wind energy",
  ].sort();

  useEffect(() => {
    if (!selectedSector) return;

    setLoading(true);
    setStockData(null);
    setMacroData(null);
    setSentimentAnalysis("");
    setAiAnalysis("");
    setError(null);
    setFeedback(null);

    // Removed timeFrame from the API call
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
        if (data.sentimentAnalysis) setSentimentAnalysis(data.sentimentAnalysis);
        if (data.aiAnalysis) setAiAnalysis((prev) => prev + data.aiAnalysis);
        if (data.feedbackPrompt) setFeedback(""); // Show feedback buttons when prompted
        if (data.error) setError(data.error);
      }
    };

    eventSource.onerror = () => {
      setError("Failed to connect to the server. Please try again.");
      setLoading(false);
      eventSource.close();
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [selectedSector]); // Removed timeFrame dependency

  const handleSectorSelect = (sector: string) => {
    setSelectedSector(sector);
    if (eventSourceRef.current) eventSourceRef.current.close();
  };

  const handleFeedback = (response: "yes" | "no") => {
    setFeedback(response);
    console.log(`User feedback: ${response}`); // Log feedback (could send to backend)
  };

  return (
    <div className={`${inter.className} min-h-screen bg-black text-white flex`}>
      {/* Sidebar for Sectors */}
      <aside className="w-64 bg-black border-r border-gray-800 p-6 h-screen overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Sectors</h2>
        <ul>
          {sortedSectors.map((sectorOption) => (
            <li
              key={sectorOption}
              onClick={() => handleSectorSelect(sectorOption)}
              className={`py-2 px-4 text-gray-200 hover:bg-gray-700 cursor-pointer transition duration-200 border-b border-gray-700 ${
                selectedSector === sectorOption ? "bg-gray-700" : ""
              }`}
            >
              {sectorOption.charAt(0).toUpperCase() + sectorOption.slice(1)}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            Sector Analysis
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Access the HistoVest Sector Analysis to gain real time, actionable information from our comprehensive list of 70 different stock market sectors. Easy to read, reliable, and institutional grade analysis. 
          </p>
        </header>

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
                      <th className="p-4 font-medium">Year Change</th>
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
                        <td className="p-4">{info.yearChange || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Macroeconomic Overview */}
        {macroData && (
          <section className="w-full max-w-4xl mx-auto mb-16">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
                Macroeconomic Overview
              </h2>
              <p className="text-gray-300 text-lg">
                {macroData["GDP Growth"] !== "N/A" ? `GDP Growth: ${macroData["GDP Growth"]}%` : "GDP Growth: N/A"}
                {" | "}
                {macroData["Inflation Rate"] !== "N/A" ? `Inflation: ${macroData["Inflation Rate"]}%` : "Inflation: N/A"}
                {" | "}
                {macroData["Interest Rates"] !== "N/A" ? `Interest Rates: ${macroData["Interest Rates"]}%` : "Interest Rates: N/A"}
                {macroData["Oil Prices"] && macroData["Oil Prices"] !== "N/A" ? ` | Oil Prices: $${macroData["Oil Prices"]}` : ""}
              </p>
            </div>
          </section>
        )}

        {/* Sentiment Analysis */}
        {sentimentAnalysis && (
          <section className="w-full max-w-4xl mx-auto mb-16">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
                Sentiment Analysis from X
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{sentimentAnalysis}</p>
            </div>
          </section>
        )}

        {/* AI Analysis */}
        {aiAnalysis && (
          <section className="w-full max-w-4xl mx-auto mb-16">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <h2 className="text-3xl font-semibold text-gray-100 mb-6 text-center">
                {selectedSector.charAt(0).toUpperCase() + selectedSector.slice(1)} Analysis
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
            </div>
          </section>
        )}

        {/* Feedback Section */}
        {feedback === "" && (
          <section className="w-full max-w-4xl mx-auto mb-16 text-center">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <p className="text-gray-300 text-lg mb-4">Was this analysis helpful?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleFeedback("yes")}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition duration-300"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleFeedback("no")}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 transition duration-300"
                >
                  No
                </button>
              </div>
            </div>
          </section>
        )}
        {feedback && feedback !== "" && (
          <section className="w-full max-w-4xl mx-auto mb-16 text-center">
            <p className="text-gray-300 text-lg">Thank you for your feedback!</p>
          </section>
        )}
      </div>
    </div>
  );
}