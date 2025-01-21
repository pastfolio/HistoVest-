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

    // Refined prompt for detailed analysis
    const prompt = `
      Please analyze the stock "${stock}" around the date "${date}" and provide a detailed response with at least 4-5 sentences for the following:

      1. Market Expectations: What was expected for this stock at this time?
      2. Actual Outcomes: What happened to the stock during this period?
      3. Surprises or Deviations: Were there unexpected events or deviations?
      4. Causes of Performance: What drove the stock’s performance?
      5. Emotional Insights: What would it have been like to hold this stock over the past 5 years?

      Be detailed, use examples, and provide clear and complete context.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500, // Increased to allow more detailed responses
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
