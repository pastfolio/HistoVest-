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

    // Create the prompt for GPT-3.5
    const prompt = `
      Provide a brief summary of the financial and economic context for the stock "${stock}" 
      around the date "${date}". Include significant events, trends, and news that may have influenced it.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    // Extract and return the summary
    const summary = response.choices[0]?.message?.content?.trim();
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error with OpenAI API:", error.message);
    return NextResponse.json(
      { error: "Failed to generate summary." },
      { status: 500 }
    );
  }
}
