// React component
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// â”€â”€â”€ Course → Subject Mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

interface Message { role: 'user' | 'ai'; content: string; time: string; }

export default function AIMentorProPage() {
  const { user } = useAuth();
  
  // Selection States
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Hello ${user?.name?.split(' ')[0] || 'Doctor'}! 👋 I'm your AI MentorPro, powered by advanced UGMentor.\n\nI can help you with:\n• 📚 Explaining complex medical concepts\n• 🎯 Answering university exam questions\n• 💊 Drug mechanisms and pharmacology\n• ðŸ¥ Clinical case discussions\n• âœï¸ Essay writing strategies\n\nWhat would you like to learn today?`, time: new Date().toLocaleTimeString() }
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

  const generateAIReply = async (userMsg: string): Promise<string> => {
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
    
    // Dynamic context based on selected Course, Subject, and Topic
    const contextPrefix = (course && subject) ? `From the perspective of **${course} - ${subject}**${topic ? ` (focusing on ${topic})` : ''}, ` : '';
    
    return `Great question! Let me explain that for you in a structured way.\n\n**Context:** ${contextPrefix || 'General Medical Knowledge'}\n**Understanding: "${userMsg.slice(0, 50)}..."**\n\nThis is a clinically important topic that appears frequently in university examinations. Here's a comprehensive breakdown:\n\n**1. Definition & Overview:**\nThe concept involves multiple physiological and pathological mechanisms that are fundamental to ${subject ? subject : 'medical practice'}.\n\n**2. Key Mechanisms:**\n• Primary mechanism: Involves receptor-mediated pathways\n• Secondary effects: Downstream signaling cascades\n• Clinical relevance: Direct application to patient care\n\n**3. Clinical Significance:**\nUnderstanding this topic helps you:\n- Diagnose conditions accurately\n- Choose appropriate investigations\n- Select optimal treatment strategies\n\n**4. Exam Tips:**\n✓ Always mention definition first\n✓ Use classification to organize your answer\n✓ Include clinical examples\n✓ Draw diagrams where applicable\n\n**5. Related Topics to Study:**\n- Pathophysiology connections\n- Pharmacological implications\n- Recent advances\n\nWould you like me to elaborate on any specific aspect, or shall we practice some MCQs on this topic?`;
  };

  const send = async (msg?: string) => {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: text, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    const reply = await generateAIReply(text);
    setMessages(prev => [...prev, { role: 'ai', content: reply, time: new Date().toLocaleTimeString() }]);
    setLoading(false);
  };

  // Dynamic quick questions based on Subject/Topic
  const quickQuestions = topic && subject ? [
    `Explain the mechanism of action related to ${topic}`,
    `What are the clinical features of ${topic}?`,
    `Discuss the management protocol for ${topic}`,
    `Important university exam questions from ${subject}`,
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
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Your personal AI tutor for medical education</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setMessages([{ role: 'ai', content: 'Chat cleared! How can I help you?', time: new Date().toLocaleTimeString() }])}>ðŸ—‘ Clear Chat</button>
        </div>

        {/* Dynamic Context Selectors */}
        <div className="grid-3" style={{ gap: 12 }}>
          <select className="input-field" style={{ padding: '8px 12px', fontSize: 13 }} value={course} onChange={e => setCourse(e.target.value)}>
            <option value="">Select Course</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="input-field" 
            style={{ padding: '8px 12px', fontSize: 13, opacity: course ? 1 : 0.5, cursor: course ? 'pointer' : 'not-allowed' }} 
            value={subject} 
            onChange={e => setSubject(e.target.value)}
            disabled={!course}
          >
            <option value="">{course ? 'Select Subject' : 'Select Course first'}</option>
            {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <input 
            className="input-field" 
            style={{ padding: '8px 12px', fontSize: 13, opacity: subject ? 1 : 0.5, cursor: subject ? 'text' : 'not-allowed' }}
            placeholder="Type Topic (e.g. Diabetes)" 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            disabled={!subject}
          />
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
              {msg.role === 'ai' ? '🤖' : 'ðŸ‘¤'}
            </div>
            <div style={{ maxWidth: '70%' }}>
              <div style={{
                padding: '14px 18px', borderRadius: msg.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                background: msg.role === 'ai' ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                fontSize: 14, lineHeight: 1.8, color: msg.role === 'ai' ? 'var(--text-secondary)' : 'white',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word'
              }}>
                {msg.content}
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
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', gap: 12 }}>
        <textarea
          className="input-field"
          style={{ flex: 1, resize: 'none', minHeight: 'auto', height: 48, lineHeight: '24px', padding: '12px 14px' }}
          placeholder="Ask anything about medical topicsâ€¦"
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
  );
}

