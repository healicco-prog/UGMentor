// React component
import React, { useState, useEffect } from 'react';

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

interface MCQ { question: string; options: string[]; correct: number; explanation: string; }

export default function MCQGeneratorPage() {
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');

  const [topic, setTopic] = useState('');
  const [count, setCount] = useState('10');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [generating, setGenerating] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // When course changes → update subject list
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

  const generate = async () => {
    if (!course || !subject || !topic) return;
    setGenerating(true);
    setAnswers({});
    setSubmitted(false);
    await new Promise(r => setTimeout(r, 2500));
    const generated: MCQ[] = Array.from({ length: parseInt(count) }, (_, i) => ({
      question: `Question ${i + 1}: Regarding ${topic} in ${subject}, which of the following statements is ${i % 2 === 0 ? 'TRUE' : 'INCORRECT'}?`,
      options: [
        `${topic} primarily affects the ${['liver', 'kidney', 'heart', 'lung'][i % 4]}`,
        `The main mechanism involves receptor-mediated ${['activation', 'inhibition', 'modulation', 'blockade'][i % 4]}`,
        `First-line treatment includes ${['drug A at standard dose', 'surgical intervention', 'conservative management', 'immunosuppression'][i % 4]}`,
        `Diagnosis is confirmed by ${['blood test', 'imaging', 'biopsy', 'clinical criteria'][i % 4]}`,
      ],
      correct: i % 4,
      explanation: `The correct answer is option ${['A', 'B', 'C', 'D'][i % 4]}. ${topic} ${i % 2 === 0 ? 'characteristically involves' : 'does NOT involve'} this mechanism because of its underlying pathophysiology involving [detailed explanation here].`
    }));
    setMcqs(generated);
    setGenerating(false);
  };

  const score = submitted ? Object.entries(answers).filter(([i, a]) => mcqs[parseInt(i)]?.correct === a).length : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">ðŸŽ¯ MCQs Generator</h1>
        <p className="page-desc">Generate and practice single-best-answer MCQs for exam preparation</p>
      </div>

      <div className="card" style={{ marginBottom: 20, maxWidth: 800 }}>
        {/* Course and Subject Selection */}
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Course</label>
            <select className="input-field" value={course} onChange={e => setCourse(e.target.value)}>
              <option value="">Select Course</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Subject</label>
            <select 
              className="input-field" 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              disabled={!course}
              style={{ opacity: course ? 1 : 0.5, cursor: course ? 'pointer' : 'not-allowed' }}
            >
              <option value="">{course ? 'Select Subject' : 'Select Course first'}</option>
              {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Topic Input */}
        <div className="form-group">
          <label className="label">Topic</label>
          <input 
            className="input-field" 
            placeholder="e.g., Mechanism of Beta Blockers" 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            disabled={!subject}
            style={{ opacity: subject ? 1 : 0.5, cursor: subject ? 'text' : 'not-allowed' }}
          />
        </div>

        {/* Output Options */}
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Number of MCQs</label>
            <select className="input-field" value={count} onChange={e => setCount(e.target.value)}>
              {['5', '10', '20', '30'].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Difficulty</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Easy', 'Moderate', 'Tough'].map(d => (
                <button 
                  key={d} 
                  className={`chip ${difficulty === d ? 'active' : ''}`} 
                  onClick={() => setDifficulty(d)}
                  style={{ padding: '8px 16px' }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, marginTop: 8 }} 
          onClick={generate} 
          disabled={generating || !course || !subject || !topic}
        >
          {generating ? <><span className="spinner" style={{ marginRight: 8 }} />Generating MCQsâ€¦</> : `🤖 Generate ${count} MCQs`}
        </button>
      </div>

      {submitted && (
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(108,59,255,0.1))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 36 }}>ðŸ“Š</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Score: {score}/{mcqs.length} ({Math.round((score / mcqs.length) * 100)}%)</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{difficulty} level • {course} • {subject} • {topic}</div>
          </div>
          <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => { setAnswers({}); setSubmitted(false); }}>Retry</button>
        </div>
      )}

      {mcqs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mcqs.map((mcq, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <span className="badge badge-primary" style={{ flexShrink: 0 }}>Q{i + 1}</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>{mcq.question}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mcq.options.map((opt, j) => {
                  const chosen = answers[i] === j;
                  const isCorrect = mcq.correct === j;
                  const showResult = submitted;
                  let bg = 'var(--bg-elevated)';
                  let border = 'var(--border)';
                  if (showResult && isCorrect) { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.4)'; }
                  else if (showResult && chosen && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.4)'; }
                  else if (!showResult && chosen) { bg = 'rgba(108,59,255,0.1)'; border = 'rgba(108,59,255,0.4)'; }
                  return (
                    <button key={j} onClick={() => !submitted && setAnswers(prev => ({ ...prev, [i]: j }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-sm)', cursor: submitted ? 'default' : 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: chosen && !submitted ? 'var(--primary)' : showResult && isCorrect ? 'var(--success)' : 'var(--bg-surface)', border: `1px solid ${chosen && !submitted ? 'var(--primary)' : showResult && isCorrect ? 'var(--success)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: chosen || (showResult && isCorrect) ? 'white' : 'var(--text-secondary)', flexShrink: 0 }}>
                        {['A', 'B', 'C', 'D'][j]}
                      </span>
                      <span style={{ fontSize: 13, color: chosen || (showResult && isCorrect) ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: chosen || (showResult && isCorrect) ? 600 : 400 }}>{opt}</span>
                      {showResult && isCorrect && <span style={{ marginLeft: 'auto', color: 'var(--success)', fontWeight: 700 }}>✓</span>}
                      {showResult && chosen && !isCorrect && <span style={{ marginLeft: 'auto', color: 'var(--danger)', fontWeight: 700 }}>✗</span>}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(108,59,255,0.05)', border: '1px solid rgba(108,59,255,0.15)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  💡 <strong>Explanation:</strong> {mcq.explanation}
                </div>
              )}
            </div>
          ))}

          {!submitted && (
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', maxWidth: 800 }}
              onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < mcqs.length}>
              Submit Answers ({Object.keys(answers).length}/{mcqs.length} answered)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

