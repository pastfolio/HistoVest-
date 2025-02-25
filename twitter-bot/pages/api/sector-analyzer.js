import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import fetch from "node-fetch";
import yahooFinance from "yahoo-finance2";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FRED_API_KEY = process.env.FRED_API_KEY;

if (!ANTHROPIC_API_KEY) console.error("❌ ERROR: Missing Anthropic API key.");
if (!FRED_API_KEY) console.error("❌ ERROR: Missing FRED API key.");

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ✅ **Added All Sectors & Sub-Sectors**
const sectorTickers = {
    // 🚗 Automotive & Mobility
    "automotive": ["TSLA", "F", "GM", "TM"],
    "ev manufacturers": ["TSLA", "RIVN", "LCID", "BYD", "NIO"],
    "ev charging": ["CHPT", "EVGO", "BLNK"],
    "autonomous vehicles": ["GOOGL", "TSLA", "MBLY"],

    // 🔥 Technology
    "technology": ["XLK", "AAPL", "MSFT", "NVDA"],
    "semiconductors": ["SOXX", "NVDA", "AMD", "TSM", "INTC", "ASML"],
    "ai": ["NVDA", "AI", "MSFT", "GOOGL", "META"],
    "cybersecurity": ["CRWD", "PANW", "ZS", "OKTA"],
    "cloud computing": ["SNOW", "DDOG", "MSFT", "AWS"],
    "big data & analytics": ["PLTR", "SPLK", "SNOW", "MDB"],

    // 🔋 Energy & Utilities
    "energy": ["XLE", "XOM", "CVX", "COP"],
    "renewable energy": ["ICLN", "FSLR", "ENPH", "SEDG", "PLUG"],
    "solar energy": ["TAN", "FSLR", "ENPH", "SPWR"],
    "wind energy": ["FAN", "NEE", "VWS.CO"],
    "nuclear energy": ["URA", "CCJ", "NXE", "UEC"],
    "oil drilling": ["RIG", "OXY", "SLB", "BKR", "HAL"],
    "natural gas": ["UNG", "CHK", "LNG", "APA"],

    // 💰 Financials
    "finance": ["XLF", "JPM", "GS", "BAC", "MS"],
    "fintech": ["SQ", "PYPL", "ADYEY", "AFRM"],
    "crypto": ["BTC-USD", "ETH-USD", "COIN", "MSTR"],
    "insurance": ["BRK.B", "AIG", "PGR", "TRV"],
    "asset management": ["BLK", "TROW", "BEN"],
    "reits": ["SPG", "PLD", "O", "AVB"],

    // 🏥 Healthcare & Biotech
    "biotech": ["IBB", "BIIB", "VRTX", "REGN"],
    "pharmaceuticals": ["PFE", "MRK", "LLY", "JNJ", "BMY"],
    "gene editing": ["CRSP", "EDIT", "NTLA", "BEAM"],
    "medical devices": ["ISRG", "MDT", "BSX", "ZBH"],
    "health insurance": ["UNH", "ANTM", "HUM", "CNC"],
    "telemedicine": ["TDOC", "AMWL", "DOCS"],

    // 🏗️ Commodities & Mining
    "gold miners": ["GDX", "NEM", "GOLD", "AEM", "KGC"],
    "silver miners": ["SIL", "AG", "PAAS", "WPM", "FSM"],
    "copper miners": ["COPX", "FCX", "SCCO", "TECK"],
    "lithium miners": ["LIT", "ALB", "SQM", "LTHM", "PLL"],
    "uranium miners": ["URA", "CCJ", "NXE", "UEC"],
    "coal miners": ["BTU", "ARCH", "CEIX", "HCC"],
    "steel and iron": ["X", "MT", "CLF", "NUE"],
    "agriculture commodities": ["WEAT", "CORN", "SOYB", "ADM", "BG"],

    // 🏗️ Industrials
    "aerospace & defense": ["LMT", "RTX", "BA", "NOC"],
    "trucking & logistics": ["UPS", "FDX", "XPO"],
    "construction materials": ["VMC", "MLM", "SUM"],
    "machinery": ["CAT", "DE", "CUM", "PWR"],

    // 🏠 Real Estate
    "residential real estate": ["Z", "RDFN", "LEN", "DHI"],
    "commercial real estate": ["CBRE", "JLL", "SLG"],
    "hospitality & hotels": ["MAR", "H", "HLT"],

    // 🛍️ Consumer Goods & Retail
    "retail": ["AMZN", "WMT", "TGT"],
    "luxury goods": ["LVMUY", "RMS.PA", "TIF"],
    "fast food": ["MCD", "SBUX", "CMG"],
    "e-commerce": ["BABA", "SHOP", "MELI"],
    "beverages": ["KO", "PEP", "STZ"],
    "alcohol": ["DEO", "SAM", "BF.B"],
    "tobacco": ["PM", "MO", "BTI"],

    // 🎬 Media & Entertainment
    "streaming": ["NFLX", "DIS", "ROKU", "PARA"],
    "gaming": ["ATVI", "TTWO", "EA"],
    "social media": ["META", "TWTR", "SNAP"],

    // 🚀 Emerging Sectors
    "space exploration": ["SPCE", "RKLB", "ASTR"],
    "ai & robotics": ["BOTZ", "IRBT", "ROBO"],
    "metaverse": ["META", "RBLX", "U"],
    "electric aviation": ["JOBY", "ACHR", "LILM"],
    "hydrogen": ["PLUG", "BE", "BLDP"],
    "3d printing": ["DDD", "SSYS", "VJET"],

    // 🚢 Transportation
    "airlines": ["DAL", "AAL", "UAL", "LUV"],
    "railroads": ["CSX", "UNP", "NSC"],
    "shipping": ["ZIM", "MATX", "KEX"],

    // 🌍 International Markets
    "chinese tech": ["BABA", "JD", "PDD", "BIDU"],
    "emerging markets": ["EEM", "VWO", "FM"],
    "india stocks": ["TCS.NS", "RELIANCE.NS", "HDFCBANK.NS"],
    "european markets": ["VGK", "EZU", "EWG"],
    "japanese stocks": ["EWJ", "TM", "NTDOY"],

    // 🌿 Agriculture & Food Production
    "farming": ["ADM", "CAG", "AGCO"],
    "fertilizers": ["NTR", "MOS", "CF"],
    "cannabis": ["TLRY", "CGC", "ACB"],

    // 🛠️ Utilities
    "water utilities": ["AWK", "WTRG", "CWT"],
    "electric utilities": ["DUK", "NEE", "SO"],

    // 💡 Education & Publishing
    "education stocks": ["CHGG", "COUR", "LOPE"],
    "publishing": ["NYT", "GCI", "SCHL"],
};

