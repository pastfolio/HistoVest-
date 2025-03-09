import { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import yahooFinance from "yahoo-finance2";
import fs from "fs";
import path from "path";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FRED_API_KEY = process.env.FRED_API_KEY;

if (!ANTHROPIC_API_KEY) console.error("❌ ERROR: Missing Anthropic API key.");
if (!FRED_API_KEY) console.error("❌ ERROR: Missing FRED API key.");

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
  defaultHeaders: { "anthropic-version": "2023-06-01" },
});

const sectorsFilePath = path.join(process.cwd(), "data", "sectors.json");
const tickersFilePath = path.join(process.cwd(), "data", "tickers.json");

let sectorPrompts: { [key: string]: string } = {};
let sectorTickers: { [key: string]: string[] } = {};

try {
  sectorPrompts = JSON.parse(fs.readFileSync(sectorsFilePath, "utf8"));
  sectorTickers = JSON.parse(fs.readFileSync(tickersFilePath, "utf8"));
  console.log("✅ Loaded sector prompts and tickers.");
} catch (error) {
  console.error("❌ ERROR: Failed to load JSON files:", error);
}

async function getStockData(sector: string): Promise<{ [ticker: string]: any }> {
  const tickers = sectorTickers[sector.toLowerCase()] || [];
  if (!tickers.length) return {};

  const stockData: { [ticker: string]: any } = {};
  for (const ticker of tickers) {
    try {
      const quote = await yahooFinance.quote(ticker);
      stockData[ticker] = {
        price: quote.regularMarketPrice || "N/A",
        marketCap: quote.marketCap ? `${(quote.marketCap / 1e9).toFixed(2)}B` : "N/A",
        peRatio: quote.trailingPE || "N/A",
        dividendYield: quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) : "N/A",
      };
    } catch (error) {
      console.error(`❌ ERROR fetching data for ${ticker}:`, error);
      stockData[ticker] = { price: "N/A", marketCap: "N/A", peRatio: "N/A", dividendYield: "N/A" };
    }
  }
  return stockData;
}

async function getMacroData(): Promise<{ [key: string]: number | string }> {
  const seriesIds = {
    "GDP Growth": "A191RL1Q225SBEA",
    "Inflation Rate": "CPIAUCSL",
    "Interest Rates": "FEDFUNDS",
  };

  const macroData: { [key: string]: number | string } = {};
  for (const [key, seriesId] of Object.entries(seriesIds)) {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
      const response = await fetch(url);
      const data = await response.json();
      macroData[key] = data.observations?.[0]?.value || "N/A";
    } catch (error) {
      console.error(`❌ ERROR fetching macro data (${key}):`, error);
      macroData[key] = "N/A";
    }
  }
  return macroData;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET requests are allowed." });
  }

  const sector = req.query.sector as string;
  if (!sector) {
    return res.status(400).json({ error: "Missing sector parameter." });
  }

  if (!sectorPrompts[sector.toLowerCase()]) {
    return res.status(404).json({ error: "Sector not found." });
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send initial connection signal
    res.write(`data: ${JSON.stringify({ status: "connected" })}\n\n`);
    if (res.flush) res.flush();

    // Fetch stock and macro data asynchronously
    let stockData: any = {};
    let macroData: any = {};
    const stockDataPromise = getStockData(sector).then((data) => {
      stockData = data;
      const stockOverview = Object.entries(stockData)
        .map(([ticker, info]) => `${ticker} is currently priced at $${info.price || "N/A"}, with a market capitalization of ${info.marketCap || "N/A"}, a P/E ratio of ${info.peRatio || "N/A"}, and a dividend yield of ${info.dividendYield || "N/A"}%`)
        .join(". ");
      res.write(`data: ${JSON.stringify({ stockData, stockOverview })}\n\n`);
      if (res.flush) res.flush();
    }).catch((error) => {
      console.error("❌ Stock Data Error:", error);
      res.write(`data: ${JSON.stringify({ stockData: {} })}\n\n`);
      if (res.flush) res.flush();
    });

    const macroDataPromise = getMacroData().then((data) => {
      macroData = data;
      res.write(`data: ${JSON.stringify({ macroData })}\n\n`);
      if (res.flush) res.flush();
    }).catch((error) => {
      console.error("❌ Macro Data Error:", error);
      res.write(`data: ${JSON.stringify({ macroData: {} })}\n\n`);
      if (res.flush) res.flush();
    });

    // Start AI stream immediately with placeholders
    const prompt = sectorPrompts[sector.toLowerCase()]
      .replace("{GDP_Growth}", "N/A")
      .replace("{Inflation_Rate}", "N/A")
      .replace("{Interest_Rates}", "N/A")
      .replace("{stockOverview}", "{}");

    console.log(`[${new Date().toISOString()}] Starting AI stream`);
    const stream = await anthropic.messages.stream({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    stream.on("text", (text) => {
      console.log(`[${new Date().toISOString()}] AI chunk: ${text.substring(0, 50)}...`);
      res.write(`data: ${JSON.stringify({ aiAnalysis: text })}\n\n`);
      if (res.flush) res.flush();
    });

    stream.on("end", async () => {
      console.log(`[${new Date().toISOString()}] AI stream ended`);
      await Promise.all([stockDataPromise, macroDataPromise]);
      res.write("data: [DONE]\n\n");
      if (res.flush) res.flush();
      res.end();
    });

    stream.on("error", (error) => {
      console.error("❌ Stream Error:", error);
      res.write(`data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`);
      if (res.flush) res.flush();
      res.end();
    });
  } catch (error) {
    console.error("❌ ERROR:", error);
    res.status(500).end("Internal server error.");
  }
}