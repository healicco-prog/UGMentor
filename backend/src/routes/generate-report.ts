import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { module: reportModule, course, subject, topic, details } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert medical educator generating a ${reportModule || 'clinical'} report.
Generate a comprehensive, well-structured report for:
Course: ${course || 'MBBS'}
Subject: ${subject || 'General'}
Topic/Case: ${topic}
Additional Details: ${details || 'N/A'}

Ensure the report follows standard academic/clinical formatting. Use clear Markdown with sections and headings.`;

    const result = await model.generateContent(prompt);
    return res.json({ report: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate report.' });
  }
});

export default router;
