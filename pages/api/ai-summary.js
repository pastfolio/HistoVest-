import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const { stocks, startDate, endDate } = req.body;

        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
            return res.status(400).json({ error: "Invalid or missing stock data" });
        }

        // Build dynamic stock list
        const stockList = stocks.map(stock => stock.symbol.toUpperCase()).join(", ");

        // AI Prompt
        const prompt = `
Analyze the **historical performance** of the following stocks from **${startDate}** to **${endDate}**, focusing on key market factors:

**Stocks:** ${stockList}

Stock-Specific Breakdown:
- How did each stock perform over this time period? **Were earnings stronger or weaker than expected?**
- Identify the **most significant price movements** and the catalysts behind them (**earnings beats/misses, product launches, leadership changes, macro trends**).
- How did each stock perform **compared to analyst estimates** and **investor expectations**? Were they bullish or bearish?
- Did major **funds or hedge funds increase or decrease positions** during this time?

Macroeconomic & Industry Impact:
- How did **interest rates, inflation, GDP growth, and Federal Reserve policy** impact these stocks?
- Were there **major regulatory shifts, supply chain disruptions, or geopolitical events** that influenced the stock price?
- Did investor sentiment **favor or penalize these stocks** during this period?

Long-Term Market Positioning (After ${endDate}):
- Did these stocks **recover, continue declining, or shift direction** post-${endDate}?
- What were the **most significant risks and opportunities** each company faced after ${endDate}?
- **If applicable, mention major acquisitions, restructuring, or CEO changes** that shaped the company's future.

🛑 **Important:** Do not be vague. Provide confident analysis. If trends or reasons are clear, state them directly. If comparisons are relevant, include them.
        `;

        // Call OpenAI API
        let openaiResponse = await openai.chat.completions.create({
            model: "gpt-4", // Change to "gpt-3.5-turbo" for faster responses
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            temperature: 0.7,
        });

        let summary = openaiResponse.choices[0]?.message?.content || "";

        // **Fallback Handling - Retry if AI gives a weak response**
        if (!summary || summary.includes("I'm sorry") || summary.length < 100) {
            console.warn("AI returned a weak response. Retrying...");
            openaiResponse = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1500,
                temperature: 0.7,
            });
            summary = openaiResponse.choices[0]?.message?.content || "No insights available.";
        }

        res.status(200).json({ summary });

    } catch (error) {
        console.error("Error in AI Summary API:", error);
        res.status(500).json({ error: "Failed to generate AI summary" });
    }
}
