import yahooFinance from "yahoo-finance2";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const { stocks, startDate, endDate } = req.body;
        let portfolioValueStart = 0;
        let portfolioValueEnd = 0;
        let shares = {};
        let cashAllocation = 0;
        let stockSummaries = [];
        let missingStocks = [];

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

                const startPrice = stockData.quotes[0].adjclose;
                const endPrice = stockData.quotes[stockData.quotes.length - 1].adjclose;

                console.log(`${stock.symbol} Adjusted Prices: Start - ${startPrice}, End - ${endPrice}`);

                const percentage = parseFloat(stock.percentage) / 100;
                const investment = 100000 * percentage;
                shares[stock.symbol] = investment / startPrice;

                portfolioValueStart += shares[stock.symbol] * startPrice;
                portfolioValueEnd += shares[stock.symbol] * endPrice;

                stockSummaries.push(
                    `- **${stock.symbol.toUpperCase()}**: Started at $${startPrice.toFixed(2)}, ended at $${endPrice.toFixed(2)}.`
                );
            } catch (error) {
                console.error(`Error fetching data for ${stock.symbol}:`, error);
                missingStocks.push(stock.symbol);
                cashAllocation += parseFloat(stock.percentage);
            }
        }

        if (portfolioValueStart === 0) {
            throw new Error("Portfolio start value is zero, check stock data retrieval.");
        }

        let cashValueStart = (cashAllocation / 100) * 100000;
        let cashValueEnd = cashValueStart;

        portfolioValueStart += cashValueStart;
        portfolioValueEnd += cashValueEnd;

        const growth = ((portfolioValueEnd - portfolioValueStart) / portfolioValueStart) * 100;
        console.log(`Final Portfolio Value: ${portfolioValueEnd}, Growth: ${growth}%`);

        // 🔥 **Separate AI Requests for Stock & Macro Analysis**
        const stockSummariesAI = await Promise.all(
            stocks.map(async (stock) => {
                return getStockAnalysis(stock.symbol, startDate, endDate);
            })
        );

        const macroSummary = await getMacroAnalysis(startDate, endDate);

        res.status(200).json({
            startValue: portfolioValueStart.toFixed(2),
            endValue: portfolioValueEnd.toFixed(2),
            growth: growth.toFixed(2),
            summary: `# Portfolio Summary & Review\n\n${stockSummariesAI.join("\n\n")}\n\n## Macroeconomic Analysis\n\n${macroSummary}`,
            missingStocks: missingStocks.length > 0 ? `Some stocks were missing data and were treated as cash: ${missingStocks.join(", ")}` : null,
        });

    } catch (error) {
        console.error("Error in simulator API:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getStockAnalysis(symbol, startDate, endDate) {
    try {
        const aiPrompt = `
            **📊 Stock Analysis: ${symbol} (${startDate} - ${endDate})**  
            - What were the major price movements?  
            - How did earnings perform vs expectations?  
            - What were the key drivers (product launches, macro trends, sentiment shifts)?  
            - How did competitors like (similar companies) compare?  
            - What were analysts saying, and did hedge funds buy or sell?  
        `;

        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: aiPrompt }],
            max_tokens: 1500,
            temperature: 0.7,
        });

        return aiResponse.choices[0]?.message?.content || `No insights available for ${symbol}`;
    } catch (error) {
        console.error(`Error generating AI summary for ${symbol}:`, error);
        return `No AI insights available for ${symbol}`;
    }
}

async function getMacroAnalysis(startDate, endDate) {
    try {
        const macroPrompt = `
            **🌍 Macroeconomic Overview (${startDate} - ${endDate})**  
            - How did major indices perform?  
            - What economic policies impacted the market?  
            - How did inflation, interest rates, and trade affect investor sentiment?  
        `;

        const macroResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: macroPrompt }],
            max_tokens: 1000,
            temperature: 0.7,
        });

        return macroResponse.choices[0]?.message?.content || "No macroeconomic insights available.";
    } catch (error) {
        console.error("Error generating macroeconomic insights:", error);
        return "No macroeconomic insights available.";
    }
}
