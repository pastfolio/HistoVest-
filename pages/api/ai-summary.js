export default async function handler(req, res) {
    if (req.method === "POST") {
      const { startValue, endValue, stocks, startDate, endDate } = req.body;
  
      try {
        const growth = ((endValue - startValue) / startValue) * 100;
  
        let stockAnalysis = "";
  
        for (const stock of stocks) {
          const stockName = getStockName(stock.symbol); // Function to get stock name
          stockAnalysis += `- **${stock.symbol.toUpperCase()}** (${stockName}):\n`;
  
          // Add placeholder for trends or mock insights
          if (stock.symbol.toLowerCase() === "rig") {
            stockAnalysis += `  - RIG performed relatively well during this period due to increasing oil prices and geopolitical factors affecting energy markets. However, it faced volatility due to environmental policy changes and global supply issues.\n`;
          } else if (stock.symbol.toLowerCase() === "nvda") {
            stockAnalysis += `  - NVDA experienced significant growth driven by advancements in AI technology and increased demand for GPUs in gaming and data centers.\n`;
          } else {
            stockAnalysis += `  - ${stock.symbol.toUpperCase()} performance was affected by broader market trends and specific industry changes. Research indicates potential missed opportunities in adjacent sectors.\n`;
          }
        }
  
        const feedback = `
  **Your portfolio grew by ${growth.toFixed(2)}% over the selected period.** Here’s a detailed breakdown:
    
  - The portfolio started with **${startValue.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}**.
  - It ended with **${endValue.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}**.
      
  **Performance Analysis:**
  ${stockAnalysis}
  
  **Market Trends and Insights:**
  - During this period (**${startDate}** to **${endDate}**), significant trends included:
    - ${
      growth > 0
        ? "An overall bull market driven by strong economic indicators."
        : "Market volatility influenced by geopolitical events and economic downturns."
    }
    - ${
      stocks.length > 2
        ? "Sector performance shows diversification benefited the portfolio overall."
        : "Limited diversification might have left opportunities unexplored."
    }
  
  **Recommendations:**
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
  
  // Function to map stock tickers to their full names
  function getStockName(ticker) {
    const stockNames = {
      rig: "Transocean Ltd.",
      val: "Valaris Limited",
      tdw: "Tidewater Inc.",
      nvda: "NVIDIA Corporation",
      // Add other mappings as needed
    };
  
    return stockNames[ticker.toLowerCase()] || "Unknown Company";
  }
  