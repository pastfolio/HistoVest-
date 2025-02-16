export default function StockSummary({ summary }: any) {
    return summary ? (
      <div className="bg-gray-900 p-6 mt-6 rounded-lg border border-gray-700 w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-bold text-[#facc15] mb-3">🤖 AI Stock Analysis</h2>
        <p className="text-gray-300">{summary}</p>
      </div>
    ) : null;
  }
  