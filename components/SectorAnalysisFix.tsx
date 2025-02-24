import { useEffect, useState } from "react";

export default function SectorAnalysis({ sector }) {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sector) return;

    setLoading(true);
    setData("");

    const eventSource = new EventSource(`/api/sector-analyzer?sector=${sector}`);

    eventSource.onmessage = (event) => {
      const chunk = JSON.parse(event.data);
      setData((prev) => prev + chunk); // 🔥 Adds text in real-time like ChatGPT typing
    };

    eventSource.onerror = (err) => {
      console.error("❌ Streaming error:", err);
      setError("Failed to load analysis.");
      eventSource.close();
    };

    eventSource.onopen = () => console.log("✅ Streaming started...");

    return () => eventSource.close();
  }, [sector]);

  return (
    <div className="p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">
        {sector ? sector.toUpperCase() : "Unknown"} Sector Analysis
      </h1>

      <button 
        onClick={() => window.location.reload()}
        className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition mb-4"
      >
        🔄 Refresh Data
      </button>

      {loading && <p className="text-gray-400">Generating live analysis...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* 💡 Typing Animation */}
      <pre className="bg-gray-800 p-4 rounded-lg whitespace-pre-wrap animate-pulse">
        {data || "Fetching AI-generated insights..."}
      </pre>
    </div>
  );
}
