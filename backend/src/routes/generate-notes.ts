import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { course, subject, topic, noteType } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert medical professor creating comprehensive study notes.
Generate detailed ${noteType || 'structured'} notes for:
Course: ${course || 'MBBS'}
Subject: ${subject || 'General'}
Topic: ${topic}

Include:
1. Introduction & Definition
2. Etiology / Classification
3. Pathophysiology / Mechanism
4. Clinical Features / Signs & Symptoms
5. Investigations
6. Management / Treatment
7. Complications
8. Key Exam Points (High-Yield)

Use clear Markdown with headings, bullet points, tables where applicable. Be medically accurate and concise.`;

    const result = await model.generateContent(prompt);
    return res.json({ notes: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate notes.' });
  }
});

export default router;
