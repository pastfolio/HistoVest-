"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically load ApexCharts
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StockChart({
  data,
  selectedDate,
  range,
}: {
  data: any[];
  selectedDate: string;
  range: number;
}) {
  if (!data || data.length === 0) {
    console.error("Invalid or empty data provided for the chart:", data);
    return <p>No valid stock data available for the chart.</p>;
  }

  // Prepare data for the chart
  const categories = data.map((entry) => new Date(entry.date).toLocaleDateString());
  const seriesData = data.map((entry) => entry.close);

  // Highlight the selected date
  const selectedIndex = categories.findIndex((date) => date === new Date(selectedDate).toLocaleDateString());

  const options = {
    chart: {
      type: "line",
      zoom: { enabled: true },
    },
    xaxis: {
      categories,
      title: { text: "Date" },
    },
    yaxis: {
      title: { text: "Price" },
      labels: {
        formatter: (value) => value.toFixed(2), // Format numbers to 2 decimal places
      },
    },
    title: {
      text: `Closing Prices: Past ${range} Days (Up to ${new Date(selectedDate).toLocaleDateString()})`,
      align: "center",
    },
    markers: {
      size: data.map((_, index) => (index === selectedIndex ? 6 : 0)), // Highlight selected date
      colors: ["#FF4560"],
    },
    annotations: {
      xaxis: [
        {
          x: new Date(selectedDate).toLocaleDateString(),
          borderColor: "#FF4560",
          label: {
            text: "Selected Date",
            style: {
              color: "#fff",
              background: "#FF4560",
            },
          },
        },
      ],
    },
  };

  const series = [
    {
      name: "Closing Price",
      data: seriesData,
    },
  ];

  return <ReactApexChart options={options} series={series} type="line" height={350} />;
}
