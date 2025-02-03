import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { startValue, endValue, stocks, startDate, endDate } = req.body;

        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
            return res.status(400).json({ error: "No stock data provided for AI summary." });
        }

        const growth = ((endValue - startValue) / startValue) * 100;

        // Ensure stock data is valid before processing
        let stockAnalysis = "";
        for (const stock of stocks) {
            const stockName = getStockName(stock.symbol);
            
            // Set defaults if values are missing
            const startPrice = stock.startPrice !== undefined ? `$${stock.startPrice.toFixed(2)}` : "N/A";
            const endPrice = stock.endPrice !== undefined ? `$${stock.endPrice.toFixed(2)}` : "N/A";
            const growthRate = stock.growth !== undefined ? `${stock.growth.toFixed(2)}%` : "N/A";

            stockAnalysis += `- **${stock.symbol.toUpperCase()}** (${stockName}):\n`;
            stockAnalysis += `  - Start Price: **${startPrice}**, End Price: **${endPrice}**, Growth: **${growthRate}**\n`;
        }

        // Construct dynamic prompt
        const prompt = `
        **Portfolio Performance Summary (${startDate} - ${endDate})**
        
        - **Initial Portfolio Value:** $${startValue.toFixed(2)}
        - **Final Portfolio Value:** $${endValue.toFixed(2)}
        - **Overall Growth:** ${growth.toFixed(2)}%

        **Stock-Specific Analysis:**
        ${stockAnalysis}

        ---
        ### **Market & Sector Analysis**
        - How did macroeconomic conditions (interest rates, inflation, major world events) influence this period?
        - How did the major sectors (tech, energy, finance, consumer) perform relative to these stocks?
        - What major market trends affected investor sentiment?
        - If the investor held onto this portfolio beyond ${endDate}, what likely happened next?
        
        Provide a detailed, financial, and investment-oriented breakdown with key takeaways.
        `;

        const openaiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const summary = openaiResponse.choices[0]?.message?.content || "No insights available.";
        res.status(200).json({ summary });

    } catch (error) {
        console.error("Error in AI Summary API:", error);
        res.status(500).json({ error: "Failed to generate AI summary. Please try again later." });
    }
}

// Function to map stock tickers to their full names
function getStockName(ticker) {
    const stockNames = {
        rig: "Transocean Ltd.",
        ccj: "Cameco Corporation",
        tdw: "Tidewater Inc.",
        spy: "S&P 500 ETF",
        aapl: "Apple Inc.",
        tsla: "Tesla Inc.",
        nvda: "NVIDIA Corporation",
        msft: "Microsoft Corporation",
        amzn: "Amazon.com Inc.",
        goog: "Alphabet Inc.",
    };
    return stockNames[ticker.toLowerCase()] || "Unknown Company";
}
