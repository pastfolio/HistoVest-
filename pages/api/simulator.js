import yahooFinance from "yahoo-finance2";
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
        const { stocks, startDate, endDate, investmentAmount } = req.body;

        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
            return res.status(400).json({ error: "Stocks array is missing or empty." });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start and End date are required." });
        }
        if (!investmentAmount || isNaN(parseFloat(investmentAmount)) || investmentAmount <= 0) {
            return res.status(400).json({ error: "Invalid investment amount." });
        }

        let portfolioValueStart = 0;
        let portfolioValueEnd = 0;
        let missingStocks = [];
        let stockSummaries = [];
        let debugLogs = [];

        const period1 = new Date(startDate).toISOString().split("T")[0];
        const period2 = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const totalInvestment = parseFloat(investmentAmount);

        debugLogs.push(`Fetching data for ${stocks.length} stocks with investment: $${totalInvestment}`);

        console.time("Stock Data & Calculation"); // ✅ Start measuring calculation time

        const sortedStocks = stocks.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

        for (const stock of sortedStocks) {
            try {
                console.log(`Fetching data for ${stock.symbol}`);
                debugLogs.push(`Fetching data for ${stock.symbol}`);

                let companyName = stock.symbol;
                try {
                    const stockInfo = await yahooFinance.quoteSummary(stock.symbol, { modules: ["assetProfile"] });
                    if (stockInfo?.assetProfile?.companyName) {
                        companyName = stockInfo.assetProfile.companyName;
                    }
                } catch (infoError) {
                    debugLogs.push(`Failed to fetch company info for ${stock.symbol}`);
                }

                const stockData = await yahooFinance.chart(stock.symbol, {
                    period1: period1,
                    period2: period2,
                    interval: "1mo",
                });

                if (!stockData || !stockData.quotes || stockData.quotes.length < 2) {
                    throw new Error(`No valid stock data found for ${companyName} (${stock.symbol})`);
                }

                const startPrice = stockData.quotes[0]?.adjclose;
                const endPrice = stockData.quotes[stockData.quotes.length - 1]?.adjclose;

                if (!startPrice || !endPrice || isNaN(startPrice) || isNaN(endPrice)) {
                    debugLogs.push(`⚠️ Skipping ${stock.symbol} due to invalid price data`);
                    missingStocks.push(stock.symbol);
                    continue;
                }

                const priceChange = ((endPrice - startPrice) / startPrice) * 100;

                console.log(`${companyName} (${stock.symbol}) Prices: Start - $${startPrice}, End - $${endPrice}, Change - ${priceChange.toFixed(2)}%`);
                debugLogs.push(`${companyName} (${stock.symbol}) Prices: Start - $${startPrice}, End - $${endPrice}, Change - ${priceChange.toFixed(2)}%`);

                const percentage = parseFloat(stock.percentage) / 100;
                const investment = totalInvestment * percentage;
                const shares = investment / startPrice;

                portfolioValueStart += shares * startPrice;
                portfolioValueEnd += shares * endPrice;

                const stockAnalysis = await getStockAnalysis(companyName, stock.symbol, startDate, endDate, priceChange);
                stockSummaries.push(stockAnalysis);

            } catch (error) {
                debugLogs.push(`Error fetching data for ${stock.symbol}: ${error.message}`);
                missingStocks.push(stock.symbol);
            }
        }

        console.timeEnd("Stock Data & Calculation"); // ✅ End calculation time tracking

        if (portfolioValueStart === 0) {
            throw new Error("Portfolio start value is zero, check stock data retrieval.");
        }

        const growth = ((portfolioValueEnd - portfolioValueStart) / portfolioValueStart) * 100;

        console.time("AI Market Summary Generation"); // ✅ Start AI time tracking
        const macroSummary = await getMacroAnalysis(startDate, endDate);
        console.timeEnd("AI Market Summary Generation"); // ✅ End AI time tracking

        res.status(200).json({
            startValue: portfolioValueStart.toFixed(2),
            endValue: portfolioValueEnd.toFixed(2),
            growth: growth.toFixed(2),
            summary: `${macroSummary}\n\n${stockSummaries.join("\n\n")}`,
            missingStocks: missingStocks.length > 0 ? `Some stocks were missing data and were treated as cash: ${missingStocks.join(", ")}` : null,
            debug: debugLogs,
        });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: error.message || "Internal server error", debug: error.stack });
    }
}

// ✅ **Detailed Market Overview**
async function getMacroAnalysis(startDate, endDate) {
    try {
        const aiPrompt = `
            Provide a highly detailed financial market overview from ${startDate} to ${endDate}.
            Discuss stock market trends, economic factors, investor sentiment, and major global events.
            Explain how these factors impacted companies and industries in-depth.
        `;

        console.time("AI Call for Market Summary"); // Start AI timing
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: aiPrompt }],
            max_tokens: 700,
            temperature: 0.7,
        });
        console.timeEnd("AI Call for Market Summary"); // End AI timing

        return aiResponse.choices[0]?.message?.content || `No AI market insights available for this period.`;

    } catch (error) {
        console.error("AI request failed for Market Overview:", error);
        return `No AI market insights available.`;
    }
}

// ✅ **Detailed Company Analysis**
async function getStockAnalysis(companyName, symbol, startDate, endDate, priceChange) {
    try {
        const aiPrompt = `
            Analyze ${companyName} (${symbol}) from ${startDate} to ${endDate}.
            Discuss stock price movements, earnings reports, product launches, business decisions, and industry trends.
            Only include relevant sections—if a topic isn't applicable, omit it.
        `;

        console.time(`AI Call for ${symbol}`); // Start AI timing for this stock
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: aiPrompt }],
            max_tokens: 700,
            temperature: 0.7,
        });
        console.timeEnd(`AI Call for ${symbol}`); // End AI timing for this stock

        return aiResponse.choices[0]?.message?.content || `No AI insights available.`;

    } catch (error) {
        console.error(`AI request failed for ${companyName} (${symbol}):`, error);
        return `${companyName}: (${symbol})\n\nNo AI insights available.`;
    }
}
