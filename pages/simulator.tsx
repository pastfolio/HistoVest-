"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Dynamically import PieChart
const PieChart = dynamic(() => import("react-chartjs-2").then((mod) => mod.Pie), { ssr: false });

export default function Simulator() {
  const [stocks, setStocks] = useState([{ symbol: "", percentage: "" }]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [portfolioStartValue, setPortfolioStartValue] = useState(null);
  const [portfolioEndValue, setPortfolioEndValue] = useState(null);
  const [summary, setSummary] = useState("");
  const [beforeAllocation, setBeforeAllocation] = useState([]);
  const [afterAllocation, setAfterAllocation] = useState([]);

  const addStock = () => {
    if (stocks.length < 10) {
      setStocks([...stocks, { symbol: "", percentage: "" }]);
    }
  };

  const handleStockChange = (index, field, value) => {
    const updatedStocks = [...stocks];
    updatedStocks[index][field] = value;
    setStocks(updatedStocks);
  };

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

      const before = stocks.map((stock) => ({
        symbol: stock.symbol,
        percentage: parseFloat(stock.percentage),
      }));
      const after = stocks.map((stock) => ({
        symbol: stock.symbol,
        percentage:
          ((result.shares[stock.symbol] * result.endValue) / result.endValue) * 100,
      }));

      setBeforeAllocation(before);
      setAfterAllocation(after);
    } catch (error) {
      console.error("Error calculating portfolio:", error);
    }
  };

  const pieData = (data) => ({
    labels: data.map((item) => item.symbol),
    datasets: [
      {
        data: data.map((item) => item.percentage),
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#dc3545",
          "#ffc107",
          "#17a2b8",
          "#6c757d",
          "#e83e8c",
          "#20c997",
          "#fd7e14",
          "#6610f2",
        ],
      },
    ],
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Stock Portfolio Simulator</h1>
      <div>
        <h2>Configure Portfolio</h2>
        <p>Allocate your portfolio as desired (total percentage does not have to be 100%):</p>
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
            Portfolio Value on {startDate}: $
            {portfolioStartValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </h2>
          <h2>
            Portfolio Value on {endDate}: $
            {portfolioEndValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </h2>
          <h3>Performance Summary:</h3>
          <p>{summary}</p>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
            <div>
              <h3>Before Allocation</h3>
              <PieChart data={pieData(beforeAllocation)} />
            </div>
            <div>
              <h3>After Allocation</h3>
              <PieChart data={pieData(afterAllocation)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
