import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { stock, date } = await req.json();

    // Validate input
    if (!stock || !date) {
      return NextResponse.json(
        { error: "Stock and date are required." },
        { status: 400 }
      );
    }

    // Refined prompt for broader historical analysis
    const prompt = `
      Provide a detailed analysis of the stock "${stock}" over the one-year period leading up to "${date}". The response must include:

      1. Earnings Performance  
         - How did the company perform in its quarterly earnings over the past year?  
         - Were revenue and earnings per share (EPS) generally above or below analyst expectations?  
         - Were there any changes in forward guidance that impacted the stock price?  

      2. Major Business Developments  
         - Were any significant products, services, or strategic initiatives launched?  
         - Did the company enter new markets, face major regulatory challenges, or announce large acquisitions?  
         - Were there any major supply chain issues or external factors that affected operations?  

      3. Market and Investor Reaction  
         - How did the stock price trend over the year? Identify major rallies, corrections, or prolonged periods of volatility.  
         - What events triggered the most significant stock movements, and what was the market’s reaction?  
         - Were there major institutional investors increasing or reducing their stakes?  

      4. Competitive and Industry Factors  
         - How did the company perform relative to its industry and direct competitors?  
         - Were there any major competitor launches or innovations that influenced investor sentiment?  
         - Were there macroeconomic factors such as inflation, interest rates, or geopolitical events that affected the stock?  

      5. Investor Sentiment and Key Takeaways  
         - What was the general sentiment among investors, analysts, and the financial media?  
         - Were there any major analyst upgrades or downgrades, and how did they impact the stock?  
         - If someone was holding this stock over the past year, what challenges and opportunities would they have experienced?  

      The response should provide specific details and context, including earnings numbers, stock price reactions, and any external events that influenced performance.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000, // Increased for richer analysis
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    // Log token usage for debugging
    console.log("Token Usage:", response.usage);

    if (!summary) {
      return NextResponse.json(
        { error: "Failed to generate a valid summary." },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error with OpenAI API:", error.message);
    if (error.response) {
      console.error("OpenAI API Response Error:", error.response.data);
    }
    return NextResponse.json(
      { error: "Failed to generate summary. Please try again later." },
      { status: 500 }
    );
  }
}
