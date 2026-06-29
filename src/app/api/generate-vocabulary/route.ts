import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { course, subject, count } = body;

    if (!subject || !count) {
      return NextResponse.json({ error: 'Subject and count are required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert medical professor creating a high-yield vocabulary list for students.
Please generate exactly ${count} highly relevant and advanced vocabulary words for the following context:
Course: ${course || 'General Medical Science'}
Subject: ${subject}

Do NOT output any markdown, explanations, or conversational text.
Your response MUST be a valid JSON array of objects, strictly following this format:
[
  { "word": "MedicalTerm1", "def": "A clear, concise, and clinically accurate definition of the term." },
  { "word": "MedicalTerm2", "def": "Definition here." }
]

Generate exactly ${count} objects. Ensure the JSON is perfectly valid and parseable.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up potential markdown formatting in the response if the model wrapped it in ```json
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let wordsArray = [];
    try {
      wordsArray = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse vocabulary JSON:', text);
      return NextResponse.json({ error: 'AI returned malformed JSON.' }, { status: 500 });
    }

    // Ensure it's an array
    if (!Array.isArray(wordsArray)) {
      wordsArray = [wordsArray];
    }

    return NextResponse.json({ words: wordsArray });

  } catch (error: any) {
    console.error('Error generating vocabulary:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate vocabulary.' }, { status: 500 });
  }
}
