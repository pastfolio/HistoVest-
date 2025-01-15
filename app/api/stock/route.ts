import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    await new Promise((res) => setTimeout(res, 2000)); // Delay 2 sec before fetching

    let attempts = 0;
    const maxAttempts = 3;
    let result = [];

    while (attempts < maxAttempts) {
      try {
        result = await yahooFinance.historical(symbol, {
          period1: "2000-01-01", // Fetch from the year 2000 instead of 2023
          period2: new Date().toISOString().split("T")[0],
          interval: "1d",
        });

        if (result.length > 0) break; // Stop retrying if data is fetched
      } catch (err) {
        console.warn(`Attempt ${attempts + 1} failed, retrying...`);
        attempts++;
        await new Promise((res) => setTimeout(res, 2000)); // Wait 2 sec before retrying
      }
    }

    console.log("API Raw Response:", result); // Debugging

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Yahoo Finance API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
