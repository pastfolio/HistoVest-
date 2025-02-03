import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { stocks, startDate, endDate } = req.body;

      let portfolioValueStart = 0;
      let portfolioValueEnd = 0;
      let shares = {};
      let stockSummaries = [];

      const period1 = new Date(startDate).toISOString().split("T")[0];
      const period2 = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      console.log(`Fetching data from Yahoo Finance for ${stocks.length} stocks...`);

      for (const stock of stocks) {
        try {
          const stockData = await yahooFinance.chart(stock.symbol, {
            period1: period1,
            period2: period2,
            interval: "1d",
          });

          if (!stockData.quotes || stockData.quotes.length < 2) {
            throw new Error(`No valid stock data found for ${stock.symbol}`);
          }

          // ✅ Extract Adjusted Close Prices
          const startPrice = stockData.quotes[0].adjclose;
          const endPrice = stockData.quotes[stockData.quotes.length - 1].adjclose;

          console.log(`${stock.symbol} Adjusted Prices: Start - ${startPrice}, End - ${endPrice}`);

          // Calculate shares purchased
          const percentage = parseFloat(stock.percentage) / 100;
          const investment = 100000 * percentage;
          shares[stock.symbol] = investment / startPrice;

          // Calculate portfolio value
          portfolioValueStart += shares[stock.symbol] * startPrice;
          portfolioValueEnd += shares[stock.symbol] * endPrice;

          // Prepare stock summary for AI prompt
          stockSummaries.push(
            `- **${stock.symbol.toUpperCase()}**: Started at $${startPrice.toFixed(2)}, ended at $${endPrice.toFixed(2)}.`
          );
        } catch (error) {
          console.error(`Error fetching data for ${stock.symbol}:`, error);
        }
      }

      if (portfolioValueStart === 0) {
        throw new Error("Portfolio start value is zero, check stock data retrieval.");
      }

      const growth = ((portfolioValueEnd - portfolioValueStart) / portfolioValueStart) * 100;
      console.log(`Final Portfolio Value: ${portfolioValueEnd}, Growth: ${growth}%`);

      // ✅ Generate ChatGPT summary
      const aiPrompt = `
        Analyze the performance of the portfolio from ${startDate} to ${endDate}.

        Portfolio Details:
        ${stockSummaries.join("\n")}

        Consider:
        - Which stock performed the best and the worst?
        - Broader market trends during this period (macroeconomic factors, inflation, interest rates, etc.).
        - Sector-specific trends (technology, energy, finance).
        - Recommendations for improving portfolio allocation based on past performance.

        Provide a detailed yet easy-to-understand analysis.
      `;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: aiPrompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const summary = aiResponse.choices[0]?.message?.content || "No insights available.";

      res.status(200).json({
        startValue: portfolioValueStart.toFixed(2),
        endValue: portfolioValueEnd.toFixed(2),
        growth: growth.toFixed(2),
        summary,
      });
    } catch (error) {
      console.error("Error in simulator API:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
