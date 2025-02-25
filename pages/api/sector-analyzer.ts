import { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import yahooFinance from "yahoo-finance2";
import fetch from "node-fetch";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FRED_API_KEY = process.env.FRED_API_KEY;

if (!ANTHROPIC_API_KEY) console.error("❌ ERROR: Missing Anthropic API key.");

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
  defaultHeaders: { "anthropic-version": "2023-06-01" },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🚀 API Request Received:", req.query);

  try {
    const sector = req.query.sector as string;
    if (!sector) return res.status(400).json({ error: "Sector is required" });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    console.log(`🔄 Fetching fresh data for ${sector}...`);
    const stockData = await getStockData(sector);
    const macroData = await getMacroData();
    res.write(`data: ${JSON.stringify({ type: "stock-macro", data: { stockData, macroData } })}\n\n`);
    res.flush();

    console.log("🤖 Generating AI-powered sector analysis...");

    // Construct the system prompt using fetched data, adapted for paragraphs
    const stockOverview = Object.entries(stockData)
      .map(
        ([ticker, data]) =>
          `${ticker} is currently priced at $${data.price || "N/A"}, with a market capitalization of ${data.marketCap || "N/A"}, a P/E ratio of ${data.peRatio || "N/A"}, and a dividend yield of ${data.dividendYield || "N/A"}`
      )
      .join(". ");

    const systemPrompt = `
      Institutional-Grade Analysis of the ${sector} Sector (2025). 
      You are an advanced financial analyst tasked with producing a highly detailed, institutional-grade analysis of the ${sector} sector for 2025, spanning at least 1000 words and written entirely in flowing paragraphs. The report should seamlessly integrate the following information into a cohesive, prose-based narrative without using bullet points or lists unless explicitly requested. 
      Begin with a macroeconomic overview, where the current economic landscape shows GDP growth at ${macroData["GDP Growth"] || "N/A"}%, an inflation rate of ${macroData["Inflation Rate"] || "N/A"}%, interest rates at ${macroData["Interest Rates"] || "N/A"}%, and oil prices at $${macroData["Oil Prices"] || "N/A"} per barrel, exploring how these factors shape the ${sector} sector’s trajectory. 
      Transition into a stock market overview, detailing the performance of key companies such as ${stockOverview}, and analyze what these metrics indicate about the sector’s financial health and investor confidence in 2025. 
      Next, discuss investment trends and capital flows, noting that key investors in the ${sector} sector include major hedge funds, institutions, and venture capital firms, and elaborate on where capital is flowing in 2025 and which specific areas or companies within the sector are being targeted, providing a nuanced view of market priorities. 
      Then, delve into historical market cycles and investment patterns, comparing past bull and bear markets in the ${sector} sector, weaving in detailed examples of crashes, recoveries, and major shifts to contextualize the current environment and forecast potential future movements. 
      Follow this with an exploration of the competitive landscape and key players, offering a rich breakdown of top companies, their strategies, and emerging challengers, illustrating how these dynamics influence the sector’s evolution. 
      Conclude with future projections and industry risks, assessing what challenges the ${sector} sector might face between 2025 and 2030, and identifying major technological disruptions or policy changes that could impact growth, ensuring a forward-looking perspective grounded in current data. 
      Ensure this response is highly detailed, written in a professional, institutional tone suitable for a sophisticated financial audience, and maximizes the 4096-token limit to deliver an expansive, uninterrupted narrative.
    `;

    const stream = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      temperature: 0.7,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: "Generate the full report based on the given information." }],
    });

    let aiTextReceived = false;

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta?.text) {
        aiTextReceived = true;
        console.log(`✍️ AI chunk received: ${chunk.delta.text}`);
        res.write(`data: ${JSON.stringify({ type: "aiText", text: chunk.delta.text })}\n\n`);
        res.flush();
      }
    }

    if (!aiTextReceived) {
      console.error("❌ AI did not return any text!");
      res.write(`data: ${JSON.stringify({ type: "error", message: "AI returned empty response." })}\n\n`);
      res.flush();
    }

    res.write("data: [DONE]\n\n");
    res.end();
    console.log("✅ AI analysis streamed successfully.");
  } catch (error: any) {
    console.error("❌ API Error:", error);
    res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
    res.flush();
    res.end();
  }
}

// Fetch Stock Data from Yahoo Finance
async function getStockData(sector: string) {
  const sectorTickers: { [key: string]: string[] } = {
    "automotive": ["TSLA", "F", "GM", "TM"],
    "technology": ["XLK", "AAPL", "MSFT", "NVDA"],
    "finance": ["XLF", "JPM", "GS", "BAC"],
    "energy": ["XLE", "XOM", "CVX", "COP"],
    "crypto": ["BTC-USD", "ETH-USD", "COIN", "MSTR"],
    "biotech": ["IBB", "BIIB", "VRTX", "REGN"],
    "defense": ["ITA", "LMT", "RTX", "NOC"],
    "renewable energy": ["ICLN", "FSLR", "ENPH", "SEDG"],
    "semiconductors": ["SOXX", "NVDA", "TSM", "AMD"],
  };

  if (!sectorTickers[sector]) {
    console.warn(`⚠ No tickers found for ${sector}. Skipping stock data.`);
    return { [sector]: "Unavailable (No Ticker)" };
  }

  const tickers = sectorTickers[sector];
  let stockData: { [key: string]: any } = {};

  for (const ticker of tickers) {
    try {
      console.log(`📈 Fetching stock data for ${ticker}`);
      const result = await yahooFinance.quoteSummary(ticker, { modules: ["price", "summaryDetail"] });

      if (!result || !result.price) {
        console.error(`❌ No stock data found for ${ticker}`);
        stockData[ticker] = "Unavailable (No Data)";
        continue;
      }

      stockData[ticker] = {
        price: result.price.regularMarketPrice || "N/A",
        change: result.price.regularMarketChangePercent || "N/A",
        marketCap: result.price.marketCap || "N/A",
        peRatio: result.summaryDetail?.trailingPE || "N/A",
        dividendYield: result.summaryDetail?.dividendYield || "N/A",
      };
    } catch (error) {
      console.error(`❌ Error fetching stock data for ${ticker}:`, error);
      stockData[ticker] = "Unavailable (Fetch Error)";
    }
  }

  return stockData;
}

// Fetch Macroeconomic Data from FRED API
async function getMacroData() {
  const macroeconomicIndicators = {
    "Oil Prices": "DCOILWTICO",
    "GDP Growth": "A191RL1Q225SBEA",
    "Inflation Rate": "CPIAUCSL",
    "Interest Rates": "FEDFUNDS",
  };

  let macroData: { [key: string]: any } = {};
  for (const [key, series_id] of Object.entries(macroeconomicIndicators)) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${FRED_API_KEY}&file_type=json`;
    try {
      console.log(`📊 Fetching macro data: ${key}`);
      const response = await fetch(url);
      const data = await response.json();

      if (!data || !data.observations || data.observations.length === 0) {
        console.error(`❌ No data for ${key}`);
        macroData[key] = "Unavailable";
        continue;
      }

      macroData[key] = parseFloat(data.observations[data.observations.length - 1].value);
    } catch (error) {
      console.error(`❌ Error fetching macro data: ${key}`, error);
      macroData[key] = "Unavailable";
    }
  }

  return macroData;
}