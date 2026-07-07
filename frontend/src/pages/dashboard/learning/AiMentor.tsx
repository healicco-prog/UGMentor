import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── Course → Subject Mapping ─────────────────────────────────────────────────
const COURSE_DATA: Record<string, string[]> = {
  MBBS: [
    'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Microbiology',
    'Pharmacology', 'Forensic Medicine & Toxicology', 'Community Medicine',
    'Ophthalmology', 'ENT', 'General Medicine', 'Pediatrics', 'Dermatology',
    'Psychiatry', 'General Surgery', 'Orthopedics', 'Obstetrics & Gynaecology',
    'Anesthesia', 'Radiology', 'Emergency Medicine',
  ],
  BDS: [
    'General Human Anatomy & Histology', 'General Physiology',
    'Biochemistry, Nutrition & Dietetics', 'Dental Anatomy & Oral Histology',
    'General Pathology', 'Microbiology', 'Dental Pharmacology & Therapeutics',
    'Dental Materials', 'Oral Pathology & Oral Microbiology',
    'Oral Medicine and Radiology', 'Oral & Maxillofacial Surgery',
    'Periodontology', 'Pediatric & Preventive Dentistry',
    'Conservative Dentistry & Endodontics', 'Prosthodontics',
    'Orthodontics & Dentofacial Orthopaedics',
  ],
  'BSc Nursing': [
    'Applied Anatomy', 'Applied Physiology', 'Applied Biochemistry',
    'Applied Microbiology & Infection Control', 'Applied Nutrition & Dietetics',
    'Applied Psychology', 'Applied Sociology', 'Genetics',
    'Nursing Foundations I', 'Nursing Foundations II',
    'Adult Health Nursing I', 'Adult Health Nursing II',
    'Child Health Nursing', 'Community Health Nursing',
    'Mental Health Nursing', 'Midwifery / OBG Nursing',
    'Pathology', 'Pharmacology', 'Nursing Research & Statistics',
  ],
};

const COURSES = Object.keys(COURSE_DATA);

const LEARNING_GOALS = [
  'Explain Concept Simply',
  'Deep Dive & Pathophysiology',
  'Prepare for Exams (High Yield)',
  'Clinical Case & Application',
  'Mnemonics & Memory Tricks'
];

const LEARNING_STYLES = [
  'Detailed & Comprehensive',
  'Bullet Points (Quick Revision)',
  'Q&A Socratic Method',
  'Use Real-world Analogies'
];

interface Message { role: 'user' | 'ai'; content: string; time: string; }

