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
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">
        {sector ? `${sector.charAt(0).toUpperCase() + sector.slice(1)} Sector Analysis` : "Loading..."}
      </h1>

      {loading && <p className="text-gray-400">Loading sector data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {data ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-300">Macroeconomic Overview</h2>
          <pre className="bg-gray-800 p-4 rounded-lg text-gray-300 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p className="text-gray-400">No data received.</p>
      )}
    </div>
  );
}
