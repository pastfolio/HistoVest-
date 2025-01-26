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
      legend: { display: false },
      title: { display: true, text: "Stock Price Chart", font: { size: 18 } },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: range > 60 ? "month" : range > 10 ? "week" : "day" },
        title: { display: true, text: "Date", font: { size: 14 } },
      },
      y: {
        title: { display: true, text: "Price (USD)", font: { size: 14 } },
      },
    },
    interaction: { mode: "index", intersect: false },
  };

  return <Line data={chartData} options={options} />;
}
