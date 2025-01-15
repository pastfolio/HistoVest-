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
    const period1 = new Date(date);
    const period2 = new Date(period1);
    period2.setDate(period1.getDate() + 1); // Ensure period2 is one day after period1

    console.log(`Fetching data for ${symbol} from ${period1.toISOString()} to ${period2.toISOString()}`);

    // Fetch historical data from Yahoo Finance
    const result = await yahooFinance.historical(symbol, {
      period1: period1.toISOString(),
      period2: period2.toISOString(),
      interval: "1d",
    });

    console.log("Yahoo Finance Historical Result:", result);

    if (!result || result.length === 0) {
      console.error(`No data found for ${symbol} on ${date}`);
      return NextResponse.json(
        { error: `No data found for ${symbol} on ${date}` },
        { status: 404 }
      );
    }

    // Extract the first quote
    const quote = result[0];

    const data = {
      date: quote.date,
      open: quote.open,
      close: quote.close,
      high: quote.high,
      low: quote.low,
      volume: quote.volume,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Yahoo Finance API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
