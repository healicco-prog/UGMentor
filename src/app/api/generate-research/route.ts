import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { taskType, module, topic, details, options } = body;

    if (!topic || !taskType) {
      return NextResponse.json({ error: 'Topic and Task Type are required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    let systemPrompt = '';

    if (module === 'research_assistant') {
      systemPrompt = `You are an expert Research Assistant. Based on the topic "${topic}" and details "${details}", you need to generate professional academic output for the following selected option: ${taskType}.
      If "Research Question Generator" is selected, generate 5 highly specific, novel, and testable research questions (PICO format where applicable).
      If "Protocol Builder" is selected, generate a detailed clinical/scientific protocol outline including Objectives, Study Design, Population, Sample Size considerations, Methodology, and Ethical considerations.`;
    } 
    else if (module === 'statistics_assistant') {
      systemPrompt = `You are an expert Medical Statistician. Based on the topic "${topic}" and details "${details}", you need to generate professional statistical advice for the following selected option: ${taskType}.
      If "Sample Size Calculator" is selected, explain the parameters needed (Alpha, Power, Effect Size) and provide a theoretical sample size estimation example based on the topic.
      If "Statistical Test Selection" is selected, provide a decision tree and recommend the exact parametric and non-parametric tests to be used based on data types.
      If "Interpretation Assistant" is selected, provide a mock scenario of results for this topic and explain how to interpret the p-values and confidence intervals.`;
    } 
    else if (module === 'scientific_writing') {
      const selectedSections = options?.join(', ') || taskType;
      systemPrompt = `You are an expert Academic Medical Writer. Based on the topic "${topic}" and details "${details}", generate a structured draft for the following manuscript sections: ${selectedSections}.
      Write in formal academic language suitable for a high-impact medical journal. Ensure evidence-based statements, proper section headers, and cohesive flow.`;
    }

    const prompt = `${systemPrompt}\n\nFormat the output in clean, structured Markdown (use headings, bullet points, and bold text). Do not include pleasantries.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ output: text });

  } catch (error: any) {
    console.error('Error generating research content:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate content.' }, { status: 500 });
  }
}
