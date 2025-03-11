import { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import yahooFinance from "yahoo-finance2";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FRED_API_KEY = process.env.FRED_API_KEY;

if (!ANTHROPIC_API_KEY) console.error("❌ ERROR: Missing Anthropic API key.");
if (!FRED_API_KEY) console.error("❌ ERROR: Missing FRED API key.");

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
  defaultHeaders: { "anthropic-version": "2023-06-01" },
});

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

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
  const cacheKey = `stockData_${sector}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`[${new Date().toISOString()}] Using cached stock data for ${sector}`);
    return cachedData as { [ticker: string]: StockData };
  }

  const tickers = sectorTickers[sector.toLowerCase()] || [];
  console.log(`[${new Date().toISOString()}] Fetching stock data for ${sector} with tickers: ${tickers.join(", ")}`);

  if (!tickers.length) return {};

  const stockData: { [ticker: string]: StockData } = {};

  for (const ticker of tickers) {
    try {
      // Get current quote data
      const quote = await yahooFinance.quote(ticker);
      const summary = await yahooFinance.quoteSummary(ticker, { modules: ["defaultKeyStatistics", "financialData", "incomeStatementHistory"] });

      // Get historical data for 1-year change
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // One year ago from March 11, 2025
      const historical = await yahooFinance.chart(ticker, {
        period1: oneYearAgo.toISOString().split("T")[0],
        period2: new Date().toISOString().split("T")[0],
        interval: "1d", // Use daily data for accuracy
      });

      let yearChange = "N/A";
      const result = historical.chart?.result?.[0];
      if (result?.indicators?.quote?.[0]?.close && result.indicators.quote[0].close.length >= 252) {
        const closeOneYearAgo = result.indicators.quote[0].close[0]; // First day (approx. 1 year ago)
        const latestClose = result.indicators.quote[0].close[result.indicators.quote[0].close.length - 1]; // Most recent day
        if (closeOneYearAgo && latestClose && closeOneYearAgo !== 0) {
          yearChange = (((latestClose - closeOneYearAgo) / closeOneYearAgo) * 100).toFixed(1) + "%";
          console.log(`[${new Date().toISOString()}] Year Change for ${ticker}: ${yearChange} (One Year Ago: ${closeOneYearAgo}, Latest: ${latestClose})`);
        } else {
          console.log(`[${new Date().toISOString()}] Invalid close data for ${ticker} (One Year Ago: ${closeOneYearAgo}, Latest: ${latestClose})`);
        }
      } else {
        console.log(`[${new Date().toISOString()}] Insufficient historical data points for ${ticker}, length: ${result?.indicators?.quote?.[0]?.close?.length}`);
      }

      const ttmRevenue = summary.financialData?.totalRevenue?.raw || "N/A";
      const ttmNetIncome = summary.financialData?.netIncome?.raw || "N/A";
      const ttmEPS = summary.defaultKeyStatistics?.trailingEps?.raw || "N/A";

      const prevYearRevenue = summary.incomeStatementHistory?.incomeStatementHistory?.[1]?.totalRevenue?.raw || "N/A";
      const prevYearNetIncome = summary.incomeStatementHistory?.incomeStatementHistory?.[1]?.netIncome?.raw || "N/A";
      const prevYearEPS = summary.defaultKeyStatistics?.trailingEps?.raw ? (summary.defaultKeyStatistics.trailingEps.raw / summary.incomeStatementHistory.incomeStatementHistory?.[1]?.eps?.raw || 1) : "N/A";

      const revenueYoY = prevYearRevenue !== "N/A" && ttmRevenue !== "N/A" ? ((ttmRevenue - prevYearRevenue) / prevYearRevenue * 100).toFixed(1) : "N/A";
      const netIncomeYoY = prevYearNetIncome !== "N/A" && ttmNetIncome !== "N/A" ? ((ttmNetIncome - prevYearNetIncome) / prevYearNetIncome * 100).toFixed(1) : "N/A";
      const epsYoY = prevYearEPS !== "N/A" && ttmEPS !== "N/A" ? ((ttmEPS - prevYearEPS) / prevYearEPS * 100).toFixed(1) : "N/A";

      // Use raw dividend yield as it’s already a percentage
      let dividendYield = "N/A";
      if (quote.dividendYield !== undefined && quote.dividendYield !== null) {
        dividendYield = quote.dividendYield.toFixed(2) + "%";
        console.log(`[${new Date().toISOString()}] Raw Dividend Yield for ${ticker}: ${quote.dividendYield}, Adjusted: ${dividendYield}`);
      }

      stockData[ticker] = {
        price: quote.regularMarketPrice || "N/A",
        marketCap: quote.marketCap ? `${(quote.marketCap / 1e9).toFixed(2)}B` : "N/A",
        peRatio: quote.trailingPE ? quote.trailingPE.toFixed(2) : "N/A",
        dividendYield,
        change: quote.regularMarketChangePercent || 0,
        yearChange,
        revenuePerShare: quote.revenuePerShareTTM || "N/A",
        ttmRevenue: ttmRevenue !== "N/A" ? `$${ttmRevenue.toLocaleString()}` : "N/A",
        ttmNetIncome: ttmNetIncome !== "N/A" ? `$${ttmNetIncome.toLocaleString()}` : "N/A",
        ttmEPS: ttmEPS !== "N/A" ? ttmEPS.toFixed(2) : "N/A",
        revenueYoY,
        netIncomeYoY,
        epsYoY,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ ERROR fetching data for ${ticker}:`, error);
      stockData[ticker] = { price: "N/A", marketCap: "N/A", peRatio: "N/A", dividendYield: "N/A", change: 0, yearChange: "N/A", revenuePerShare: "N/A", ttmRevenue: "N/A", ttmNetIncome: "N/A", ttmEPS: "N/A", revenueYoY: "N/A", netIncomeYoY: "N/A", epsYoY: "N/A" };
    }
  }

  cache.set(cacheKey, stockData);
  return stockData;
}

