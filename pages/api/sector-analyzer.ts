import { NextApiRequest, NextApiResponse } from "next";
import { getStockData, getMacroData } from "../../lib/fetchData";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) console.error("❌ ERROR: Missing Anthropic API key.");

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

async function generateSectorAnalysis(sector: string, macroData: any, stockData: any) {
  console.log("🤖 Sending AI request for full sector report...");
  
  const systemPrompt = `
  **Institutional-Grade Analysis of the ${sector} Sector (2025)**

  **Macroeconomic Overview**
  - GDP Growth: ${macroData["GDP Growth"] || "N/A"}%
  - Inflation Rate: ${macroData["Inflation Rate"] || "N/A"}%
  - Interest Rates: ${macroData["Interest Rates"] || "N/A"}%
  - Oil Prices: ${macroData["Oil Prices"] || "N/A"} per barrel

  **Stock Market Overview**
  ${Object.entries(stockData)
    .map(
      ([ticker, data]) => `
  - **${ticker}**
  - Price: $${data.price || "N/A"}
  - Market Cap: ${data.marketCap || "N/A"}
  - P/E Ratio: ${data.peRatio || "N/A"}
  - Dividend Yield: ${data.dividendYield || "N/A"}
  `
    )
    .join("\n")}

  **Investment Trends & Capital Flows**
  - Key investors in ${sector} include major hedge funds, institutions, and venture capital firms.
  - Track where capital is flowing in 2025.

  **Historical Market Cycles & Investment Patterns**
  - Compare past bull and bear markets in ${sector}.
  - Provide examples of crashes, recoveries, and major shifts.

  **Competitive Landscape & Key Players**
  - Breakdown of top companies, their strategies, and emerging challengers.

  **Future Projections & Industry Risks**
  - What risks does ${sector} face between 2025-2030?
  - What major technological disruptions or policy changes could impact growth?
  `;

  try {
    console.log("🧠 Sending request to Anthropic AI...");
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: "Generate the full report based on the given information." }],
    });

    console.log("✅ AI response received successfully.");
    return response?.content || "❌ AI response failed.";
  } catch (error: any) {
    console.error("❌ AI Request Failed:", error.message);
    return `❌ AI request failed: ${error.message}`;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🚀 API Request Received:", req.query);

  try {
    const sector = (req.query.sector as string) || "General Market";
    console.log(`📊 Fetching macroeconomic data for: ${sector}`);
    const macroData = await getMacroData();
    console.log("✅ Macroeconomic data fetched:", macroData);

    console.log(`📈 Fetching stock market data for: ${sector}`);
    const stockData = await getStockData(sector);
    console.log("✅ Stock market data fetched:", stockData);

    console.log("🤖 Generating AI-powered sector analysis...");
    const aiAnalysis = await generateSectorAnalysis(sector, macroData, stockData);
    console.log("✅ AI analysis generated successfully.");

    res.status(200).json({
      sector,
      macroData,
      stockData,
      aiAnalysis,
    });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
