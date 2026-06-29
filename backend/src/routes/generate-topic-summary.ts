import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    const { course, subject, topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert medical educator creating high-yield revision notes for healthcare students.
Generate a highly detailed, fact-based Topic Summary for:
Course: ${course || 'MBBS'}
Subject: ${subject || 'General'}
Topic: ${topic}

Provide ACTUAL medical facts, detailed pathophysiology, real drug names, real guidelines, and concrete clinical data.

## 🎯 Core Concept
[Clear 3-4 sentence definition and primary significance]

## 🔑 Key Principles & Pathophysiology
[Actual fundamental mechanisms and pathophysiological steps]

## 📋 Classifications & Clinical Features
[Actual types, classifications, and primary clinical manifestations]

## 💊 Management & Investigations
[Actual first-line investigations and management protocols]

## ⭐ Important Exam Points (High-Yield)
[3-5 high-yield facts and classic buzzwords]

Format strictly in clean Markdown using bold text for key terms.`;

    const result = await model.generateContent(prompt);
    return res.json({ summary: result.response.text() });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate summary.' });
  }
});

export default router;
