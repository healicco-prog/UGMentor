import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { course, subject, topic, criteria } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert medical professor creating a detailed, highly informative seminar presentation.
The user needs a Seminar for the topic: "${topic}".
Course context: ${course || 'General Medical Science'}
Subject context: ${subject || 'General'}
Specific criteria or focus: ${criteria || 'Provide a comprehensive overview'}

You MUST generate ACTUAL medical facts, detailed pathophysiology, real drug names, real guidelines, and concrete clinical data. Do NOT generate generic placeholder templates like "Discuss the clinical manifestations" or "First-line pharmacological therapies". Provide the actual manifestations and the actual therapies for ${topic}.

Format the output EXACTLY using these two section markers (I will parse them):

**===NOTES===**
[Write the detailed Speaker Notes here. Divide into clear sections (Introduction, Main Body, Conclusion). Make the notes extremely detailed. Use **bold text** heavily to highlight the specific words and concepts the speaker should stress during the presentation.]

**===SLIDES===**
[Write the content for exactly 10 Presentation Slides. You MUST follow strict PowerPoint creation guidelines:
1. MAX 3 to 4 bullet points per slide.
2. MAX 6 to 10 words per bullet point.
3. NEVER write full sentences or paragraphs on slides. Use extremely concise, punchy phrases only.
4. Put all detailed explanations and long sentences in the **===NOTES===** section instead.
Each slide must contain actual medical facts. Do NOT use generic placeholders. Use Slide 1 for Title, Slide 2 for Objectives, and Slide 10 for Summary/References.]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const extractSection = (marker: string, nextMarker?: string) => {
      const start = text.indexOf(marker);
      if (start === -1) return '';
      
      const contentStart = start + marker.length;
      const end = nextMarker ? text.indexOf(nextMarker, contentStart) : text.length;
      
      if (end === -1) return text.substring(contentStart).trim();
      return text.substring(contentStart, end).trim();
    };

    const notes = extractSection('**===NOTES===**', '**===SLIDES===**') || 'Failed to generate specific notes.';
    const slides = extractSection('**===SLIDES===**') || 'Failed to generate specific slides.';

    return NextResponse.json({ notes, slides });

  } catch (error: any) {
    console.error('Error generating seminar:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate seminar.' }, { status: 500 });
  }
}
