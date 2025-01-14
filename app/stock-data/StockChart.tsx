"use client"; // Ensures this runs in the client

import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

interface StockChartProps {
  data: { date: string; close: number }[];
}

export default function StockChart({ data }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 500,
      height: 300,
      layout: { background: { color: "#ffffff" }, textColor: "#000" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
    });

    const lineSeries = chart.addLineSeries();

    // ✅ Ensure we map the full dataset
    lineSeries.setData(
      data.map((d) => ({
        time: d.date.split("T")[0], // Convert ISO date to YYYY-MM-DD
        value: d.close,
      }))
    );

    return () => {
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-80" />;
}
