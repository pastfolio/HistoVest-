import { useEffect, useState } from "react";

interface SectorAnalysisProps {
  sector: string;
}

export default function SectorAnalysis({ sector }: SectorAnalysisProps) {
  const [stockData, setStockData] = useState<any>(null);
  const [macroData, setMacroData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sector) return;

    setLoading(true);
    setStockData(null);
    setMacroData(null);
    setAiAnalysis("");
    setError(null);

    const url = `/api/sector-analyzer?sector=${encodeURIComponent(sector)}`;
    const eventSource = new EventSource(url);

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
        setAiAnalysis((prev) => prev + data.text); // Live typing effect
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

    // Cleanup
    return () => eventSource.close();
  }, [sector]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-yellow-400 text-center mb-8">
        {sector ? `${sector.charAt(0).toUpperCase() + sector.slice(1)} Sector Analysis` : "Loading..."}
      </h1>

      {loading && !aiAnalysis && <p className="text-gray-400 text-center text-xl">Loading sector data...</p>}
      {error && <p className="text-red-500 text-center text-xl">Error: {error}</p>}

      {stockData && macroData && (
        <div className="space-y-10">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-blue-300 mb-4 text-center">Stock Market Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-700 text-lg">
                <thead>
                  <tr className="bg-gray-700 text-yellow-300">
                    <th className="border border-gray-600 px-6 py-3">Ticker</th>
                    <th className="border border-gray-600 px-6 py-3">Price ($)</th>
                    <th className="border border-gray-600 px-6 py-3">Market Cap</th>
                    <th className="border border-gray-600 px-6 py-3">P/E Ratio</th>
                    <th className="border border-gray-600 px-6 py-3">Dividend Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stockData).map(([ticker, info]: [string, any], index) => (
                    <tr key={ticker} className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}>
                      <td className="border border-gray-600 px-6 py-3 font-semibold text-yellow-300">{ticker}</td>
                      <td className="border border-gray-600 px-6 py-3">{info.price || "N/A"}</td>
                      <td className="border border-gray-600 px-6 py-3">{info.marketCap || "N/A"}</td>
                      <td className="border border-gray-600 px-6 py-3">{info.peRatio || "N/A"}</td>
                      <td className="border border-gray-600 px-6 py-3">{info.dividendYield || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-yellow-300 mb-6 text-center">AI-Generated Analysis</h2>
        <p className="text-gray-300 text-lg leading-relaxed font-light italic whitespace-pre-line">
          {aiAnalysis || (loading ? "Typing AI analysis..." : "No analysis available.")}
        </p>
      </div>
    </div>
  );
}