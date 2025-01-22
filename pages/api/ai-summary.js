export default async function handler(req, res) {
    if (req.method === "POST") {
      const { startValue, endValue, stocks, startDate, endDate } = req.body;
  
      try {
        const growth = ((endValue - startValue) / startValue) * 100;
  
        let stockAnalysis = "";
  
        for (const stock of stocks) {
          stockAnalysis += `- ${stock.symbol.toUpperCase()}:\n`;
  
          // Add placeholder for trends or mock insights
          if (stock.symbol.toLowerCase() === "rig") {
            stockAnalysis += `  - ${stock.symbol.toUpperCase()} performed relatively well during this period due to increasing oil prices and geopolitical factors affecting energy markets. However, it faced volatility due to environmental policy changes and global supply issues.\n`;
          } else if (stock.symbol.toLowerCase() === "msft") {
            stockAnalysis += `  - ${stock.symbol.toUpperCase()} saw steady growth due to the expansion of its cloud computing services and dominance in the software market. Market trends indicated a significant focus on tech growth during this period.\n`;
          } else {
            stockAnalysis += `  - ${stock.symbol.toUpperCase()} performance was affected by broader market trends and specific industry changes. Research indicates potential missed opportunities in adjacent sectors.\n`;
          }
        }
  
        const feedback = `
  Your portfolio grew by ${growth.toFixed(2)}% over the selected period. Here’s a detailed breakdown:
  
  - The portfolio started with ${startValue.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}.
  - It ended with ${endValue.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}.
    
  Performance Analysis:
  ${stockAnalysis}
  
  Market Trends and Insights:
  - During this period (${startDate} to ${endDate}), significant trends included:
    - ${growth > 0 ? "An overall bull market driven by strong economic indicators." : "Market volatility influenced by geopolitical events and economic downturns."}
    - Sector performance shows ${stocks.length > 2 ? "diversification benefited the portfolio overall." : "limited diversification might have left opportunities unexplored."}
  
  Recommendations:
  - Consider reviewing allocation percentages to capitalize on sectors like technology, energy, or emerging markets.
  - Evaluate underperforming stocks and potential market opportunities to optimize portfolio growth further.
  `;
  
        res.status(200).json({ summary: feedback });
      } catch (error) {
        console.error("Error generating AI summary:", error);
        res.status(500).json({ error: "Failed to generate AI summary" });
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  