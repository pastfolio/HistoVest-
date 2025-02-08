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
        let cashAllocation = 0;
        let missingStocks = [];
        let stockSummaries = [];

        const period1 = new Date(startDate).toISOString().split("T")[0];
        const period2 = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

        console.log(`📊 Fetching data for ${stocks.length} stocks...`);

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

                console.log(`${stock.symbol} Prices: Start - $${startPrice}, End - $${endPrice}`);

                const percentage = parseFloat(stock.percentage) / 100;
                const investment = 100000 * percentage;
                const shares = investment / startPrice;

                portfolioValueStart += shares * startPrice;
                portfolioValueEnd += shares * endPrice;

                // Add AI-generated stock analysis
                const stockAnalysis = await getStockAnalysis(stock.symbol, startDate, endDate);
                stockSummaries.push(stockAnalysis);

            } catch (error) {
                console.error(`❌ Error fetching data for ${stock.symbol}:`, error);
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
        console.log(`✅ Final Portfolio Value: $${portfolioValueEnd.toFixed(2)}, Growth: ${growth.toFixed(2)}%`);

        // 🔥 AI Market Overview
        const macroSummary = await getMacroAnalysis(startDate, endDate);

        res.status(200).json({
            startValue: portfolioValueStart.toFixed(2),
            endValue: portfolioValueEnd.toFixed(2),
            growth: growth.toFixed(2),
            summary: `# Market Overview\n\n${macroSummary}\n\n# Company Insights\n\n${stockSummaries.join("\n\n")}`,
            missingStocks: missingStocks.length > 0 ? `Some stocks were missing data and were treated as cash: ${missingStocks.join(", ")}` : null,
        });

    } catch (error) {
        console.error("❌ Error in simulator API:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// ✅ **Updated AI Analysis for Stocks**
async function getStockAnalysis(symbol, startDate, endDate) {
    try {
        const acquisitions = await getAcquisitionDetails(symbol, startDate, endDate);

        const aiPrompt = `
        Analyze ${symbol}'s stock performance from ${startDate} to ${endDate}. Provide a clear, natural-flowing summary covering:
        - Earnings performance, including revenue and net income changes, and whether results beat or missed expectations.
        - Major company developments, including key product launches, business expansions, or leadership changes.
        - Market sentiment, including analyst upgrades/downgrades and hedge fund movements.
        - Insider transactions and how they reflect confidence or uncertainty in the stock.
        - Strategic acquisitions during this time, if applicable: ${acquisitions || "None reported"}.
        - Dividend payouts, if any, and their impact on investor sentiment.
        - Stock performance, including its price change and how it compared to competitors and the broader market.
        - Key risks and challenges that affected the company during this period.

        **Write the response in clear, structured paragraphs, ensuring smooth transitions between topics. Avoid bullet points.**
        `;

        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: aiPrompt }],
            max_tokens: 1000,
            temperature: 0.7,
        });

        return aiResponse.choices[0]?.message?.content || `No insights available for ${symbol}`;
    } catch (error) {
        console.error(`❌ Error generating AI summary for ${symbol}:`, error);
        return `No AI insights available for ${symbol}`;
    }
}

// ✅ **Filter Acquisitions by Date**
async function getAcquisitionDetails(symbol, startDate, endDate) {
    try {
        const acquisitionPrompt = `List only significant acquisitions or mergers that ${symbol} completed between ${startDate} and ${endDate}. If none, return an empty string.`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: acquisitionPrompt }],
            max_tokens: 500,
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content || "";
        return content ? `During this period, ${symbol} acquired ${content}.` : "";
    } catch (error) {
        console.error(`❌ Error retrieving acquisition data for ${symbol}:`, error);
        return "";
    }
}

// ✅ **AI Market Overview**
async function getMacroAnalysis(startDate, endDate) {
    try {
        const macroPrompt = `
            Provide a structured market analysis for the period from ${startDate} to ${endDate}. Cover:
            - Performance of major indices (S&P 500, Dow, Nasdaq) and key stock market trends.
            - Monetary and fiscal policies, including interest rates and economic stimulus measures.
            - Global events that shaped market movements.
            - Sector performance, highlighting industries that thrived or struggled.

            **Write in clear, concise paragraphs. Avoid bullet points.**
        `;

        const macroResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: macroPrompt }],
            max_tokens: 1000,
            temperature: 0.7,
        });

        return macroResponse.choices[0]?.message?.content || "No macroeconomic insights available.";
    } catch (error) {
        console.error("❌ Error generating macroeconomic insights:", error);
        return "No macroeconomic insights available.";
    }
}
