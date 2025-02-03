import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { stocks, startDate, endDate } = req.body;

            if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
                return res.status(400).json({ error: "Invalid or missing stock data" });
            }

            // Format stock list dynamically
            const stockList = stocks.map(stock => stock.symbol.toUpperCase()).join(", ");

            // Construct AI prompt dynamically
            const prompt = `
            Analyze the historical performance of the following stocks between **${startDate}** and **${endDate}**:

            - **Stocks:** ${stockList}

            🔹 **Stock-Specific Analysis:**
            - How did each stock perform during this period?
            - Were there major **price movements, earnings surprises, or leadership changes** that affected them?
            - How did they compare **against competitors and their sector**?

            🔹 **Macroeconomic & Market Trends:**
            - What **economic events** (interest rate changes, recessions, inflation, crises) affected stock prices during this time?
            - Which sectors outperformed or underperformed?
            - How did investor sentiment shift in the market?

            🔹 **Investor Perception & Market Reaction:**
            - Were these stocks considered **undervalued or overvalued** during this period?
            - Did major institutions or hedge funds **increase or decrease holdings** in these stocks?
            - Were there notable **media narratives or analyst ratings** influencing their price?

            🔹 **Long-Term Perspective:**
            - If an investor held these stocks **beyond ${endDate}**, how did they likely perform in the following years?
            - What were the **key long-term trends or fundamental shifts** for these companies?

            **Provide well-structured insights and reasoning rather than exact price numbers.**
            `;

            // Call OpenAI API using GPT-3.5 instead of GPT-4
            const openaiResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",  // 🔹 Switched to GPT-3.5 for faster response
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1200, // Slightly reduced for even faster responses
                temperature: 0.7,
            });

            const summary = openaiResponse.choices[0]?.message?.content || "No insights available.";
            res.status(200).json({ summary });

        } catch (error) {
            console.error("Error in AI Summary API:", error);
            res.status(500).json({ error: "Failed to generate AI summary" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}
