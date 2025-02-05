import axios from "axios";
import yahooFinance from "yahoo-finance2";

const openaiApiKey = process.env.OPENAI_API_KEY;
const newsApiKey = process.env.NEWS_API_KEY;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const { stock, startDate, endDate } = req.body;

        const stockData = await yahooFinance.chart(stock, {
            period1: startDate,
            period2: endDate,
            interval: "1d",
        });

        const startPrice = stockData.quotes[0].adjclose;
        const endPrice = stockData.quotes[stockData.quotes.length - 1].adjclose;

        const earnings = await yahooFinance.quoteSummary(stock, { modules: ["earnings"] });
        const eps = earnings.earnings?.earningsChart?.quarterly?.pop()?.actual || "N/A";

        const newsResponse = await axios.get(
            `https://newsapi.org/v2/everything?q=${stock}&apiKey=${newsApiKey}`
        );

        const stockAnalysisPrompt = `
            **Stock: ${stock} (${startDate} - ${endDate})**  
            - Price change: $${startPrice} → $${endPrice}  
            - Last Earnings: EPS ${eps}  
            - News Impacting Price: ${newsResponse.data.articles[0]?.title || "N/A"}  
        `;

        res.status(200).json({ summary: stockAnalysisPrompt });

    } catch (error) {
        console.error("Error in AI summary API:", error);
        res.status(500).json({ error: "Failed to generate AI summary" });
    }
}
