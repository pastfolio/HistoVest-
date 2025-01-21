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
  Filler, // For the shaded area
  TimeScale, // For better date handling
} from "chart.js";
import "chartjs-adapter-date-fns"; // Date adapter

// Register chart.js components
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
  const chartData = {
    labels: data.map((point: any) => point.date), // Ensure date strings or formatted values
    datasets: [
      {
        label: `Closing Prices: Past ${range} Days (Up to ${selectedDate})`,
        data: data.map((point: any) => point.close),
        borderColor: "rgba(75,192,192,1)", // Line color
        backgroundColor: "rgba(75,192,192,0.2)", // Fill color below the line
        borderWidth: 2,
        tension: 0.4, // Smoother line
        fill: true, // Enables the shaded area below the line
        pointRadius: 0, // No points displayed on the line
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // No legend for simplicity
      },
      title: {
        display: true,
        text: "Stock Price Chart",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        type: "time", // Use time scale for better date handling
        time: {
          unit: range > 60 ? "month" : range > 10 ? "week" : "day", // Adjust granularity
          tooltipFormat: "MMM dd, yyyy", // Tooltip date format
          displayFormats: {
            day: "MMM dd",
            week: "MMM dd",
            month: "MMM yyyy",
          },
        },
        title: {
          display: true,
          text: "Date",
          font: {
            size: 14,
          },
        },
        ticks: {
          maxRotation: 0, // Ensure labels don’t overlap
          autoSkip: true, // Skip labels if too many
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (USD)",
          font: {
            size: 14,
          },
        },
        ticks: {
          callback: function (value: number) {
            return `$${value.toFixed(2)}`; // Format y-axis labels
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.4, // Smooth line
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
