import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Route imports
import generateAnswerRouter from './routes/generate-answer';
import generateCasePresentationRouter from './routes/generate-case-presentation';
import generateEducationRouter from './routes/generate-education';
import generateEssayAnswerRouter from './routes/generate-essay-answer';
import generateEssayQuestionsRouter from './routes/generate-essay-questions';
import generateMnemonicRouter from './routes/generate-mnemonic';
import generateNotesRouter from './routes/generate-notes';
import generateReportRouter from './routes/generate-report';
import generateResearchRouter from './routes/generate-research';
import generateSeminarRouter from './routes/generate-seminar';
import generateTopicSummaryRouter from './routes/generate-topic-summary';
import generateVocabularyRouter from './routes/generate-vocabulary';
import gradeProskillRouter from './routes/grade-proskill';

const app = express();
const PORT = process.env.PORT || 8080;

// Allowed origins — update in production to your Netlify URL
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://ugmentor.netlify.app',
  'https://ugmentor.in',
  'https://www.ugmentor.in',
];

// Security
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy: Origin ${origin} is not allowed.`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting — 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'UGMentor Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API Routes
app.use('/api/generate-answer', generateAnswerRouter);
app.use('/api/generate-case-presentation', generateCasePresentationRouter);
app.use('/api/generate-education', generateEducationRouter);
app.use('/api/generate-essay-answer', generateEssayAnswerRouter);
app.use('/api/generate-essay-questions', generateEssayQuestionsRouter);
app.use('/api/generate-mnemonic', generateMnemonicRouter);
app.use('/api/generate-notes', generateNotesRouter);
app.use('/api/generate-report', generateReportRouter);
app.use('/api/generate-research', generateResearchRouter);
app.use('/api/generate-seminar', generateSeminarRouter);
app.use('/api/generate-topic-summary', generateTopicSummaryRouter);
app.use('/api/generate-vocabulary', generateVocabularyRouter);
app.use('/api/grade-proskill', gradeProskillRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 UGMentor API running at http://localhost:${PORT}`);
});

export default app;
