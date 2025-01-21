import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { stocks, startDate, endDate } = req.body;

      // Mock stock prices for the start and end dates
      const mockPricesStart = stocks.reduce((acc, stock) => {
        acc[stock.symbol] = Math.random() * 100; // Replace with real API
        return acc;
      }, {});

      const mockPricesEnd = stocks.reduce((acc, stock) => {
        acc[stock.symbol] = Math.random() * 120; // Replace with real API
        return acc;
      }, {});

      let portfolioValueStart = 0;
      let shares = {};

      // Calculate number of shares purchased based on allocation
      stocks.forEach((stock) => {
        const percentage = parseFloat(stock.percentage) / 100;
        const investment = 100000 * percentage; // Assume $100k initial portfolio
        const priceStart = mockPricesStart[stock.symbol];
        shares[stock.symbol] = investment / priceStart;
        portfolioValueStart += shares[stock.symbol] * priceStart;
      });

      // Calculate portfolio value on the end date
      let portfolioValueEnd = 0;
      stocks.forEach((stock) => {
        const priceEnd = mockPricesEnd[stock.symbol];
        portfolioValueEnd += shares[stock.symbol] * priceEnd;
      });

      // Generate AI summary
      const stockDetails = stocks
        .map((stock) => `${stock.symbol}: ${stock.percentage}%`)
        .join(", ");
      const prompt = `
        Analyze the portfolio performance from ${startDate} to ${endDate} based on the following stocks:
        ${stockDetails}.
        
        Consider:
        1. Stock-specific performance: which stocks performed the best and the worst? Why?
        2. Broader market trends during this period (e.g., macroeconomic factors, inflation, interest rates, etc.).
        3. Sector-specific trends (e.g., technology, energy, finance).
        4. Recommendations for improving portfolio allocation based on past performance.
        Provide a detailed analysis in plain language, highlighting what went well and what could be improved.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const summary =
        response.choices[0]?.message?.content || "No insights available.";

      res.status(200).json({
        startValue: portfolioValueStart,
        endValue: portfolioValueEnd,
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
