import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "Missing OpenAI API Key in environment variables." });
    }

    try {
        const { stocks, startDate, endDate } = req.body;

        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
            return res.status(400).json({ error: "Stocks array is missing or empty." });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start and End date are required." });
        }

        // Sort stocks by allocation size (largest first)
        const sortedStocks = [...stocks].sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

        // Construct AI prompt with structured formatting
        let stockAnalysisInstructions = "";
        for (const stock of sortedStocks) {
            const percentage = parseFloat(stock.percentage);
            
            stockAnalysisInstructions += `
            **${stock.symbol} (${stock.percentage}% of Portfolio)**  
            ---------------------------------------------  
            ${percentage >= 20
                ? `Provide a **detailed** company overview of ${stock.symbol} between ${startDate} and ${endDate}. 
                - Discuss stock price movements and major influencing factors.
                - Analyze earnings reports, revenue growth, and profit trends.
                - Mention key product launches or business expansions, if any.
                - What strategic moves (acquisitions, cost-cutting, market expansion) were undertaken?
                - How strong was competition in the industry, and did ${stock.symbol} maintain/gain/lose market share?
                - Summarize investor sentiment—were analysts bullish, neutral, or bearish?
                - Ensure the response is **at least 4-6 full sentences** and formatted as a paragraph.`
                : `Summarize ${stock.symbol}'s performance from ${startDate} to ${endDate}.
                - Provide a **concise** overview of stock price movement, key earnings reports, and market position.
                - Focus on **brief but structured paragraphs**, around 3-4 sentences.
                - If there were no major events, skip those topics and focus on overall stock performance.`}
            `;
        }

        // AI Prompt for Macroeconomic Summary
        const aiPrompt = `
            **Macro Overview: ${startDate} - ${endDate}**  
            ---------------------------------------------  
            Provide a **detailed** market overview (at least 8 full sentences) covering:  
            - Stock market trends and sector performances.  
            - Key economic factors (GDP growth, inflation, interest rates, employment).  
            - Major investor sentiment shifts and their causes.  
            - Geopolitical events or policy changes that affected the market.  
            - How these macro factors influenced the overall financial climate.  
            
            **Company-Specific Insights (Weighted by Portfolio Allocation)**  
            ${stockAnalysisInstructions}
        `;

        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: aiPrompt }],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const summary = aiResponse.choices[0]?.message?.content || "No AI market insights available.";

        res.status(200).json({ summary });

    } catch (error) {
        console.error("AI Summary Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate portfolio summary" });
    }
}
