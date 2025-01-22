import yahooFinance from "yahoo-finance2";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { stocks, startDate, endDate } = req.body;

      const startValue = 100000; // Example starting portfolio value
      let endValue = 0;

      const chartDataBefore = [];
      const chartDataAfter = [];

      for (const stock of stocks) {
        // Fetch historical data from Yahoo Finance
        const historicalData = await yahooFinance.historical(stock.symbol, {
          period1: new Date(startDate).toISOString(),
          period2: new Date(endDate).toISOString(),
          interval: "1d",
        });

        if (!historicalData || historicalData.length === 0) {
          console.error(`No data found for ${stock.symbol}`);
          continue;
        }

        // Extract start and end prices
        const startPrice = historicalData[0].close;
        const endPrice = historicalData[historicalData.length - 1].close;

        // Calculate allocation and final value
        const allocation = (stock.percentage / 100) * startValue;
        const shares = allocation / startPrice;
        const finalValue = shares * endPrice;

        // Push data for before allocation chart
        chartDataBefore.push({
          name: stock.symbol,
          value: stock.percentage,
        });

        endValue += finalValue;

        // Push data for after allocation chart
        chartDataAfter.push({
          name: stock.symbol,
          value: ((shares * endPrice) / endValue) * 100,
        });
      }

      // Return calculated results and chart data
      res.status(200).json({
        startValue,
        endValue,
        chartDataBefore,
        chartDataAfter,
      });
    } catch (error) {
      console.error("Error in simulator API:", error);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
