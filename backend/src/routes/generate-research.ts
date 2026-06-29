import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { module: researchModule, topic, details, taskType } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';
    if (researchModule === 'statistics_assistant') {
      prompt = `You are an expert biostatistician helping medical researchers.
Task: ${taskType || 'Statistical Analysis'}
Research Topic: ${topic}
Variables/Details: ${details || 'N/A'}

Provide detailed, practical statistical guidance including recommended tests, formulas where applicable, and step-by-step interpretation. Format in clear Markdown.`;
    } else if (researchModule === 'scientific_writing') {
      prompt = `You are an expert academic writing coach for medical researchers.
Topic: ${topic}
Writing Task: ${taskType || 'Manuscript Section'}
Details: ${details || 'N/A'}

Generate high-quality, publication-ready academic content following ICMJE guidelines. Format in structured Markdown.`;
    } else {
      prompt = `You are an expert medical research assistant.
Task: ${taskType || 'Literature Review'}
Research Topic: ${topic}
Details: ${details || 'N/A'}

Provide a comprehensive, evidence-based research output. Include relevant concepts, methodology suggestions, and key references framework. Format in clear Markdown.`;
    }

    const result = await model.generateContent(prompt);
    return res.json({ output: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate research content.' });
  }
});

export default router;
