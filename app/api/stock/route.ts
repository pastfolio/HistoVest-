import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const today = new Date();
    today.setDate(today.getDate() - 1); // Get yesterday's date
    const period1 = today.toISOString().split("T")[0];

    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1); // Make sure period2 is one day after period1
    const period2 = nextDay.toISOString().split("T")[0];

    console.log(`Fetching data for ${symbol} from ${period1} to ${period2}`);

    const result = await yahooFinance.historical(symbol, {
      period1,
      period2,
      interval: "1d",
    });

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    return NextResponse.json(result[0]); // Return the first entry
  } catch (error) {
    console.error("Yahoo Finance API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
