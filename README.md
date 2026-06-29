# UGMentor — Decoupled Architecture

AI-powered learning platform for undergraduate medical students.

## 🗂️ Project Structure

```
UGMentor/
├── frontend/         # React + Vite (deploy to Netlify)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── context/AuthContext.tsx
│   │   ├── lib/auth.ts
│   │   ├── lib/supabase.ts
│   │   ├── components/
│   │   └── pages/
│   │       ├── Landing.tsx
│   │       ├── Login.tsx
│   │       └── dashboard/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
└── backend/          # Express + TypeScript (deploy to Google Cloud Run)
    ├── src/
    │   ├── server.ts
    │   ├── lib/supabase.ts
    │   └── routes/
    │       ├── generate-answer.ts
    │       ├── generate-notes.ts
    │       ├── generate-vocabulary.ts
    │       ├── generate-mnemonic.ts
    │       ├── generate-essay-questions.ts
    │       ├── generate-essay-answer.ts
    │       ├── generate-case-presentation.ts
    │       ├── generate-education.ts
    │       ├── generate-report.ts
    │       ├── generate-research.ts
    │       ├── generate-seminar.ts
    │       ├── generate-topic-summary.ts
    │       └── grade-proskill.ts
    ├── Dockerfile
    ├── package.json
    └── .env.example
```

## 🚀 Quick Start

### Backend
```bash
cd backend
cp .env.example .env        # Fill in your secrets
npm install
npm run dev                 # Starts on http://localhost:8080
```

### Frontend
```bash
cd frontend
cp .env.example .env        # Fill in VITE_API_URL=http://localhost:8080
npm install
npm run dev                 # Starts on http://localhost:3000
```

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 8080) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `JWT_SECRET` | JWT signing secret |
| `ZEPTOMAIL_API_KEY` | ZeptoMail transactional email key |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

## ☁️ Deployment

### Backend → Google Cloud Run
```bash
cd backend
gcloud builds submit --tag gcr.io/ugmentor-prod/ugmentor-api
gcloud run deploy ugmentor-api \
  --image gcr.io/ugmentor-prod/ugmentor-api \
  --platform managed --region asia-south1 --allow-unauthenticated
```

### Frontend → Netlify
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

## 🌐 Production URLs
- **Frontend**: https://ugmentor.in
- **Backend API**: https://api.ugmentor.in (Cloud Run)
