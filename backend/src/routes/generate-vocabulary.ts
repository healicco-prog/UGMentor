import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { course, subject, count } = req.body;
    if (!subject || !count) return res.status(400).json({ error: 'subject and count are required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate exactly ${count} medical vocabulary words for subject: ${subject} (course: ${course || 'MBBS'}).
Return ONLY a valid JSON array: [{"word":"Term","def":"Definition"},...]. Exactly ${count} items.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    let wordsArray = [];
    try { wordsArray = JSON.parse(text); } catch (e) {
      return res.status(500).json({ error: 'AI returned malformed JSON.' });
    }
    if (!Array.isArray(wordsArray)) wordsArray = [wordsArray];
    return res.json({ words: wordsArray });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate vocabulary.' });
  }
});

export default router;
