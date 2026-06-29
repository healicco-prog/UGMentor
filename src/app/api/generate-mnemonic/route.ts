import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { course, subject, topic, content } = body;

    if (!topic || !content) {
      return NextResponse.json({ error: 'Topic and content are required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert medical educator specializing in memory techniques and mnemonics.
The user needs a set of memorable, creative, and medically accurate mnemonics for the following:
Course context: ${course || 'General Medical Science'}
Subject context: ${subject || 'General'}
Topic: "${topic}"
Content to memorize: "${content}"

Please generate exactly 3 different mnemonic options for this content. 
Make sure the mnemonics are catchy, easy to remember, and directly map to the clinical or anatomical facts provided.

Format the output strictly as beautifully formatted Markdown. 
For each mnemonic, clearly show:
1. The mnemonic word or phrase (bolded).
2. A bulleted list showing exactly how each letter/word maps to the facts.
3. A brief 1-sentence tip on why this mnemonic is effective or how to visualize it.

Do NOT output any generic templates, just the 3 distinct mnemonics.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ content: text });

  } catch (error: any) {
    console.error('Error generating mnemonics:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate mnemonics.' }, { status: 500 });
  }
}
