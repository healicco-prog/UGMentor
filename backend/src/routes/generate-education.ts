import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { condition, audience, language } = req.body;
    if (!condition) return res.status(400).json({ error: 'condition is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a medical professional creating patient education material.
Create clear, jargon-free patient education content about: ${condition}
Target Audience: ${audience || 'General Patient'}
Language Level: ${language || 'Simple English'}

Include: What is this condition, Causes, Symptoms, Treatment, Lifestyle modifications, When to seek emergency help.
Format in friendly, easy-to-understand Markdown.`;

    const result = await model.generateContent(prompt);
    return res.json({ content: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate education content.' });
  }
});

export default router;
