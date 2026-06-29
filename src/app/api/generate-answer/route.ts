import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { course, subject, section, topic, question, marksType } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert medical and academic professor. 
A student is studying the following context:
Course: ${course}
Subject: ${subject}
Section: ${section}
Topic: ${topic}

Please write a comprehensive, high-quality, and structured academic essay answer for the following ${marksType} question:
"${question}"

Your answer must be tailored to the expected depth of a ${marksType} question in a medical/dental/nursing curriculum. 
Use clear headings, bullet points for key facts, and include clinical correlations where appropriate. Format your response beautifully in Markdown.`;

    let text = '';
    try {
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (apiError: any) {
      console.warn('Gemini API failed, using fallback answer:', apiError.message);
      // Fallback answer for demonstration purposes if API key is invalid/quota exceeded
      text = `## AI Generated Answer (Fallback Mode)
      
*Note: The AI API encountered an error (${apiError.message}), so this is a beautifully formatted placeholder.*

### Overview of ${topic}
The **${topic}** is a critical component of the ${subject} curriculum within the ${course} program. 

### Key Points to Remember:
* **Point 1:** Comprehensive understanding of the anatomical relations.
* **Point 2:** Clinical significance and commonly associated pathologies.
* **Point 3:** Diagnostic criteria and management protocols.

### Clinical Correlation
In a clinical setting, understanding this topic is essential for accurate diagnosis and patient care. Always refer to your institutional guidelines for specific protocols.`;
    }

    return NextResponse.json({ answer: text });
  } catch (error: any) {
    console.error('Error generating answer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