async function getMacroData(sector: string): Promise<{ [key: string]: any }> {
  const cacheKey = `macroData_${sector}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`[${new Date().toISOString()}] Using cached macro data for ${sector}`);
    return cachedData as { [key: string]: any };
  }

  const seriesIds = { 
    "GDP Growth": "A191RL1Q225SBEA",
    "Inflation Rate": "CPIAUCSL",
    "Interest Rates": "FEDFUNDS"
  };
  const macroData: { [key: string]: number | string } = {};

  for (const [key, seriesId] of Object.entries(seriesIds)) {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=12&sort_order=desc`;
      const response = await fetch(url);
      const data = await response.json();
      if (key === "Inflation Rate") {
        const latestCPI = parseFloat(data.observations[0].value);
        const yearAgoCPI = parseFloat(data.observations[11].value);
        macroData[key] = ((latestCPI - yearAgoCPI) / yearAgoCPI * 100).toFixed(2);
      } else {
        macroData[key] = parseFloat(data.observations[0].value).toFixed(2);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ ERROR fetching macro data (${key}):`, error);
      macroData[key] = "N/A";
    }
  }

  if (sector.toLowerCase().includes("energy") || sector.toLowerCase().includes("oil")) {
    try {
      const oilQuote = await yahooFinance.quote("CL=F");
      macroData["Oil Prices"] = oilQuote.regularMarketPrice ? oilQuote.regularMarketPrice.toFixed(2) : "N/A";
    } catch (error) {
      macroData["Oil Prices"] = "N/A";
    }
  }

  cache.set(cacheKey, macroData);
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

    const tickers = sectorTickers[sector.toLowerCase()] || [];

    const stockDataPromise = getStockData(sector).then((data) => {
      stockData = data;
      const avgYearChange = Object.keys(stockData).length 
        ? Object.values(stockData).reduce((sum, { yearChange }) => sum + (parseFloat(yearChange.replace("%", "")) || 0), 0) / Object.keys(stockData).length
        : 0;

      const financialAnalysis = Object.keys(stockData).length 
        ? `Financial Analysis:\n- Average Year Change: ${avgYearChange.toFixed(1)}%\n- Key Metrics Across ${sector}:\n` +
          Object.entries(stockData).map(([ticker, info]) => 
            `${ticker}: Revenue $${info.ttmRevenue}, Net Income $${info.ttmNetIncome}, EPS $${info.ttmEPS}, Revenue YoY ${info.revenueYoY}%, Net Income YoY ${info.netIncomeYoY}%, EPS YoY ${info.epsYoY}%`
          ).join("\n  ")
        : "Financial Analysis: No data available.";

      const stockOverview = Object.entries(stockData)
        .map(([ticker, info]) => `${ticker}: $${info.price || "N/A"}, ${info.marketCap || "N/A"} market cap`)
        .join("; ");

      const sentiment = avgYearChange >= 0 ? "bullish" : "bearish";
      const movement = avgYearChange >= 0 ? "run-up" : "sell-off";
      const magnitude = Math.abs(avgYearChange).toFixed(1);
      const topMover = Object.keys(stockData).length 
        ? Object.entries(stockData).reduce((a, b) => Math.abs(parseFloat(a[1].yearChange.replace("%", "")) || 0) > Math.abs(parseFloat(b[1].yearChange.replace("%", "")) || 0) ? a : b)[0]
        : "N/A";
      const revenueTrend = Object.keys(stockData).length && Object.values(stockData).some(d => d.revenuePerShare !== "N/A")
        ? Object.values(stockData).map(d => d.revenuePerShare).reduce((a, b) => a + (parseFloat(b) || 0), 0) / Object.keys(stockData).length > 0 
          ? "showing revenue growth" : "facing revenue stagnation"
        : "with revenue data unavailable";
      const causes = avgYearChange >= 0 
        ? "driven by strong consumer spending and e-commerce growth" 
        : "triggered by declining foot traffic and supply chain disruptions";

      summary = `${financialAnalysis}\n\nPast-Year Summary:\nOver the past year, ${sector} has experienced a ${movement} of ${magnitude}%, reflecting ${sentiment} market sentiment. Key players like ${topMover} led the shift, ${causes}. The sector is ${revenueTrend}, shaping its outlook for 2025.\n`;
      
      res.write(`data: ${JSON.stringify({ summary, stockData, stockOverview })}\n\n`);
      if (res.flush) res.flush();
    }).catch((error) => {
      console.error(`[${new Date().toISOString()}] ❌ Stock Data Error:`, error);
      summary = "Stock data unavailable due to error.";
      res.write(`data: ${JSON.stringify({ summary, stockData: {} })}\n\n`);
      if (res.flush) res.flush();
    });

    const macroDataPromise = getMacroData(sector).then((data) => {
      macroData = data;
      const macroOverview = `GDP: ${macroData["GDP Growth"] || "N/A"}%, Inflation: ${macroData["Inflation Rate"] || "N/A"}%, Interest Rates: ${macroData["Interest Rates"] || "N/A"}%` + 
        (macroData["Oil Prices"] ? `, Oil Prices: $${macroData["Oil Prices"]}` : "");
      res.write(`data: ${JSON.stringify({ macroData, macroOverview })}\n\n`);
      if (res.flush) res.flush();
    }).catch((error) => {
      console.error(`[${new Date().toISOString()}] ❌ Macro Data Error:`, error);
      macroData = {};
      res.write(`data: ${JSON.stringify({ macroData: {}, macroOverview: "Macro data unavailable" })}\n\n`);
      if (res.flush) res.flush();
    });

    await Promise.allSettled([stockDataPromise, macroDataPromise]);

    const basePrompt = sectorPrompts[sector.toLowerCase()] || "";

    const detailedReportPrompt = `
      Using the following data, generate a detailed 1,500-2,000 word report in paragraph form about the ${sector} sector. Write in a professional, narrative style with rich detail, weaving together financial performance and macroeconomic context. Structure the report with an introduction, sections on financial performance, macroeconomic influences, competitive landscape, future outlook, and a conclusion. Incorporate specific data points and examples where possible, and ensure the analysis is comprehensive and engaging:

      ${summary}
      Macro Data: GDP Growth: ${macroData["GDP Growth"] || "N/A"}%, Inflation Rate: ${macroData["Inflation Rate"] || "N/A"}%, Interest Rates: ${macroData["Interest Rates"] || "N/A"}%, Oil Prices: ${macroData["Oil Prices"] || "N/A"}
      Stock Overview: ${stockData && Object.keys(stockData).length 
        ? Object.entries(stockData).map(([ticker, info]) => `${ticker}: $${info.price || "N/A"}, Market Cap: ${info.marketCap || "N/A"}, P/E: ${info.peRatio || "N/A"}, Dividend Yield: ${info.dividendYield || "N/A"}, Year Change: ${info.yearChange || "N/A"}`).join("; ") 
        : "N/A"}
      ${basePrompt}
    `;

    console.log(`[${new Date().toISOString()}] Starting Anthropic stream for detailed report...`);
    const stream = await anthropic.messages.stream({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      temperature: 0.6,
      messages: [{ role: "user", content: detailedReportPrompt }],
    });

    stream.on("text", (text) => {
      res.write(`data: ${JSON.stringify({ aiAnalysis: text })}\n\n`);
      if (res.flush) res.flush();
    });

    stream.on("end", () => {
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