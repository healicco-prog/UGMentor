import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { course, subject, topic, duration, audience } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert medical educator creating a comprehensive seminar presentation.
Create a detailed ${duration || '45-minute'} seminar plan for:
Course: ${course || 'MBBS'}
Subject: ${subject || 'General'}
Topic: ${topic}
Audience: ${audience || 'Medical Students'}

Include:
1. Learning Objectives (3-5 SMART objectives)
2. Introduction & Background (5 minutes)
3. Core Content with detailed sub-topics (25 minutes)
4. Clinical Case Discussion (10 minutes)  
5. Summary & Key Takeaways
6. Q&A Preparation (10 likely questions with answers)
7. Recommended References

Format in structured Markdown with clear timing indicators.`;

    const result = await model.generateContent(prompt);
    return res.json({ seminar: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate seminar.' });
  }
});

export default router;
