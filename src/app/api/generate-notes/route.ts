import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { course, subject, topic, noteType } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const wordCount = noteType === 'detailed' ? '1500' : '750';
    const detailLevel = noteType === 'detailed' 
        ? 'extremely detailed, full explanations, clinical correlations, and potential exam questions.' 
        : 'brief, concise, bullet points for quick revision.';

    const prompt = `You are an expert academic medical professor creating study notes.
The user needs a ${noteType === 'detailed' ? 'Detailed Note' : 'Brief Summary'} for the topic: "${topic}".
Course context: ${course || 'General Medical Science'}
Subject context: ${subject || 'General'}

You MUST generate ACTUAL medical facts, detailed pathophysiology, real drug names, real guidelines, and concrete clinical data. Do NOT generate generic placeholder templates like "Discuss the clinical manifestations" or "First-line pharmacological therapies". Provide the actual manifestations and the actual therapies for ${topic}.

The notes should be comprehensive, approximately ${wordCount} words, and formatted in beautiful Markdown.
IMPORTANT: Do NOT use LaTeX, MathJax, or $$ symbols for chemical equations, pathways, or math. Use standard text and arrows (e.g. A -> B) instead.
Include sections like Introduction, Pathophysiology, Clinical Features, Investigations, Management, and Complications where appropriate. Use tables if it helps organize information.
Style requirements: ${detailLevel}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ content: text });

  } catch (error: any) {
    console.error('Error generating notes:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate notes.' }, { status: 500 });
  }
}
