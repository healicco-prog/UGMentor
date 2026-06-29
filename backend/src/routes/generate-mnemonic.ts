import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { course, subject, topic, style } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert medical educator creating memory aids for students.
Create a highly memorable ${style || 'acronym/mnemonic'} for:
Course: ${course || 'MBBS'}
Subject: ${subject || 'General'}
Topic: ${topic}

Requirements:
1. Create the primary mnemonic with explanation of each letter/word
2. Explain why this mnemonic works
3. Give 2-3 alternative memory techniques (visual association, story method, etc.)
4. Include a quick 3-second recall test

Format in clear, engaging Markdown.`;

    const result = await model.generateContent(prompt);
    return res.json({ mnemonic: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate mnemonic.' });
  }
});

export default router;
