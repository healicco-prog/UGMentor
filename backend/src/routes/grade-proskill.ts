import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { transcript, caseType, type } = req.body;
    if (!transcript || transcript.trim() === '') {
      return res.json({ score: 0, strengths: ['None.'], improvements: ['No response provided.'] });
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const isCommunication = type === 'communication';
    const prompt = isCommunication
      ? `Evaluate this doctor-patient communication for scenario: "${caseType}". Transcript: "${transcript}". Evaluate on empathy, clarity, structure, teach-back. Return raw JSON only: {"score":<0-100>,"strengths":["..."],"improvements":["..."]}`
      : `Evaluate this AETCOM/ethics response for scenario: "${caseType}". Transcript: "${transcript}". Evaluate on SPIKES protocol, ethics, professionalism, empathy. Return raw JSON only: {"score":<0-100>,"strengths":["..."],"improvements":["..."]}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim()
      .replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(text);
    return res.json({ score: parsed.score || 0, strengths: parsed.strengths || [], improvements: parsed.improvements || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to grade response.' });
  }
});

export default router;
