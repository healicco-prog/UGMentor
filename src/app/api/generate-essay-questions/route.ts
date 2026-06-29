import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { course, subject, topic, qtype, difficulty, count } = body;

    if (!topic || !count) {
      return NextResponse.json({ error: 'Topic and count are required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert medical examiner creating university-level examination questions.
Please generate exactly ${count} essay questions based on the following context:
Course: ${course || 'General Medical Science'}
Subject: ${subject}
Topic: "${topic}"
Question Type: ${qtype}
Difficulty Level: ${difficulty}

Do NOT output any markdown, explanations, or conversational text.
Your response MUST be a valid JSON array of strings, where each string is a fully formed essay question (including the marks distribution if appropriate).
For complex questions (like clinical scenarios or multi-part questions), use explicit newline characters (\\n) in the string to separate the clinical vignette from the actual questions (e.g. "A 52-year-old male presents with...\\n\\n1. Critically analyze... [6 Marks]\\n2. Devise an appropriate... [6 Marks]").
Example format:
[
  "Describe the pathophysiology and clinical features of the condition. [10 Marks]",
  "A 45-year-old patient presents with... Discuss the management protocol. [10 Marks]"
]

Generate exactly ${count} question strings. Ensure the JSON is perfectly valid and parseable.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up potential markdown formatting in the response if the model wrapped it in ```json
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let questionsArray = [];
    try {
      questionsArray = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse questions JSON:', text);
      return NextResponse.json({ error: 'AI returned malformed JSON.' }, { status: 500 });
    }

    // Ensure it's an array
    if (!Array.isArray(questionsArray)) {
      questionsArray = [questionsArray];
    }

    return NextResponse.json({ questions: questionsArray });

  } catch (error: any) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate questions.' }, { status: 500 });
  }
}
