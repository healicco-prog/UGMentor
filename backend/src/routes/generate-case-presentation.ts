import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { course, subject, topic, presentationType, audience } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert medical educator creating a detailed case presentation for healthcare students.
Create a comprehensive ${presentationType || 'OSCE-style'} case presentation for:
Course: ${course || 'MBBS'}
Subject: ${subject || 'General Medicine'}
Topic/Condition: ${topic}
Audience: ${audience || 'Medical Students'}

Include: Chief Complaint, History of Present Illness, Past Medical History, Examination Findings, Investigations, Diagnosis, and Management Plan. 
Format in structured Markdown with clear headings.`;

    const result = await model.generateContent(prompt);
    return res.json({ presentation: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate case presentation.' });
  }
});

export default router;
