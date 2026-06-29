import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { course, subject, topic, marks, essayText } = req.body;
    if (!essayText) return res.status(400).json({ error: 'essayText is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert medical examiner grading a student's essay answer.
Question Context:
Course: ${course || 'MBBS'}
Subject: ${subject || 'General'}
Topic: ${topic || 'General'}
Marks: ${marks || 10}

Student's Essay:
"${essayText}"

Provide a detailed assessment including:
1. Overall Score (out of ${marks || 10})
2. Strengths (what they did well)
3. Areas for Improvement (what's missing or incorrect)
4. Model Answer key points they should include
5. Examiner Remarks

Format in structured Markdown.`;

    const result = await model.generateContent(prompt);
    return res.json({ feedback: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to grade essay.' });
  }
});

export default router;
