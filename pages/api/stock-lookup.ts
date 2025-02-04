import { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "yahoo-finance2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing or invalid search query" });
  }

  try {
    // Fetch stock search results from Yahoo Finance
    const searchResults = await yahooFinance.search(query);

    if (!searchResults.quotes || searchResults.quotes.length === 0) {
      return res.status(404).json({ error: "No stock found" });
    }

    // Format the response
    const results = searchResults.quotes.map((stock) => ({
      symbol: stock.symbol,
      name: stock.shortname || stock.longname || "Unknown Name",
    }));

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return res.status(500).json({ error: "Failed to fetch stock data" });
  }
}
