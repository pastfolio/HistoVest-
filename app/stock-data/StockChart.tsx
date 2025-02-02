import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

export default function StockChart({ data, selectedDate, range }: any) {
  if (!data || data.length === 0) {
    return <p style={{ textAlign: "center", color: "#D4AF37" }}>No data available for this range.</p>;
  }

  const chartData = {
    labels: data.map((point: any) => point.date),
    datasets: [
      {
        label: `Closing Prices: Past ${range} Days (Up to ${selectedDate})`,
        data: data.map((point: any) => point.close),
        borderColor: "#1E90FF", // Blue line
        backgroundColor: "rgba(30, 144, 255, 0.2)", // Light blue fill
        borderWidth: 2,
        tension: 0.4, // Smooth line
        fill: true,
        pointRadius: 0, // Hide points for a cleaner look
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows setting custom height
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Stock Price Chart", font: { size: 18, weight: "bold" }, color: "#D4AF37" },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: range > 60 ? "month" : range > 10 ? "week" : "day" },
        title: { display: true, text: "Date", font: { size: 14 }, color: "#D4AF37" },
        ticks: { color: "#D4AF37" },
        grid: { color: "#555" }, // Grey grid lines
      },
      y: {
        title: { display: true, text: "Price (USD)", font: { size: 14 }, color: "#D4AF37" },
        ticks: { color: "#D4AF37" },
        grid: { color: "#555" }, // Grey grid lines
      },
    },
    interaction: { mode: "index", intersect: false },
  };

  return (
    <div style={{ backgroundColor: "#1A1A1A", padding: "20px", borderRadius: "8px" }}>
      <div style={{ height: "400px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
