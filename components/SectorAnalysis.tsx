import { useEffect, useState } from "react";

interface SectorAnalysisProps {
  sector: string;
}

export default function SectorAnalysis({ sector }: SectorAnalysisProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sector) {
      console.warn("⚠ No sector provided, skipping API call.");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        console.log(`🚀 Fetching data for sector: ${sector}`);

        const response = await fetch(`/api/sector-analyzer?sector=${sector}`);
        console.log("📡 API Request Sent:", response);

        if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

        const result = await response.json();
        console.log("✅ API Response Received:", result);

        setData(result);
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
        console.log("⏳ Fetching complete");
      }
    }

    fetchData();
  }, [sector]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Title */}
      <h1 className="text-4xl font-bold text-yellow-400 text-center mb-8">
        {sector ? `${sector.charAt(0).toUpperCase() + sector.slice(1)} Sector Analysis` : "Loading..."}
      </h1>

      {loading && <p className="text-gray-400 text-center text-xl">Loading sector data...</p>}
      {error && <p className="text-red-500 text-center text-xl">Error: {error}</p>}

      {data && (
        <div className="space-y-10">
          {/* 📊 Macroeconomic Overview */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-blue-300 mb-4 text-center">Macroeconomic Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-lg text-center">
              <div className="bg-gray-700 p-4 rounded-lg">
                <span className="block text-yellow-400 font-semibold">GDP Growth</span>
                <span className="text-green-400">{data.macroData["GDP Growth"]}%</span>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <span className="block text-yellow-400 font-semibold">Inflation Rate</span>
                <span className="text-red-400">{data.macroData["Inflation Rate"]}%</span>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <span className="block text-yellow-400 font-semibold">Interest Rates</span>
                <span className="text-yellow-300">{data.macroData["Interest Rates"]}%</span>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <span className="block text-yellow-400 font-semibold">Oil Prices</span>
                <span className="text-yellow-500">${data.macroData["Oil Prices"]}</span>
              </div>
            </div>
          </div>

          {/* 📈 Stock Market Overview */}
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
                  {Object.entries(data.stockData).map(([ticker, info]: any, index) => (
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

          {/* 🤖 AI-Generated Analysis */}
          <div className="bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold text-yellow-300 mb-6 text-center">AI-Generated Analysis</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light italic">
              {typeof data.aiAnalysis === "object" && "text" in data.aiAnalysis
                ? data.aiAnalysis.text
                : JSON.stringify(data.aiAnalysis, null, 2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