// ✅ Fetch stock market data
async function getStockData(sector) {
    console.log(`📈 Fetching stock data for sector: ${sector}`);

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

// ✅ Fetch macroeconomic data
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
            macroData[key] = data?.observations?.length ? parseFloat(data.observations[data.observations.length - 1].value) : "Unavailable";
        } catch (error) {
            console.error(`❌ Error fetching ${key}:`, error);
            macroData[key] = "Unavailable";
        }
    }

    return macroData;
}

// ✅ Generate Institutional-Grade AI Report with Clickable Sectors
async function generateSectorAnalysis(sector, macroData, stockData) {
    console.log(`🤖 Generating AI report for: ${sector}`);

    const systemPrompt = `
    **Institutional-Grade Analysis of the ${sector} Sector (2025)**
    
    **Macroeconomic Overview**
    - **GDP Growth:** ${macroData["GDP Growth"] || "N/A"}%  
    - **Inflation Rate:** ${macroData["Inflation Rate"] || "N/A"}%  
    - **Interest Rates:** ${macroData["Interest Rates"] || "N/A"}%  
    - **Oil Prices:** ${macroData["Oil Prices"] || "N/A"} per barrel  

    **Stock Market Overview**
    ${Object.entries(stockData).map(([ticker, data]) => `
    - **[${ticker}](https://finance.yahoo.com/quote/${ticker})**
      - **Price:** $${data.price || "N/A"}
      - **Market Cap:** ${data.marketCap || "N/A"}
      - **P/E Ratio:** ${data.peRatio || "N/A"}
      - **Dividend Yield:** ${data.dividendYield || "N/A"}
    `).join("\n")}

    **Investment Trends & Market Cycles**
    - **What trends are shaping ${sector} in 2025?**  
    - **How have market cycles impacted investor positioning?**  

    **Competitive Landscape & Key Players**
    - **Who are the dominant players in ${sector}?**  
    - **Which companies are gaining market share?**  

    **Future Projections & Risks**
    - **What are the biggest risks and opportunities from 2025-2030?**  
    - **What disruptions could impact industry growth?**  

    **Ensure this report is highly detailed and 4096 tokens long.**
    `;

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 4096,
            temperature: 0.7,
            system: systemPrompt,
            messages: [{ role: "user", content: "Generate the full report based on this data." }],
        });

        return response?.content || "❌ AI response failed.";
    } catch (error) {
        console.error("❌ AI Request Failed:", error.message);
        return `❌ AI request failed: ${error.message}`;
    }
}

// ✅ API Handler
export default async function handler(req, res) {
    try {
        const sector = req.query.sector || "General Market";
        const macroData = await getMacroData();
        const stockData = await getStockData(sector);
        const aiAnalysis = await generateSectorAnalysis(sector, macroData, stockData);

        res.status(200).json({ sector, macroData, stockData, aiAnalysis });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}

