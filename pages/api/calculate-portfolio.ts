import yahooFinance from "yahoo-finance2";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
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
        let debugLogs = [];

        const period1 = new Date(startDate).toISOString().split("T")[0];
        const period2 = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const totalInvestment = parseFloat(investmentAmount);

        console.time("Stock Data & Calculation");

        for (const stock of stocks) {
            try {
                console.log(`Fetching data for ${stock.symbol}`);
                debugLogs.push(`Fetching data for ${stock.symbol}`);

                const stockData = await yahooFinance.chart(stock.symbol, {
                    period1: period1,
                    period2: period2,
                    interval: "1mo",
                });

                if (!stockData?.quotes || stockData.quotes.length < 2) {
                    throw new Error(`No valid stock data found for ${stock.symbol}`);
                }

                const startPrice = stockData.quotes[0]?.adjclose;
                const endPrice = stockData.quotes[stockData.quotes.length - 1]?.adjclose;

                if (!startPrice || !endPrice || isNaN(startPrice) || isNaN(endPrice)) {
                    debugLogs.push(`⚠️ Skipping ${stock.symbol} due to invalid price data`);
                    missingStocks.push(stock.symbol);
                    continue;
                }

                const percentage = parseFloat(stock.percentage) / 100;
                const investment = totalInvestment * percentage;
                const shares = investment / startPrice;

                portfolioValueStart += shares * startPrice;
                portfolioValueEnd += shares * endPrice;

                debugLogs.push(`${stock.symbol} | Start Price: $${startPrice} | End Price: $${endPrice}`);

            } catch (error) {
                debugLogs.push(`Error fetching data for ${stock.symbol}: ${error.message}`);
                missingStocks.push(stock.symbol);
            }
        }

        console.timeEnd("Stock Data & Calculation");

        if (portfolioValueStart === 0) {
            throw new Error("Portfolio start value is zero, check stock data retrieval.");
        }

        const growth = ((portfolioValueEnd - portfolioValueStart) / portfolioValueStart) * 100;

        res.status(200).json({
            startValue: portfolioValueStart.toFixed(2),
            endValue: portfolioValueEnd.toFixed(2),
            growth: growth.toFixed(2),
            missingStocks: missingStocks.length > 0 ? `Some stocks were missing data: ${missingStocks.join(", ")}` : null,
            debug: debugLogs,
        });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: error.message || "Internal server error", debug: error.stack });
    }
}
