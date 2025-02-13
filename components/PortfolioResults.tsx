import ReactMarkdown from "react-markdown";

interface Props {
  portfolioEndValue: number | null;
  growth: string | null;
  summary: string | null;
  loadingSummary: boolean;
}

export default function PortfolioResults({ portfolioEndValue, growth, summary, loadingSummary }: Props) {
  return (
    <div className="mt-6">
      {portfolioEndValue !== null && <p>Total End Value: ${portfolioEndValue.toLocaleString()}</p>}
      {growth && <p>Growth: {growth}%</p>}
      {loadingSummary && <p>Generating Portfolio Summary...</p>}
      {summary && (
        <div className="summary-container mt-6">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