export default function AIMentorProPage() {
  const { user } = useAuth();
  
  // Selection States
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  
  // New Selection States
  const [learningGoal, setLearningGoal] = useState('');
  const [learningStyle, setLearningStyle] = useState('');

  const initialMessage = `Hello ${user?.name?.split(' ')[0] || 'Doctor'}! 👋 I'm your AI MentorPro, powered by advanced UGMentor.\n\nTo give you the best learning experience, please configure your session above:\n1. Select your **Course**, **Subject**, and **Topic**.\n2. Choose **What you want to learn** and **How you want to learn it**.\n\nOnce you've made your selections, you can ask a question or use a quick prompt below to begin!`;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: initialMessage, time: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Update subject list when course changes
  useEffect(() => {
    if (course) {
      const subs = COURSE_DATA[course] || [];
      setSubjectList(subs);
      setSubject('');
    } else {
      setSubjectList([]);
      setSubject('');
    }
  }, [course]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const generateAIReply = async (userMsg: string, history: Message[]): Promise<string> => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://ugmentor-api-476471947498.asia-south1.run.app'}/api/generate-ai-mentor`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          course, subject, topic, goal: learningGoal, style: learningStyle, userMsg, history
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.answer || "No response generated.";
    } catch (err: any) {
      console.error(err);
      return `*Error: ${err.message || 'Failed to connect to AI Mentor.'}*`;
    }
  };

  const send = async (msg?: string) => {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: text, time: new Date().toLocaleTimeString() };
    const currentHistory = [...messages];
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    const reply = await generateAIReply(text, currentHistory);
    setMessages(prev => [...prev, { role: 'ai', content: reply, time: new Date().toLocaleTimeString() }]);
    setLoading(false);
  };

  const quickQuestions = topic && subject ? [
    `Explain the concept of ${topic} in simple terms`,
    `What are the most high-yield exam points for ${topic}?`,
    `Provide a clinical scenario/application for ${topic}`,
    `How does ${topic} relate to ${subject} overall?`,
  ] : [
    'Explain the mechanism of action of beta blockers',
    'What are the complications of diabetes mellitus?',
    'Describe the brachial plexus in detail',
    'How does the cardiac cycle work?',
    'What is the significance of the blood-brain barrier?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header & Settings Panel */}
      <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 className="font-outfit" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🤖 AI MentorPro</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Your comprehensive personal AI tutor for medical education</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setMessages([{ role: 'ai', content: initialMessage, time: new Date().toLocaleTimeString() }])}>🗑️ Clear Chat</button>
        </div>

        {/* Dynamic Context Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
          <select className="input-field" style={{ padding: '8px 12px', fontSize: 13 }} value={course} onChange={e => setCourse(e.target.value)}>
            <option value="">1. Select Course</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="input-field" 
            style={{ padding: '8px 12px', fontSize: 13, opacity: course ? 1 : 0.5, cursor: course ? 'pointer' : 'not-allowed' }} 
            value={subject} 
            onChange={e => setSubject(e.target.value)}
            disabled={!course}
          >
            <option value="">{course ? '2. Select Subject' : 'Select Course first'}</option>
            {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <input 
            className="input-field" 
            style={{ padding: '8px 12px', fontSize: 13, opacity: subject ? 1 : 0.5, cursor: subject ? 'text' : 'not-allowed' }}
            placeholder="3. Type Topic (e.g. Diabetes)" 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            disabled={!subject}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <select 
            className="input-field" 
            style={{ padding: '8px 12px', fontSize: 13, opacity: topic ? 1 : 0.5, cursor: topic ? 'pointer' : 'not-allowed' }} 
            value={learningGoal} 
            onChange={e => setLearningGoal(e.target.value)}
            disabled={!topic}
          >
            <option value="">{topic ? '4. What to learn? (Optional)' : 'Type Topic first'}</option>
            {LEARNING_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select 
            className="input-field" 
            style={{ padding: '8px 12px', fontSize: 13, opacity: topic ? 1 : 0.5, cursor: topic ? 'pointer' : 'not-allowed' }} 
            value={learningStyle} 
            onChange={e => setLearningStyle(e.target.value)}
            disabled={!topic}
          >
            <option value="">{topic ? '5. How to learn? (Optional)' : 'Type Topic first'}</option>
            {LEARNING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <button 
            className="btn btn-primary"
            style={{ padding: '8px 12px', fontSize: 14, fontWeight: 600, opacity: (subject && topic) ? 1 : 0.5, cursor: (subject && topic) ? 'pointer' : 'not-allowed', height: '100%' }}
            disabled={!subject || !topic || loading}
            onClick={() => send(`Please teach me about ${topic}.`)}
          >
            🚀 Start Mentoring
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'ai' ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : 'linear-gradient(135deg, #0EA5E9, #38BDF8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
            }}>
              {msg.role === 'ai' ? '🤖' : '👤'}
            </div>
            <div style={{ maxWidth: '80%' }}>
              <div style={{
                padding: '14px 18px', borderRadius: msg.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                background: msg.role === 'ai' ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                fontSize: 14, lineHeight: 1.8, color: msg.role === 'ai' ? 'var(--text-secondary)' : 'white',
                wordBreak: 'break-word',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {msg.role === 'ai' ? (
                  <div className="markdown-body" style={{ fontSize: 14, lineHeight: 1.7 }}>
                    <style>{`
                      .markdown-body h3 { font-size: 16px; margin-top: 12px; margin-bottom: 8px; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 4px; }
                      .markdown-body h4 { font-size: 14px; margin-top: 10px; margin-bottom: 6px; color: var(--text-primary); }
                      .markdown-body p { margin-bottom: 8px; }
                      .markdown-body ul, .markdown-body ol { margin-left: 20px; margin-bottom: 12px; }
                      .markdown-body li { margin-bottom: 4px; }
                      .markdown-body hr { border: 0; border-top: 1px solid var(--border); margin: 16px 0; }
                    `}</style>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2].map(j => <div key={j} className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animationDelay: `${j * 0.2}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        {/* Quick Prompts */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {quickQuestions.map((q, idx) => (
            <button 
              key={idx} 
              className="btn btn-secondary btn-sm" 
              style={{ whiteSpace: 'nowrap', borderRadius: 20, background: 'var(--bg-elevated)' }}
              onClick={() => send(q)}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <textarea
            className="input-field"
            style={{ flex: 1, resize: 'none', minHeight: 'auto', height: 48, lineHeight: '24px', padding: '12px 14px' }}
            placeholder="Ask anything about medical topics…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
          />
          <button className="btn btn-primary" style={{ height: 48, padding: '0 20px' }} onClick={() => send()} disabled={!input.trim() || loading}>
            {loading ? <span className="spinner" /> : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}
