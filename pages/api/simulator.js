import yahooFinance from "yahoo-finance2";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const { stocks, startDate, endDate, investmentAmount } = req.body;
        let portfolioValueStart = 0;
        let portfolioValueEnd = 0;
        let cashAllocation = 0;
        let missingStocks = [];
        let stockSummaries = [];

        const period1 = new Date(startDate).toISOString().split("T")[0];
        const period2 = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const totalInvestment = parseFloat(investmentAmount);
        if (isNaN(totalInvestment) || totalInvestment <= 0) {
            throw new Error("Invalid investment amount. Please enter a positive number.");
        }

        console.log(`📊 Fetching data for ${stocks.length} stocks with investment amount: $${totalInvestment}...`);

        // Sort stocks by position size (largest to smallest)
        const sortedStocks = stocks.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

        for (const stock of sortedStocks) {
            try {
                // 🔍 Fetch full company name (prevents AI misinterpretation)
                const stockInfo = await yahooFinance.quoteSummary(stock.symbol, { modules: ["assetProfile"] });
                const companyName = stockInfo?.assetProfile?.longBusinessSummary ? stockInfo.assetProfile.longBusinessSummary : stock.symbol;

                const stockData = await yahooFinance.chart(stock.symbol, {
                    period1: period1,
                    period2: period2,
                    interval: "1mo",
                });

                if (!stockData.quotes || stockData.quotes.length < 2) {
                    throw new Error(`No valid stock data found for ${companyName} (${stock.symbol})`);
                }

                const startPrice = stockData.quotes[0].adjclose;
                const endPrice = stockData.quotes[stockData.quotes.length - 1].adjclose;
                const priceChange = ((endPrice - startPrice) / startPrice) * 100;

                console.log(`${companyName} (${stock.symbol}) Prices: Start - $${startPrice}, End - $${endPrice}, Change - ${priceChange.toFixed(2)}%`);

                const percentage = parseFloat(stock.percentage) / 100;
                const investment = totalInvestment * percentage;
                const shares = investment / startPrice;

                portfolioValueStart += shares * startPrice;
                portfolioValueEnd += shares * endPrice;

                // AI-generated stock analysis (weighted)
                const stockAnalysis = await getStockAnalysis(companyName, stock.symbol, stock.percentage, startDate, endDate, priceChange);
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

        let cashValueStart = (cashAllocation / 100) * totalInvestment;
        let cashValueEnd = cashValueStart;

        portfolioValueStart += cashValueStart;
        portfolioValueEnd += cashValueEnd;

        const growth = ((portfolioValueEnd - portfolioValueStart) / portfolioValueStart) * 100;
        console.log(`✅ Final Portfolio Value: $${portfolioValueEnd.toFixed(2)}, Growth: ${growth.toFixed(2)}%`);

        // AI Market Overview with Investor Sentiment
        const macroSummary = await getMacroAnalysis(startDate, endDate);

        console.log("📢 AI Stock Summaries:", stockSummaries);

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

// ✅ **Refined AI Stock Analysis**
async function getStockAnalysis(companyName, symbol, allocationPercentage, startDate, endDate, priceChange) {
    try {
        let aiPrompt;

        if (allocationPercentage >= 15) {
            aiPrompt = `
                Analyze **${companyName} (${symbol})** from **${startDate} to ${endDate}**.

                - Stock price changed by **${priceChange.toFixed(2)}%**.
                - What major events influenced this price movement?
                - Key earnings reports, product launches, acquisitions, or strategic decisions.
                - How did investors and analysts react? Were there significant buy/sell movements?

                **Write in structured, professional paragraphs.**
            `;
        } else if (allocationPercentage >= 5) {
            aiPrompt = `
                Provide a **concise** analysis of **${companyName} (${symbol})** from **${startDate} to ${endDate}**.
                - Price change: **${priceChange.toFixed(2)}%**.
                - Key financial events, industry impact, and investor sentiment.

                **Limit response to 3-4 sentences.**
            `;
        } else {
            aiPrompt = `
                Provide a **brief** summary of **${companyName} (${symbol})** from **${startDate} to ${endDate}**.
                - Stock price changed by **${priceChange.toFixed(2)}%**.
                - Mention **one** key event or factor influencing this movement.

                **Limit to 1-2 sentences.**
            `;
        }

        console.log(`🧠 Requesting AI summary for ${companyName} (${symbol})...`);

        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: aiPrompt }],
            max_tokens: 500,
            temperature: 0.7,
        });

        return aiResponse.choices[0]?.message?.content || `No AI insights available for ${companyName} (${symbol})`;

    } catch (error) {
        console.error(`❌ AI request failed for ${companyName} (${symbol}):`, error);
        return `No AI insights available for ${companyName} (${symbol})`;
    }
}

// ✅ **Enhanced AI Market Overview**
async function getMacroAnalysis(startDate, endDate) {
    try {
        const macroPrompt = `
            Provide a detailed stock market overview from **${startDate} to ${endDate}**.
            - How did major indices (S&P 500, Dow, Nasdaq) perform?
            - What macroeconomic trends (interest rates, inflation, monetary policy) affected investors?
            - What were investors prioritizing? (Tech stocks? IPOs? Safe-haven assets?)
            - How did global events impact risk appetite?

            **Write a structured, professional market overview.**
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
