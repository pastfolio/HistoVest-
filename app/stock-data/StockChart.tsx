"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically load ApexCharts
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StockChart({ data, selectedDate }: { data: any[]; selectedDate: string }) {
  if (!data || data.length === 0 || !data[0]?.close) {
    console.error("Invalid or empty data provided for the chart:", data);
    return <p>No valid stock data available for the chart.</p>;
  }

  // Chart Options
  const options = {
    chart: {
      type: "line",
      zoom: { enabled: true },
    },
    xaxis: {
      categories: [selectedDate],
      title: { text: "Date" },
    },
    yaxis: {
      title: { text: "Price" },
    },
    title: {
      text: `Stock Price on ${selectedDate}`,
      align: "center",
    },
  };

  // Chart Series
  const series = [
    {
      name: "Closing Price",
      data: [data[0]?.close],
    },
  ];

  return <ReactApexChart options={options} series={series} type="line" height={350} />;
}
