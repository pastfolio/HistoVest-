import { supabase } from "@/lib/supabase";
import yahooFinance from "yahoo-finance2";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// ✅ Environment Variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FRED_API_KEY = process.env.FRED_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Initialize Supabase and AI Client
const supabaseClient = supabase;
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ✅ API Route
export default async function handler(req, res) {
    const { sector } = req.query;
    if (!sector) return res.status(400).json({ error: "Sector is required" });

    console.log(`📡 Checking cache for ${sector}...`);

    // 1️⃣ Check Supabase for cached data
    const { data: cachedData, error } = await supabaseClient
        .from("sector_analysis")
        .select("*")
        .eq("sector", sector)
        .single();

    if (error) console.log("🔍 No cached data found, fetching fresh...");

    // 2️⃣ If cached data exists & is recent (<24 hours), use it
    if (cachedData) {
        const lastUpdated = new Date(cachedData.updated_at);
        const now = new Date();
        const diffHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        if (diffHours < 24) {
            console.log(`✅ Using cached data for ${sector}`);
            return res.status(200).json(cachedData);
        }
    }

    // 3️⃣ Fetch new data if outdated
    console.log(`🔄 Fetching fresh data for ${sector}...`);
    const macroData = await getMacroData();
    const stockData = await getStockData(sector);

    // ✅ Enable streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send stock & macroeconomic data immediately
    res.write(`data: ${JSON.stringify({ type: "stock-macro", data: { stockData, macroData } })}\n\n`);
    res.flush(); // **Ensure the client gets this first!**

    console.log("🤖 Generating AI-powered sector analysis...");
    
    // ✅ AI Streaming Starts Here
    const stream = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        temperature: 0.7,
        stream: true,
        system: `Generate an institutional-grade analysis for ${sector} sector.`,
        messages: [{ role: "user", content: "Start the analysis." }],
    });

    for await (const chunk of stream) {
        if (chunk.type === "text") {
            res.write(`data: ${JSON.stringify({ type: "aiText", text: chunk.text })}\n\n`);
            res.flush();
        }
    }

    res.write("data: [DONE]\n\n");
    res.end();
    console.log("✅ AI analysis streamed successfully.");
}

// ✅ Fetch Stock Data from Yahoo Finance
async function getStockData(sector) {
    const sectorTickers = {
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
    let stockData = {};

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

// ✅ Fetch Macroeconomic Data from FRED API
async function getMacroData() {
    const macroeconomicIndicators = {
        "Oil Prices": "DCOILWTICO",
        "GDP Growth": "A191RL1Q225SBEA",
        "Inflation Rate": "CPIAUCSL",
        "Interest Rates": "FEDFUNDS",
    };

    let macroData = {};
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
