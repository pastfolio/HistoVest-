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

        const startPrice = stockData.quotes[0]?.adjclose || "N/A";
        const endPrice = stockData.quotes[stockData.quotes.length - 1]?.adjclose || "N/A";

        const earnings = await yahooFinance.quoteSummary(stock, { modules: ["earnings"] });
        const eps = earnings.earnings?.earningsChart?.quarterly?.pop()?.actual || "N/A";

        const newsResponse = await axios.get(
            `https://newsapi.org/v2/everything?q=${stock}&apiKey=${newsApiKey}`
        );

        const newsHeadline = newsResponse.data.articles[0]?.title || "No major news.";

        const stockAnalysisPrompt = `
            Provide a **one-paragraph summary** of ${stock} (${startDate} - ${endDate}).
            - Stock price change: $${startPrice} → $${endPrice}
            - Last reported earnings: EPS ${eps}
            - Major news impact: ${newsHeadline}
        `;

        const aiResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [{ role: "user", content: stockAnalysisPrompt }],
                max_tokens: 300,
                temperature: 0.7,
            },
            {
                headers: { Authorization: `Bearer ${openaiApiKey}`, "Content-Type": "application/json" },
            }
        );

        res.status(200).json({ summary: aiResponse.data.choices[0]?.message?.content || "No insights available." });

    } catch (error) {
        console.error("Error in AI summary API:", error);
        res.status(500).json({ error: "Failed to generate AI summary" });
    }
}
