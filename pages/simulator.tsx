"use client";

import { useState } from "react";

export default function Simulator() {
  const [stocks, setStocks] = useState([{ symbol: "", percentage: "" }]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [portfolioStartValue, setPortfolioStartValue] = useState(null);
  const [portfolioEndValue, setPortfolioEndValue] = useState(null);
  const [summary, setSummary] = useState("");

  // Add stock input
  const addStock = () => {
    if (stocks.length < 10) {
      setStocks([...stocks, { symbol: "", percentage: "" }]);
    }
  };

  // Handle change for stock inputs
  const handleStockChange = (index, field, value) => {
    const updatedStocks = [...stocks];
    updatedStocks[index][field] = value;
    setStocks(updatedStocks);
  };

  // Fetch portfolio data and summary
  const calculatePortfolio = async () => {
    try {
      const response = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, startDate, endDate }),
      });

      if (!response.ok) throw new Error("Failed to calculate portfolio");

      const result = await response.json();
      setPortfolioStartValue(result.startValue);
      setPortfolioEndValue(result.endValue);
      setSummary(result.summary);
    } catch (error) {
      console.error("Error calculating portfolio:", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Stock Portfolio Simulator</h1>
      <div>
        <h2>Configure Portfolio</h2>
        <p>Allocate up to 100% of your portfolio (minimum 10 stocks):</p>
        {stocks.map((stock, index) => (
          <div key={index} style={{ display: "flex", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Stock Symbol (e.g., AAPL)"
              value={stock.symbol}
              onChange={(e) => handleStockChange(index, "symbol", e.target.value)}
              style={{ marginRight: "10px", padding: "8px", width: "150px" }}
            />
            <input
              type="number"
              placeholder="Percentage (e.g., 10)"
              value={stock.percentage}
              onChange={(e) => handleStockChange(index, "percentage", e.target.value)}
              style={{ padding: "8px", width: "100px" }}
            />
          </div>
        ))}
        <button onClick={addStock} disabled={stocks.length >= 10}>
          Add Stock
        </button>
      </div>
      <div>
        <h2>Select Date Range</h2>
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ marginRight: "10px", padding: "8px" }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: "8px" }}
          />
        </div>
      </div>
      <button
        onClick={calculatePortfolio}
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
        Show Portfolio
      </button>
      {portfolioStartValue !== null && portfolioEndValue !== null && (
        <div style={{ marginTop: "20px" }}>
          <h2>
            Portfolio Value on {startDate}: ${portfolioStartValue.toFixed(2)}
          </h2>
          <h2>
            Portfolio Value on {endDate}: ${portfolioEndValue.toFixed(2)}
          </h2>
          <h3>Performance Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
