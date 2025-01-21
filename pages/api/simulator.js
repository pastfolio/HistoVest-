import yahooFinance from "yahoo-finance2";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { stocks, startDate, endDate } = req.body;

      // Fetch historical prices for each stock
      const stockData = await Promise.all(
        stocks.map(async (stock) => {
          const data = await yahooFinance.historical(stock.symbol, {
            period1: new Date(startDate).toISOString(),
            period2: new Date(endDate).toISOString(),
          });
          return {
            symbol: stock.symbol,
            prices: data,
          };
        })
      );

      // Calculate portfolio start and end values
      let portfolioValueStart = 0;
      let portfolioValueEnd = 0;
      const shares = {};

      stocks.forEach((stock) => {
        const stockPrices = stockData.find((s) => s.symbol === stock.symbol)?.prices;
        if (stockPrices?.length) {
          const startPrice = stockPrices[0]?.close; // First date price
          const endPrice = stockPrices[stockPrices.length - 1]?.close; // Last date price
          const percentage = parseFloat(stock.percentage) / 100;

          const investment = 100000 * percentage; // Assume $100k initial portfolio
          shares[stock.symbol] = investment / startPrice;

          portfolioValueStart += shares[stock.symbol] * startPrice;
          portfolioValueEnd += shares[stock.symbol] * endPrice;
        }
      });

      // Generate AI summary (mocked for now)
      const summary = `
        From ${startDate} to ${endDate}, your portfolio started with $${portfolioValueStart
          .toFixed(2)
          .toLocaleString()} and ended with $${portfolioValueEnd
          .toFixed(2)
          .toLocaleString()}. Key changes were influenced by real stock price fluctuations.
      `;

      res.status(200).json({
        startValue: portfolioValueStart,
        endValue: portfolioValueEnd,
        shares,
        summary,
      });
    } catch (error) {
      console.error("Error in simulator API:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
