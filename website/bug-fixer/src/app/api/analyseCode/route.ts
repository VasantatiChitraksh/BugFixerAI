import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = 'AIzaSyDlCGWlX5o7I9nDF8kEtqORgfQQqp0Fwbo';

if (!GEMINI_API_KEY) {
  throw new Error("Missing API Key. Set GEMINI_API_KEY in your environment variables.");
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const prompt = `Analyze the following code for errors, best practices, and optimizations. Format the response in simple, structured sentences without Markdown symbols:\n\n${code}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const contentObj = response.data.candidates?.[0]?.content;
    let extractedText = contentObj?.parts?.map((p: any) => p.text).join(" ") || null;

    // **Cleaning up Markdown Symbols (if present)**
    extractedText = extractedText
      ?.replace(/[*#`]/g, "") // Remove *, #, and ` symbols
      .replace(/\n\s*\n/g, "\n") // Remove excessive new lines
      .trim();

    return NextResponse.json({ analysis: extractedText });
  } catch (error) {
    console.error("Error analyzing code:", error);
    return NextResponse.json({ error: "Failed to analyze code" }, { status: 500 });
  }
}