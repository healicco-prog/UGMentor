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
    const { condition, language, customNotes } = body;

    if (!condition) {
      return NextResponse.json({ error: 'Condition is required.' }, { status: 400 });
    }

    // Using gemini-flash-latest to match what was working in interpretation lab
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an empathetic, expert medical professional creating a patient education sheet. 
The patient's condition is: "${condition}".
You MUST generate the entire response in the following language: ${language || 'English'}.
Make the language simple, jargon-free, and easy for a layperson to understand. Use a supportive and encouraging tone.

${customNotes ? `Additional specific notes to incorporate into the advice: "${customNotes}"` : ''}

Please format your response EXACTLY using these 5 section markers (translate the content, but KEEP THE MARKERS IN ENGLISH EXACTLY AS WRITTEN so I can parse them):

**OVERVIEW:**
[Provide a clear, simple explanation of what the condition is and why it happens.]

**LIFESTYLE:**
[Provide practical lifestyle, diet, and exercise advice.]

**MEDICATIONS:**
[Provide general guidance on taking medications for this condition, adherence, and common side effects.]

**WARNING:**
[List critical red-flag warning signs that require immediate emergency medical attention.]

**FOLLOWUP:**
[Provide a typical follow-up schedule and what to monitor at home.]

Do not include any other text outside these sections. Keep it concise, formatted with bullet points where appropriate (use standard "-" or bullet characters, avoiding markdown asterisks for bullets).`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the sections safely
    const extractSection = (marker: string, nextMarker?: string) => {
      const start = text.indexOf(marker);
      if (start === -1) return '';
      
      const contentStart = start + marker.length;
      const end = nextMarker ? text.indexOf(nextMarker, contentStart) : text.length;
      
      if (end === -1) return text.substring(contentStart).trim();
      return text.substring(contentStart, end).trim();
    };

    const overview = extractSection('**OVERVIEW:**', '**LIFESTYLE:**');
    const lifestyle = extractSection('**LIFESTYLE:**', '**MEDICATIONS:**');
    const medications = extractSection('**MEDICATIONS:**', '**WARNING:**');
    const warning = extractSection('**WARNING:**', '**FOLLOWUP:**');
    const followup = extractSection('**FOLLOWUP:**');

    return NextResponse.json({
      overview: overview || 'Information not available.',
      lifestyle: lifestyle || 'Information not available.',
      medications: medications || 'Information not available.',
      warning: warning || 'Information not available.',
      followup: followup || 'Information not available.'
    });

  } catch (error: any) {
    console.error('Error generating patient education:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate education sheet.' }, { status: 500 });
  }
}
