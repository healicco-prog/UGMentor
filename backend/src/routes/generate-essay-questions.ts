import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { course, subject, topic, count, marksType } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert medical exam paper setter.
Generate exactly ${count || 5} ${marksType || '10-mark'} essay questions for:
Course: ${course || 'MBBS'}
Subject: ${subject || 'General'}
Topic: ${topic}

Requirements:
- Questions must be exam-standard quality
- Cover different aspects of the topic
- Number each question clearly (1. 2. 3. etc.)
- Include both short-answer and long-answer style questions
- Questions should test understanding, application and clinical reasoning

Output only the numbered list of questions, no additional commentary.`;

    const result = await model.generateContent(prompt);
    return res.json({ questions: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate essay questions.' });
  }
});

export default router;
