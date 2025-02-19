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

        let portfolioValueEnd = 0;
        let debugLogs = [];

        const period1 = new Date(startDate).toISOString().split("T")[0];
        const period2 = new Date(endDate).toISOString().split("T")[0];
        const totalInvestment = parseFloat(investmentAmount);

        console.log(`🔍 Fetching stock data from ${period1} to ${period2}`);
        console.log(`Investment Amount: $${investmentAmount}`);
        console.log(`Total Investment: $${totalInvestment.toFixed(2)}`);

        console.time("Stock Data & Calculation");

        for (const stock of stocks) {
            try {
                console.log(`📊 Fetching data for ${stock.symbol}...`);
                debugLogs.push(`Fetching data for ${stock.symbol}`);

                const stockData = await yahooFinance.chart(stock.symbol, {
                    period1: period1,
                    period2: period2,
                    interval: "1mo",
                });

                if (!stockData || !stockData.quotes || stockData.quotes.length < 2) {
                    console.warn(`⚠️ No valid data for ${stock.symbol}`);
                    debugLogs.push(`⚠️ No valid data for ${stock.symbol}`);
                    continue;
                }

                let startPrice = stockData.quotes[0]?.adjclose;
                let endPrice = stockData.quotes[stockData.quotes.length - 1]?.adjclose;

                if (!startPrice || !endPrice || isNaN(startPrice) || isNaN(endPrice)) {
                    console.warn(`⚠️ Skipping ${stock.symbol} due to invalid price data`);
                    debugLogs.push(`⚠️ Skipping ${stock.symbol} due to invalid price data`);
                    continue;
                }

                console.log(`📈 ${stock.symbol} Adjusted Prices: Start: $${startPrice.toFixed(2)}, End: $${endPrice.toFixed(2)}`);

                // Calculate shares and final value using split-adjusted prices
                const sharesBought = totalInvestment / startPrice; 
                const finalValue = sharesBought * endPrice;

                console.log(`Calculation for ${stock.symbol}:`);
                console.log(`  - Shares Bought: Total Investment / Start Price = ${totalInvestment.toFixed(2)} / ${startPrice.toFixed(2)} = ${sharesBought.toFixed(2)}`);
                console.log(`  - Final Value: Shares Bought * End Price = ${sharesBought.toFixed(2)} * ${endPrice.toFixed(2)} = $${finalValue.toFixed(2)}`);

                portfolioValueEnd += finalValue;

                debugLogs.push(
                    `${stock.symbol} | Adjusted Start: $${startPrice.toFixed(2)} | Adjusted End: $${endPrice.toFixed(2)} | Shares Bought: ${sharesBought.toFixed(2)} | Final Value: $${finalValue.toFixed(2)}`
                );

            } catch (error) {
                console.error(`❌ Error fetching ${stock.symbol}: ${error.message}`);
                debugLogs.push(`Error fetching ${stock.symbol}: ${error.message}`);
            }
        }

        console.timeEnd("Stock Data & Calculation");

        if (portfolioValueEnd === 0 || isNaN(portfolioValueEnd)) {
            throw new Error("Portfolio value calculation failed, possible missing stock data.");
        }

        const growth = ((portfolioValueEnd - totalInvestment) / totalInvestment) * 100;

        console.log(`✅ Final Portfolio Value: $${portfolioValueEnd.toFixed(2)} (Growth: ${growth.toFixed(2)}%)`);
        console.log(`  - Total Investment: $${totalInvestment.toFixed(2)}`);
        console.log(`  - End Value: $${portfolioValueEnd.toFixed(2)}`);
        console.log(`  - Growth Calculation: ((${portfolioValueEnd.toFixed(2)} - ${totalInvestment.toFixed(2)}) / ${totalInvestment.toFixed(2)}) * 100 = ${growth.toFixed(2)}%`);

        res.status(200).json({
            endValue: portfolioValueEnd.toFixed(2),
            growth: growth.toFixed(2),
            debug: debugLogs,
        });

    } catch (error) {
        console.error("🚨 API Error:", error.message);
        res.status(500).json({ error: error.message || "Internal server error", debug: error.stack });
    }
}