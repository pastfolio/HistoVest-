"use client";
import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function StockChart({ data, selectedDate }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!data || !selectedDate) return;

    // Ensure `data` is an array
    const stockData = Array.isArray(data) ? data : [data];

    // Convert selectedDate to YYYY-MM-DD format
    const selectedDateFormatted = new Date(selectedDate).toISOString().split("T")[0];

    // Filter data to remove future dates
    const filteredData = stockData
      .filter((d) => d.date?.split("T")[0] <= selectedDateFormatted)
      .map((d) => ({
        time: new Date(d.date).getTime() / 1000, // Convert to UNIX timestamp
        value: parseFloat(d.close), // Ensure numeric values
      }));

    if (filteredData.length === 0) {
      console.warn("⚠️ No valid stock data found for the selected date.");
      return;
    }

    // Ensure container exists before creating the chart
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 600,
      height: 400,
      layout: { backgroundColor: "#ffffff", textColor: "#000" },
      grid: { vertLines: { color: "#e1e1e1" }, horzLines: { color: "#e1e1e1" } },
    });

    const lineSeries = chart.addLineSeries();
    lineSeries.setData(filteredData);

    chart.timeScale().fitContent(); // Ensure the chart scales correctly

    return () => chart.remove(); // Cleanup chart on unmount
  }, [data, selectedDate]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />;
}
