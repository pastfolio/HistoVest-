"use client";

import { useState } from "react";

interface Stock {
  symbol: string;
  percentage: string;
}

export default function Simulator() {
  const [stocks, setStocks] = useState<Stock[]>([{ symbol: "", percentage: "" }]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [portfolioStartValue, setPortfolioStartValue] = useState<number | null>(null);
  const [portfolioEndValue, setPortfolioEndValue] = useState<number | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addStock = () => {
    if (stocks.length < 10) {
      setStocks([...stocks, { symbol: "", percentage: "" }]);
    }
  };

  const handleStockChange = (index: number, field: "symbol" | "percentage", value: string) => {
    const updatedStocks = [...stocks];
    updatedStocks[index][field] = value;
    setStocks(updatedStocks);
  };

  const removeStock = (index: number) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const calculatePortfolio = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, startDate, endDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate portfolio");
      }

      const result = await response.json();
      setPortfolioStartValue(result.startValue);
      setPortfolioEndValue(result.endValue);
      setSummary(result.summary);
    } catch (err) {
      console.error("Error calculating portfolio:", err);
      setError("An error occurred while calculating the portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setStocks([{ symbol: "", percentage: "" }]);
    setStartDate("");
    setEndDate("");
    setPortfolioStartValue(null);
    setPortfolioEndValue(null);
    setSummary("");
    setError(null);
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>HistoVest Simulator</h1>

      <div>
        <h2 style={{ color: "#007bff" }}>Configure Portfolio</h2>
        <p style={{ marginBottom: "20px" }}>
          Allocate up to 100% of your portfolio. Maximum of 10 stocks allowed:
        </p>
        {stocks.map((stock, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <input
              type="text"
              placeholder="Stock Symbol (e.g., AAPL)"
              value={stock.symbol}
              onChange={(e) => handleStockChange(index, "symbol", e.target.value)}
              style={{
                marginRight: "10px",
                padding: "10px",
                width: "40%",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
            <input
              type="number"
              placeholder="Percentage (e.g., 10)"
              value={stock.percentage}
              onChange={(e) => handleStockChange(index, "percentage", e.target.value)}
              style={{
                marginRight: "10px",
                padding: "10px",
                width: "30%",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
            <button
              onClick={() => removeStock(index)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}
        {stocks.length < 10 && (
          <button
            onClick={addStock}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Add Stock
          </button>
        )}
      </div>

      <div>
        <h2 style={{ color: "#007bff" }}>Select Date Range</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              width: "50%",
            }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              width: "50%",
            }}
          />
        </div>
      </div>

      <button
        onClick={calculatePortfolio}
        disabled={loading || !startDate || !endDate}
        style={{
          marginTop: "20px",
          padding: "15px 25px",
          backgroundColor: loading ? "#6c757d" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          display: "block",
          width: "100%",
        }}
      >
        {loading ? "Calculating..." : "Show Portfolio"}
      </button>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {portfolioStartValue !== null && portfolioEndValue !== null && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#007bff" }}>
            Portfolio Value on <span style={{ fontWeight: "bold" }}>{startDate}</span>: $
            {portfolioStartValue.toFixed(2)}
          </h2>
          <h2 style={{ color: "#007bff" }}>
            Portfolio Value on <span style={{ fontWeight: "bold" }}>{endDate}</span>: $
            {portfolioEndValue.toFixed(2)}
          </h2>
          <h3 style={{ color: "#333", marginTop: "20px" }}>Performance Summary:</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", color: "#555" }}>
            {summary}
          </p>
          <button
            onClick={resetSimulation}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Reset Simulation
          </button>
        </div>
      )}
    </div>
  );
}
