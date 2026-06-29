import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { course, subject, topic } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert medical educator creating high-yield revision notes for healthcare students.
Your task is to generate a highly detailed, fact-based **Topic Summary** for:

* **Course**: ${course || 'MBBS'}
* **Subject**: ${subject || 'General'}
* **Topic**: ${topic}

You MUST generate ACTUAL medical facts, detailed pathophysiology, real drug names, real guidelines, and concrete clinical data regarding ${topic}.
Do NOT generate generic placeholder templates like "A brief 2-3 sentence overview" or "Fundamental mechanism 1". Provide the actual data.

Use the following Markdown structure:

## 🎯 Core Concept
[Provide a clear, detailed 3-4 sentence definition and primary significance in ${subject}]

## 🔑 Key Principles & Pathophysiology
[List the actual fundamental mechanisms, etiology, and pathophysiological steps of ${topic}. Be highly specific.]

## 📊 Classifications & Clinical Features
[List the actual types, classifications, and primary clinical manifestations/signs/symptoms of ${topic}.]

## 🛠️ Management & Investigations
[List the actual first-line investigations and pharmacological/surgical management protocols for ${topic}.]

## 📝 Important Exam Points (High-Yield)
[Provide 3-5 high-yield facts, common pitfalls, or classic buzzwords that appear in exams regarding ${topic}.]

Format strictly in clean Markdown using bold text for key terms.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ summary: text });

  } catch (error: any) {
    console.error('Error generating topic summary:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate summary.' }, { status: 500 });
  }
}
