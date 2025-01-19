import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const date = searchParams.get("date");
  const range = searchParams.get("range") || "30"; // Default to 30 days

  if (!symbol || !date) {
    return NextResponse.json(
      { error: "Symbol and date are required" },
      { status: 400 }
    );
  }

  try {
    const selectedDate = new Date(date);
    const rangeStartDate = new Date(selectedDate);
    rangeStartDate.setDate(rangeStartDate.getDate() - parseInt(range)); // Calculate range start

    console.log(
      `Fetching data for ${symbol} from ${rangeStartDate.toISOString()} to ${selectedDate.toISOString()}`
    );

    // Fetch historical data
    const result = await yahooFinance.historical(symbol, {
      period1: rangeStartDate.toISOString(),
      period2: selectedDate.toISOString(),
      interval: "1d",
    });

    console.log("Yahoo Finance Historical Result:", result);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: `No data found for ${symbol}` },
        { status: 404 }
      );
    }

    // Fetch metadata for the stock
    const quoteSummary = await yahooFinance.quoteSummary(symbol, {
      modules: ["summaryDetail", "price"],
    });

    console.log("Yahoo Finance Metadata Result:", quoteSummary);

    const metadata = {
      marketCap: quoteSummary?.price?.marketCap || "N/A",
      beta: quoteSummary?.summaryDetail?.beta || "N/A",
      peRatio: quoteSummary?.summaryDetail?.trailingPE || "N/A",
      dividendYield: quoteSummary?.summaryDetail?.dividendYield || "N/A",
      previousClose: quoteSummary?.summaryDetail?.previousClose || "N/A",
      week52High: quoteSummary?.summaryDetail?.fiftyTwoWeekHigh || "N/A",
      week52Low: quoteSummary?.summaryDetail?.fiftyTwoWeekLow || "N/A",
      volume: quoteSummary?.summaryDetail?.volume || "N/A",
    };

    console.log("Extracted Metadata:", metadata);

    // Extract daily data for the selected date
    const dailyData = result.find(
      (entry) => new Date(entry.date).toISOString().split("T")[0] === date
    );

    const response = {
      daily: dailyData || null, // Selected day's data
      historical: result, // Full range data
      metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Yahoo Finance API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
