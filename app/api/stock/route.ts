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
  period2.setDate(period2.getDate() + 1);

  try {
    let result;
    let attempts = 0;
    const maxAttempts = 3; // Retry up to 3 times

    while (attempts < maxAttempts) {
      try {
        result = await yahooFinance.historical(symbol, {
          period1: period1.toISOString().split("T")[0],
          period2: period2.toISOString().split("T")[0],
          interval: "1d",
          fetchOptions: { timeout: 10000 }, // Set 10s timeout
        });

        if (result.length > 0) break; // Stop retrying if data is fetched
      } catch (err) {
        console.warn(`Attempt ${attempts + 1} failed, retrying...`);
        attempts++;
        await new Promise((res) => setTimeout(res, 2000)); // Wait 2 sec before retrying
      }
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Yahoo Finance API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
