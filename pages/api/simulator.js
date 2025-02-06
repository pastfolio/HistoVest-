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
        let missingStocks = [];
        let stockSummaries = [];

        console.log(`Fetching data from Yahoo Finance for ${stocks.length} stocks...`);

        const stockDataPromises = stocks.map(async (stock) => {
            try {
                console.log(`Fetching data for ${stock.symbol}...`);
                const stockData = await yahooFinance.chart(stock.symbol, { 
                    period1: startDate, 
                    period2: endDate, 
                    interval: "1d" 
                });

                if (!stockData.quotes || stockData.quotes.length < 2) {
                    throw new Error(`No valid stock data for ${stock.symbol}`);
                }

                let startPrice = findClosestPrice(stockData.quotes, startDate);
                let endPrice = findClosestPrice(stockData.quotes, endDate);

                const stockMeta = await yahooFinance.quoteSummary(stock.symbol, { modules: ["price"] });
                const stockCurrency = stockMeta.price.currency || "USD"; 

                if (startPrice && endPrice) {
                    const convertedStartPrice = await convertCurrency(startPrice, stockCurrency, "USD", startDate);
                    const convertedEndPrice = await convertCurrency(endPrice, stockCurrency, "USD", endDate);

                    startPrice = convertedStartPrice < 0.10 ? parseFloat(convertedStartPrice.toFixed(5)) : parseFloat(convertedStartPrice.toFixed(2));
                    endPrice = convertedEndPrice < 0.10 ? parseFloat(convertedEndPrice.toFixed(5)) : parseFloat(convertedEndPrice.toFixed(2));

                    console.log(`Converted Prices (${stock.symbol}): ${startPrice} → ${endPrice} (USD)`);

                    if (startPrice < 0 || endPrice < 0) {
                        console.warn(`Skipping ${stock.symbol} due to invalid negative price.`);
                        missingStocks.push(stock.symbol);
                        return null;
                    }

                    const investment = (parseFloat(stock.percentage) / 100) * 100000;
                    const shares = investment / startPrice;

                    portfolioValueStart += shares * startPrice;
                    portfolioValueEnd += shares * endPrice;

                    return { 
                        symbol: stock.symbol, 
                        startPrice, 
                        endPrice, 
                        originalCurrency: stockCurrency 
                    };
                } else {
                    throw new Error(`Missing valid price data for ${stock.symbol}`);
                }
            } catch (error) {
                console.error(`Error fetching data for ${stock.symbol}:`, error);
                missingStocks.push(stock.symbol);
                return null;
            }
        });

        const resolvedStockData = await Promise.all(stockDataPromises);
        const validStockData = resolvedStockData.filter(stock => stock !== null);

        if (validStockData.length === 0) {
            throw new Error("No valid stock data retrieved.");
        }

        const growth = ((portfolioValueEnd - portfolioValueStart) / portfolioValueStart) * 100;

        const macroSummary = await getMacroAnalysis(startDate, endDate);

        const stockSummaryPromises = validStockData.map(stock =>
            getStockAnalysis(stock.symbol, stock.startPrice, stock.endPrice, startDate, endDate, stock.originalCurrency)
        );

        const stockSummariesAI = await Promise.all(stockSummaryPromises);

        res.status(200).json({
            startValue: portfolioValueStart.toFixed(2),
            endValue: portfolioValueEnd.toFixed(2),
            growth: growth.toFixed(2),
            summary: `# Macroeconomic Overview\n\n${macroSummary}\n\n## Portfolio Summary & Review\n\n${stockSummariesAI.join("\n\n")}`,
            missingStocks: missingStocks.length > 0 ? `Some stocks were missing data: ${missingStocks.join(", ")}` : null,
        });

    } catch (error) {
        console.error("Error in portfolio analysis API:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

function findClosestPrice(quotes, targetDate) {
    const targetTimestamp = new Date(targetDate).getTime();
    let closestPrice = null;
    let smallestDiff = Infinity;

    for (const quote of quotes) {
        const quoteTimestamp = new Date(quote.date).getTime();
        const diff = Math.abs(quoteTimestamp - targetTimestamp);

        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestPrice = quote.adjclose;
        }
    }
    return closestPrice;
}

async function convertCurrency(amount, fromCurrency, toCurrency, date) {
    if (fromCurrency === toCurrency) return amount;

    try {
        console.log(`Fetching exchange rate for ${fromCurrency} to ${toCurrency} on ${date}...`);
        const forexData = await yahooFinance.quote(`${fromCurrency}${toCurrency}=X`);
        const exchangeRate = forexData.regularMarketPrice;
        return amount * exchangeRate;
    } catch (error) {
        console.error(`Currency conversion error:`, error);
        return amount; 
    }
}

// ✅ FIXED: Missing `getMacroAnalysis` function
async function getMacroAnalysis(startDate, endDate) {
    try {
        const macroPrompt = `
            Provide a **one-paragraph summary** of the global economic conditions between ${startDate} and ${endDate}.
            Cover major stock market movements, interest rates, inflation, economic policies, and global trade events.
            Do NOT include speculative information—just focus on **actual trends** from this period.
        `;

        const macroResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: macroPrompt }],
            max_tokens: 400,
            temperature: 0.7,
        });

        return macroResponse.choices[0]?.message?.content || "No macroeconomic insights available.";
    } catch (error) {
        console.error("Error generating macroeconomic insights:", error);
        return "No macroeconomic insights available.";
    }
}

// ✅ FIXED: Missing `getStockAnalysis` function
async function getStockAnalysis(symbol, startPrice, endPrice, startDate, endDate, originalCurrency) {
    try {
        const aiPrompt = `
            Provide a **single paragraph summary** of ${symbol}'s stock performance from ${startDate} to ${endDate}.
            - Stock price in ${originalCurrency}: ${startPrice} → ${endPrice}
            - Converted to USD.
            - Major earnings/events in this period.
        `;

        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: aiPrompt }],
            max_tokens: 300,
            temperature: 0.7,
        });

        return `- **${symbol} (${originalCurrency})**: ${aiResponse.choices[0]?.message?.content || "No insights available."}`;
    } catch (error) {
        console.error(`Error generating AI summary for ${symbol}:`, error);
        return `- **${symbol}**: No AI insights available.`;
    }
}
