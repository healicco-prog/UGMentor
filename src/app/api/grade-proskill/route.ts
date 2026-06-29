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
    const { transcript, caseType, type } = body; // type is 'communication' or 'aetcom'

    if (!transcript || transcript.trim() === '') {
      return NextResponse.json({ 
        score: 0, 
        strengths: ['None.'], 
        improvements: ['No response was provided by the user.'] 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = '';
    
    if (type === 'communication') {
      prompt = `You are an expert medical communication evaluator. Evaluate a doctor's response to a patient for the clinical scenario: "${caseType}".
Doctor's transcript: "${transcript}"

Evaluate on: empathy, clarity (avoiding jargon), logical structure, and use of teach-back.
Provide a JSON response EXACTLY in this format, with no markdown code blocks outside of the JSON itself, just raw JSON:
{
  "score": <number between 0 and 100>,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"]
}`;
    } else {
      prompt = `You are an expert medical ethics and AETCOM evaluator. Evaluate a doctor's response for the scenario: "${caseType}".
Doctor's transcript: "${transcript}"

Evaluate on: adherence to SPIKES protocol (if breaking bad news), ethical boundaries, professionalism, and empathy.
Provide a JSON response EXACTLY in this format, with no markdown code blocks outside of the JSON itself, just raw JSON:
{
  "score": <number between 0 and 100>,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"]
}`;
    }

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Strip markdown formatting if the AI decided to include it
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const parsed = JSON.parse(text);

    return NextResponse.json({
      score: parsed.score || 0,
      strengths: parsed.strengths || ['None.'],
      improvements: parsed.improvements || ['Could not determine improvements.']
    });

  } catch (error: any) {
    console.error('Error grading proskill:', error);
    return NextResponse.json({ error: error.message || 'Failed to grade response.' }, { status: 500 });
  }
}
