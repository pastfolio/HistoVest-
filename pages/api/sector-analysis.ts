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

// Define a type for stock data to improve type safety
interface StockData {
  price: number | string;
  marketCap: string;
  peRatio: number | string;
  dividendYield: string;
  change: number;
  yearChange: string;
  revenuePerShare: number | string;
  ttmRevenue: string;
  ttmNetIncome: string;
  ttmEPS: string;
  revenueYoY: string;
  netIncomeYoY: string;
  epsYoY: string;
}

async function getStockData(sector: string): Promise<{ [ticker: string]: StockData }> {
  const tickers = sectorTickers[sector.toLowerCase()] || [];
  console.log(`[${new Date().toISOString()}] Fetching stock data for ${sector} with tickers: ${tickers.join(", ")}`);

  if (!tickers.length) {
    console.log(`[${new Date().toISOString()}] No tickers found for ${sector}`);
    return {};
  }

  const stockData: { [ticker: string]: StockData } = {};

  for (const ticker of tickers) {
    try {
      console.log(`[${new Date().toISOString()}] Fetching quote for ${ticker}`);
      const quote = await yahooFinance.quote(ticker);
      console.log(`[${new Date().toISOString()}] Raw quote for ${ticker}:`, quote);

      // Fetch financial summary for revenue, net income, and EPS
      const summary = await yahooFinance.quoteSummary(ticker, { modules: ["defaultKeyStatistics", "financialData", "incomeStatementHistory", "incomeStatementHistoryQuarterly"] });
      console.log(`[${new Date().toISOString()}] Raw summary for ${ticker}:`, summary);

      // Use `chart()` for year change
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const today = new Date();

      const historical = await yahooFinance.chart(ticker, {
        period1: oneYearAgo.toISOString().split("T")[0],
        period2: today.toISOString().split("T")[0],
        interval: "1mo",
      });
      console.log(`[${new Date().toISOString()}] Raw historical for ${ticker}:`, historical); // Fixed syntax error here

      // Calculate year change with more robust checking
      let yearChange = "N/A";
      const result = historical.chart?.result?.[0];
      if (
        result?.indicators?.quote?.[0]?.close &&
        result.indicators.quote[0].close.length > 11
      ) {
        const initialClose = result.indicators.quote[0].close[0];
        yearChange = ((quote.regularMarketPrice - initialClose) / initialClose) * 100;
      }

      // Extract TTM revenue and net income, compare with previous year
      const ttmRevenue = summary.financialData?.totalRevenue?.raw || "N/A";
      const ttmNetIncome = summary.financialData?.netIncome?.raw || "N/A";
      const ttmEPS = summary.defaultKeyStatistics?.trailingEps?.raw || "N/A";

      // Get previous year's data (approximate from annual history)
      const prevYearRevenue = summary.incomeStatementHistory?.incomeStatementHistory?.[1]?.totalRevenue?.raw || "N/A";
      const prevYearNetIncome = summary.incomeStatementHistory?.incomeStatementHistory?.[1]?.netIncome?.raw || "N/A";
      const prevYearEPS = summary.defaultKeyStatistics?.trailingEps?.raw ? (summary.defaultKeyStatistics.trailingEps.raw / summary.incomeStatementHistory.incomeStatementHistory?.[1]?.eps?.raw || 1) : "N/A";

      const revenueYoY = prevYearRevenue !== "N/A" && ttmRevenue !== "N/A" ? ((ttmRevenue - prevYearRevenue) / prevYearRevenue * 100).toFixed(1) : "N/A";
      const netIncomeYoY = prevYearNetIncome !== "N/A" && ttmNetIncome !== "N/A" ? ((ttmNetIncome - prevYearNetIncome) / prevYearNetIncome * 100).toFixed(1) : "N/A";
      const epsYoY = prevYearEPS !== "N/A" && ttmEPS !== "N/A" ? ((ttmEPS - prevYearEPS) / prevYearEPS * 100).toFixed(1) : "N/A";

      stockData[ticker] = {
        price: quote.regularMarketPrice || "N/A",
        marketCap: quote.marketCap ? `${(quote.marketCap / 1e9).toFixed(2)}B` : "N/A",
        peRatio: quote.trailingPE || "N/A",
        dividendYield: quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) : "N/A",
        change: quote.regularMarketChangePercent || 0,
        yearChange: yearChange !== "N/A" ? yearChange.toFixed(1) : "N/A",
        revenuePerShare: quote.revenuePerShareTTM || "N/A",
        ttmRevenue: ttmRevenue !== "N/A" ? `$${ttmRevenue.toLocaleString()}` : "N/A",
        ttmNetIncome: ttmNetIncome !== "N/A" ? `$${ttmNetIncome.toLocaleString()}` : "N/A",
        ttmEPS: ttmEPS !== "N/A" ? ttmEPS.toFixed(2) : "N/A",
        revenueYoY: revenueYoY,
        netIncomeYoY: netIncomeYoY,
        epsYoY: epsYoY,
      };

      console.log(`[${new Date().toISOString()}] Fetched ${ticker}: $${stockData[ticker].price}, ${stockData[ticker].yearChange}% change, Revenue YoY: ${stockData[ticker].revenueYoY}%, Net Income YoY: ${stockData[ticker].netIncomeYoY}%`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ ERROR fetching data for ${ticker}:`, error);
      stockData[ticker] = {
        price: "N/A", marketCap: "N/A", peRatio: "N/A", dividendYield: "N/A", change: 0,
        yearChange: "N/A", revenuePerShare: "N/A", ttmRevenue: "N/A", ttmNetIncome: "N/A",
        ttmEPS: "N/A", revenueYoY: "N/A", netIncomeYoY: "N/A", epsYoY: "N/A",
      };
    }
  }
  return stockData;
}

async function getMacroData(sector: string): Promise<{ [key: string]: any }> {
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
      console.error(`[${new Date().toISOString()}] ❌ ERROR fetching macro data (${key}):`, error);
      macroData[key] = "N/A";
    }
  }
  if (sector.toLowerCase().includes("energy") || sector.toLowerCase().includes("oil")) {
    try {
      const oilQuote = await yahooFinance.quote("CL=F");
      macroData["Oil Prices"] = oilQuote.regularMarketPrice || "N/A";
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ ERROR fetching oil price:`, error);
      macroData["Oil Prices"] = "N/A";
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

    res.write(`data: ${JSON.stringify({ status: "connected" })}\n\n`);
    if (res.flush) res.flush();

    let stockData: { [ticker: string]: StockData } = {};
    let macroData: { [key: string]: any } = {};
    let summary = "";

    const stockDataPromise = getStockData(sector).then((data) => {
      stockData = data;
      const avgYearChange = Object.keys(stockData).length 
        ? Object.values(stockData).reduce((sum, { yearChange }) => sum + (parseFloat(yearChange) || 0), 0) / Object.keys(stockData).length
        : 0;

      // Detailed financial analysis at the top
      const financialAnalysis = Object.keys(stockData).length 
        ? `Financial Analysis:\n- Average Year Change: ${avgYearChange.toFixed(1)}%\n- Key Metrics Across ${sector}:\n` +
          Object.entries(stockData).map(([ticker, info]) => 
            `${ticker}: Revenue $${info.ttmRevenue}, Net Income $${info.ttmNetIncome}, EPS $${info.ttmEPS}, Revenue YoY ${info.revenueYoY}%, Net Income YoY ${info.netIncomeYoY}%, EPS YoY ${info.epsYoY}%`
          ).join("\n  ")
        : "Financial Analysis: No data available for detailed analysis.";

      const stockOverview = Object.entries(stockData)
        .map(([ticker, info]) => `${ticker}: $${info.price || "N/A"}, ${info.marketCap || "N/A"} market cap`)
        .join("; ");

      const sentiment = avgYearChange >= 0 ? "bullish" : "bearish";
      const movement = avgYearChange >= 0 ? "run-up" : "sell-off";
      const magnitude = Math.abs(avgYearChange).toFixed(1);
      const topMover = Object.keys(stockData).length 
        ? Object.entries(stockData).reduce((a, b) => Math.abs(parseFloat(a[1].yearChange) || 0) > Math.abs(parseFloat(b[1].yearChange) || 0) ? a : b)[0]
        : "N/A";
      const revenueTrend = Object.keys(stockData).length && Object.values(stockData).some(d => d.revenuePerShare !== "N/A")
        ? Object.values(stockData).map(d => d.revenuePerShare).reduce((a, b) => a + (parseFloat(b) || 0), 0) / Object.keys(stockData).length > 0 
          ? "showing revenue growth" : "facing revenue stagnation"
        : "with revenue data unavailable";
      const causes = avgYearChange >= 0 
        ? "driven by strong consumer spending and e-commerce growth" 
        : "triggered by declining foot traffic and supply chain disruptions";

      summary = `${financialAnalysis}\n\nPast-Year Summary:\nOver the past year, ${sector} has experienced a ${movement} of ${magnitude}%, reflecting ${sentiment} market sentiment. Key players like ${topMover} led the shift, ${causes}. The sector is ${revenueTrend}, shaping its outlook for 2025.\n`;
      
      console.log(`[${new Date().toISOString()}] Sending stockData and summary: ${summary}`);
      res.write(`data: ${JSON.stringify({ summary, stockData, stockOverview })}\n\n`);
      if (res.flush) res.flush();
    }).catch((error) => {
      console.error(`[${new Date().toISOString()}] ❌ Stock Data Promise Error:`, error);
      summary = `Past-Year Summary:\nOver the past year, ${sector} performance is unclear due to data retrieval issues, with sentiment and trends unavailable.\n`;
      res.write(`data: ${JSON.stringify({ summary, stockData: {} })}\n\n`);
      if (res.flush) res.flush();
    });

    const macroDataPromise = getMacroData(sector).then((data) => {
      macroData = data;
      const macroOverview = `GDP: ${macroData["GDP Growth"] || "N/A"}%, Inflation: ${macroData["Inflation Rate"] || "N/A"}%, Interest Rates: ${macroData["Interest Rates"] || "N/A"}%` + 
        (macroData["Oil Prices"] ? `, Oil Prices: $${macroData["Oil Prices"]}` : "");
      console.log(`[${new Date().toISOString()}] Sending macroData`);
      res.write(`data: ${JSON.stringify({ macroData, macroOverview })}\n\n`);
      if (res.flush) res.flush();
    }).catch((error) => {
      console.error(`[${new Date().toISOString()}] ❌ Macro Data Error:`, error);
      res.write(`data: ${JSON.stringify({ macroData: {} })}\n\n`);
      if (res.flush) res.flush();
    });

    await Promise.all([stockDataPromise, macroDataPromise]);
    const basePrompt = sectorPrompts[sector.toLowerCase()];
    const fullPrompt = `${summary}\n${basePrompt}`
      .replace("{GDP_Growth}", macroData["GDP Growth"] || "N/A")
      .replace("{Inflation_Rate}", macroData["Inflation Rate"] || "N/A")
      .replace("{Interest_Rates}", macroData["Interest Rates"] || "N/A")
      .replace("{Oil_Prices}", macroData["Oil Prices"] || "N/A")
      .replace("{stockOverview}", stockData && Object.keys(stockData).length 
        ? Object.entries(stockData).map(([ticker, info]) => `${ticker}: $${info.price || "N/A"}`).join(", ") 
        : "N/A");

    console.log(`[${new Date().toISOString()}] Starting AI stream with prompt starting: ${fullPrompt.substring(0, 100)}...`);
    const stream = await anthropic.messages.stream({
      model: "claude-3-opus-20240229",
      max_tokens: 2048,
      temperature: 0.7,
      messages: [{ role: "user", content: fullPrompt }],
    });

    stream.on("text", (text) => {
      console.log(`[${new Date().toISOString()}] AI chunk: ${text.substring(0, 50)}...`);
      res.write(`data: ${JSON.stringify({ aiAnalysis: text })}\n\n`);
      if (res.flush) res.flush();
    });

    stream.on("end", () => {
      console.log(`[${new Date().toISOString()}] AI stream ended`);
      res.write("data: [DONE]\n\n");
      if (res.flush) res.flush();
      res.end();
    });

    stream.on("error", (error) => {
      console.error(`[${new Date().toISOString()}] ❌ Stream Error:`, error);
      res.write(`data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`);
      if (res.flush) res.flush();
      res.end();
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Handler Error:`, error);
    res.status(500).end("Internal server error.");
  }
}

export const config = {
  runtime: "nodejs",
};