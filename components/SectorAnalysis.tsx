import { useEffect, useState } from "react";

export default function SectorAnalysis({ sector }) {
  const [data, setData] = useState({ macroData: {}, stockData: {}, aiAnalysis: "" });
  const [streamedText, setStreamedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sector) return;

    setLoading(true);
    setData({ macroData: {}, stockData: {}, aiAnalysis: "" });
    setStreamedText("");

    const eventSource = new EventSource(`/api/sector-analyzer?sector=${sector}`);

    eventSource.onmessage = (event) => {
      try {
        const chunk = JSON.parse(event.data);
        if (chunk.aiAnalysis) {
          setStreamedText((prev) => prev + chunk.aiAnalysis);
        }
      } catch (error) {
        console.error("❌ Error parsing AI response:", error);
      }
    };

    eventSource.onerror = () => {
      setError("Failed to load analysis.");
      eventSource.close();
    };

    return () => eventSource.close();
  }, [sector]);

  return (
    <div className="p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">{sector.toUpperCase()} Sector Analysis</h1>
      {loading && <p className="text-gray-400">Generating analysis...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <pre className="bg-gray-800 p-4 rounded-lg">{streamedText}</pre>
    </div>
  );
}
