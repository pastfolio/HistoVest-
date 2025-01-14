import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const date = searchParams.get("date");

  if (!symbol || !date) {
    return NextResponse.json({ error: "Symbol and date are required" }, { status: 400 });
  }

  let period1 = new Date(date);
  let period2 = new Date(period1);
  period2.setDate(period2.getDate() + 1); // Ensure range is valid

  try {
    let result = await yahooFinance.historical(symbol, {
      period1: period1.toISOString().split("T")[0],
      period2: period2.toISOString().split("T")[0],
      interval: "1d",
    });

    // If no data is found, search for the closest previous date
    let attempts = 0;
    while (result.length === 0 && attempts < 7) {
      period1.setDate(period1.getDate() - 1);
      period2.setDate(period2.getDate() - 1);
      attempts++;

      result = await yahooFinance.historical(symbol, {
        period1: period1.toISOString().split("T")[0],
        period2: period2.toISOString().split("T")[0],
        interval: "1d",
      });
    }

    if (!result.length) {
      return NextResponse.json({ error: "No data found within the last 7 days" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Yahoo Finance API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
