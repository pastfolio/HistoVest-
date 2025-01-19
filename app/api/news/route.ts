import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const date = searchParams.get("date");
  const range = searchParams.get("range") || "30";

  if (!symbol || !date) {
    return NextResponse.json(
      { error: "Symbol and date are required" },
      { status: 400 }
    );
  }

  try {
    // Fetch historical data for the range of days
    const endDate = new Date(date);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - parseInt(range, 10));

    const historical = await yahooFinance.historical(symbol, {
      period1: startDate.toISOString(),
      period2: endDate.toISOString(),
      interval: "1d",
    });

    // Fetch stock summary details
    const quoteSummary = await yahooFinance.quoteSummary(symbol, {
      modules: ["summaryDetail", "price"],
    });

    const summary = quoteSummary.summaryDetail || {};
    const priceData = quoteSummary.price || {};

    return NextResponse.json({
      daily: historical[historical.length - 1], // Latest available day in range
      historical,
      summary: {
        marketCap: summary.marketCap,
        peRatio: summary.trailingPE,
        beta: summary.beta,
        dividendYield: summary.dividendYield,
        volume: summary.volume,
        previousClose: summary.previousClose,
        fiftyTwoWeekHigh: summary.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: summary.fiftyTwoWeekLow,
      },
    });
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch stock data. Please try again." },
      { status: 500 }
    );
  }
}
