import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { course, subject, section, topic, question, marksType } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'question is required.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
      text = `## AI Generated Answer (Fallback Mode)\n\n*Note: The AI API encountered an error (${apiError.message})*\n\n### Overview of ${topic}\nThe **${topic}** is a critical component of the ${subject} curriculum within the ${course} program.\n\n### Key Points to Remember:\n* **Point 1:** Comprehensive understanding of the anatomical relations.\n* **Point 2:** Clinical significance and commonly associated pathologies.\n* **Point 3:** Diagnostic criteria and management protocols.\n\n### Clinical Correlation\nIn a clinical setting, understanding this topic is essential for accurate diagnosis and patient care.`;
    }

    return res.json({ answer: text });
  } catch (error: any) {
    console.error('Error generating answer:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate answer.' });
  }
});

export default router;
