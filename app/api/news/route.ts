import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const date = searchParams.get("date");

  if (!symbol || !date) {
    return NextResponse.json(
      { error: "Symbol and date are required" },
      { status: 400 }
    );
  }

  try {
    const historical = await yahooFinance.historical(symbol, {
      period1: new Date(date).toISOString(),
      period2: new Date().toISOString(),
      interval: "1d",
    });

    return NextResponse.json(historical);
  } catch (error) {
    console.error("Yahoo Finance API Error:", error); // Log the entire error object

    return NextResponse.json(
      { error: "Failed to fetch stock data. Please try again." },
      { status: 500 }
    );
  }
}

