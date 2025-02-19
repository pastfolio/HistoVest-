import ReactMarkdown from "react-markdown";

export default function PortfolioResults({ portfolioEndValue, growth, summary, loadingSummary }: { portfolioEndValue: number | null, growth: string | null, summary: string | null, loadingSummary: boolean }) {
  console.log("🖥️ portfolioEndValue in PortfolioResults:", portfolioEndValue);

  return (
    <div className="mt-6 p-6 bg-gray-900/90 rounded-2xl border border-gray-700 shadow-xl">
      {/* Header */}
      <h2 className="text-2xl font-bold text-[#facc15] flex items-center gap-2 mb-4">
        📊 Portfolio Summary
      </h2>

      {/* Total End Value */}
      <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md">
        <span className="text-lg font-semibold text-gray-300">💰 Total End Value:</span>
        <span className="text-2xl font-bold text-green-400">
          {typeof portfolioEndValue === "number" && !isNaN(portfolioEndValue) ? `$${portfolioEndValue.toLocaleString()}` : "N/A"}
        </span>
      </div>

      {/* Growth */}
      <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md mt-3">
        <span className="text-lg font-semibold text-gray-300">📈 Growth:</span>
        <span className={`text-2xl font-bold ${growth && parseFloat(growth) >= 0 ? "text-green-400" : "text-red-500"}`}>
          {growth ?? "N/A"}
        </span>
      </div>

      {/* Loading Summary Animation */}
      {loadingSummary ? (
        <p className="text-lg text-gray-300 mt-4 flex items-center gap-2 animate-pulse">
          ⏳ Generating Portfolio Summary...
        </p>
      ) : summary ? (
        <div className="mt-6 p-6 bg-gray-800 rounded-2xl text-gray-300 text-md border border-gray-700 shadow-md leading-relaxed">
          <ReactMarkdown className="prose prose-invert">{summary}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-lg text-gray-500 mt-4">📄 No summary available.</p>
      )}
    </div>
  );
}
