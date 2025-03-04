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

// Custom fetch with timeout to handle Yahoo Finance's unreliable responses
const fetchWithTimeout = async (url: string, options: any, timeoutMs: number = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

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

// Fetch Stock Data from Yahoo Finance with expanded sectors, formatted numbers, and retry logic
async function getStockData(sector: string) {
  const sectorTickers = {
    "technology": ["XLK", "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN"],
    "semiconductors": ["SOXX", "NVDA", "TSM", "AMD", "INTC", "ASML"],
    "software-as-a-service (SaaS)": ["CRM", "ORCL", "SAP", "NOW"],
    "cybersecurity": ["HACK", "PANW", "FTNT", "CRWD", "ZS"],
    "cloud computing": ["CLOU", "AMZN", "MSFT", "GOOGL", "IBM", "SNOW"],
    "artificial intelligence (AI)": ["AIQ", "NVDA", "MSFT", "GOOGL", "TSLA"],
    "quantum computing": ["IONQ", "QUBT", "NVDA"],
    "blockchain technology": ["BTC-USD", "ETH-USD", "COIN", "MSTR", "RIOT"],
    "fintech": ["FINX", "PYPL", "SQ", "V", "MA", "ADYEY"],
    "data centers": ["DLR", "EQIX", "CONE", "QTS"],
    "consumer electronics": ["SONY", "AAPL", "MSI", "LOGI"],
    "augmented reality (AR)": ["AAPL", "GOOGL", "MSFT", "META"],
    "virtual reality (VR)": ["META", "GOOGL", "SONY", "NVDA"],
    "IT services": ["IBM", "INFY", "ACN", "DXC"],
    "internet of things (IoT)": ["TXN", "STM", "QCOM", "NXPI"],
    "robotics": ["BOTZ", "ROBO", "IRBT", "ABB"],
    "edge computing": ["FSLY", "NET", "AMD", "NVDA"],
    "web3": ["ETH-USD", "MATIC-USD", "UNI-USD"],
    "3D printing": ["SSYS", "DDD", "XONE", "MTLS"],
    "gaming technology": ["ESPO", "ATVI", "TTWO", "EA"],
    "telecommunications equipment": ["VZ", "T", "NOK", "ERIC"],

    "pharmaceuticals": ["PFE", "MRK", "LLY", "BMY", "GILD"],
    "biotech": ["IBB", "BIIB", "VRTX", "REGN", "AMGN"],
    "gene editing (CRISPR)": ["CRSP", "EDIT", "NTLA"],
    "medical devices": ["ISRG", "SYK", "BSX", "ZBH"],
    "healthcare IT": ["TDOC", "CERN", "VEEV"],
    "telemedicine": ["TDOC", "AMWL", "DOCS"],
    "genomics": ["ARKG", "ILMN", "NVTA"],
    "nutraceuticals": ["HLF", "NATR", "MED"],
    "cannabis biotechnology": ["CGC", "TLRY", "CRON"],
    "personalized medicine": ["ILMN", "RHHBY", "EXAS"],

    "oil & gas exploration": ["XOP", "SLB", "HAL", "EOG"],
    "oil refining & marketing": ["PSX", "VLO", "MPC"],
    "natural gas": ["UNG", "CHK", "RRC"],
    "offshore drilling": ["RIG", "DO", "NE"],
    "nuclear energy": ["URA", "CCJ", "NXE", "LEU"],
    "renewable energy": ["ICLN", "FSLR", "ENPH", "SEDG"],
    "hydrogen fuel cells": ["PLUG", "BLDP", "BE"],
    "solar power": ["TAN", "RUN", "FSLR"],
    "wind energy": ["FAN", "NEE", "VWS"],
    "geothermal energy": ["ORA", "BRK-A"],

    "investment banks": ["GS", "JPM", "MS"],
    "asset management": ["BLK", "TROW", "STT"],
    "private equity": ["KKR", "BX", "CG"],
    "venture capital": ["GSVC", "HTGC", "SVVC"],
    "hedge funds": ["BRK.A", "CG", "PAG"],
    "stock exchanges": ["CME", "ICE", "NDAQ"],
    "payment processing": ["V", "MA", "SQ", "PYPL"],
    "insurance": ["TRV", "AIG", "PGR"],
    "mortgage lenders": ["RKT", "NRZ", "PFSI"],
    "REITs": ["XLRE", "O", "SPG"],
    "credit rating agencies": ["MCO", "SPGI"],
    "cryptocurrencies": ["BTC-USD", "ETH-USD", "COIN"],

    "gold mining": ["GDX", "NEM", "GOLD"],
    "silver & precious metals": ["SLV", "PAAS", "AG"],
    "rare earth metals": ["REMX", "MP", "LYC"],
    "copper & industrial metals": ["COPX", "FCX", "SCCO"],
    "diamond industry": ["TIF", "ZAL", "ALROSA"],
    "forestry & timber": ["WY", "PCH", "RFP"],
    "agriculture": ["ADM", "BG", "MOS"],
    "fishing & aquaculture": ["BASA", "SALM", "MHG"],
    "water treatment": ["AWK", "XYL", "WTRG"],
    "fertilizers & chemicals": ["CF", "MOS", "NTR"],
    "palm oil industry": ["KLK", "FGV", "SIME"],
    "corn & soybean production": ["CORN", "SOYB", "BG"],
    "nickel & cobalt": ["LIT", "ALB", "VALE"],
    "cocoa & coffee production": ["NESTLE", "KDP", "SBUX"],
    "natural gas liquids (NGLs)": ["ET", "WMB", "OKE"],
    "pulp & paper industry": ["IP", "WRK", "PKG"],
    "plastic recycling": ["WM", "RSG", "CLH"],
    "carbon credit trading": ["XOM", "OXY", "BP"]
  };

  if (!sectorTickers[sector]) {
    console.warn(`⚠ No tickers found for ${sector}. Skipping stock data.`);
    return { [sector]: "Unavailable (No Ticker)" };
  }

  const tickers = sectorTickers[sector];
  let stockData: { [key: string]: any } = {};

  for (const ticker of tickers) {
    let attempts = 0;
    const maxAttempts = 3;
    let result;

    while (attempts < maxAttempts) {
      try {
        console.log(`📈 Fetching stock data for ${ticker}, attempt ${attempts + 1}`);
        result = await yahooFinance.quoteSummary(ticker, { modules: ["price", "summaryDetail"] });
        if (!result || !result.price) {
          throw new Error(`No stock data found for ${ticker}`);
        }
        break;
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          console.error(`❌ Error fetching stock data for ${ticker} after ${maxAttempts} attempts:`, error);
          stockData[ticker] = "Unavailable (Fetch Error)";
          continue;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
      }
    }

    if (result) {
      stockData[ticker] = {
        price: roundToDecimal(result.price.regularMarketPrice),
        change: roundToDecimal(result.price.regularMarketChangePercent),
        marketCap: formatMarketCap(result.price.marketCap),
        peRatio: roundToDecimal(result.summaryDetail?.trailingPE),
        dividendYield: roundToDecimal(result.summaryDetail?.dividendYield),
      };
    }
  }

  return stockData;
}

// Helper function to round numbers to one decimal place
function roundToDecimal(num: number | undefined): string | number {
  if (num === undefined || num === null || isNaN(num)) return "N/A";
  return Number(num.toFixed(1));
}

// Helper function to format market cap to billions, millions, or trillions
function formatMarketCap(num: number | undefined): string {
  if (num === undefined || num === null || isNaN(num)) return "N/A";

  const trillion = 1000000000000; // 1 trillion
  const billion = 1000000000;     // 1 billion
  const million = 1000000;        // 1 million

  if (num >= trillion) {
    return `${Number((num / trillion).toFixed(1))}T`; // Trillions
  } else if (num >= billion) {
    return `${Number((num / billion).toFixed(1))}B`;  // Billions
  } else if (num >= million) {
    return `${Number((num / million).toFixed(1))}M`;  // Millions
  } else {
    return `${Number(num.toFixed(1))}`;              // Raw number if less than 1 million
  }
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
    try {
      console.log(`📊 Fetching macro data: ${key}`);
      const response = await fetchWithTimeout(
        `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${FRED_API_KEY}&file_type=json`,
        {},
        15000 // 15-second timeout
      );
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