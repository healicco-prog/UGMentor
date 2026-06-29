import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { course, subject, topic, question } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert medical professor and examiner grading university-level exams.
The student has been asked the following question:
"${question}"

Context:
Course: ${course || 'General Medical Science'}
Subject: ${subject}
Topic: ${topic}

Please generate a comprehensive, highly accurate model answer to this question. 
Your answer MUST be formatted in beautiful Markdown (using headings, bold text, bullet points, and tables where appropriate).
IMPORTANT: Do NOT use LaTeX, MathJax, or $$ symbols for chemical equations, pathways, or math. Use standard text and arrows (e.g. A -> B) instead.
Structure the answer clearly (e.g., Introduction, Pathophysiology, Clinical Features, Investigations, Management) based on what the question asks.
Include a brief "Examiner's Note" at the end highlighting the most critical point a student must mention to score full marks.

Do not include conversational filler, just output the markdown answer.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ answer: text });

  } catch (error: any) {
    console.error('Error generating essay answer:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate answer.' }, { status: 500 });
  }
}
