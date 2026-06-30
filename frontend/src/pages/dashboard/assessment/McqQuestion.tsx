// React component
import React, { useState, useEffect } from 'react';

type Step = 'generate' | 'practice' | 'bank' | 'report';

const COURSE_DATA: Record<string, { subjects: string[] }> = {
  MBBS: {
    subjects: [
      'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Microbiology',
      'Pharmacology', 'Forensic Medicine & Toxicology (FMT)',
      'Community Medicine (PSM)', 'Ophthalmology', 'ENT (Otorhinolaryngology)',
      'General Medicine', 'Pediatrics', 'Dermatology', 'Psychiatry',
      'General Surgery', 'Orthopedics', 'Obstetrics & Gynaecology (OBG)',
      'Anesthesia', 'Radiology', 'Emergency Medicine',
    ],
  },
  BDS: {
    subjects: [
      'General Human Anatomy incl. Embryology, Osteology & Histology',
      'General Physiology', 'Biochemistry, Nutrition and Dietetics',
      'Dental Anatomy, Embryology and Oral Histology',
      'General Pathology', 'Microbiology',
      'General and Dental Pharmacology and Therapeutics',
      'Dental Materials', 'Preclinical Prosthodontics and Crown & Bridge',
      'Preclinical Conservative Dentistry', 'General Medicine', 'General Surgery',
      'Oral and Maxillofacial Pathology & Oral Microbiology',
      'Oral Medicine and Radiology', 'Oral & Maxillofacial Surgery',
      'Periodontology', 'Pediatric and Preventive Dentistry',
      'Conservative Dentistry and Endodontics',
      'Prosthodontics and Crown & Bridge',
      'Orthodontics & Dentofacial Orthopaedics',
    ],
  },
  'BSc Nursing': {
    subjects: [
      'Adult Health Nursing (Medical Surgical Nursing) I',
      'Adult Health Nursing II', 'Applied Anatomy', 'Applied Biochemistry',
      'Applied Microbiology & Infection Control including Safety',
      'Applied Nutrition & Dietetics', 'Applied Physiology',
      'Applied Psychology', 'Applied Sociology',
      'Child Health Nursing I & II', 'Community Health Nursing I & II',
      'Educational Technology / Nursing Education', 'Genetics',
      'Mental Health Nursing I & II', 'Midwifery / OBG Nursing I & II',
      'Nursing Foundations I', 'Nursing Foundations II',
      'Nursing Management & Leadership', 'Nursing Research & Statistics',
      'Pathology I & II', 'Pharmacology I & II',
    ],
  },
};

const COURSES = Object.keys(COURSE_DATA);
const TOPICS = ['Diabetes Mellitus', 'Hypertension', 'Tuberculosis', 'Myocardial Infarction', 'Asthma', 'Heart Failure'];
const QTYPES = ['Single Best Answer', 'Multiple True/False', 'Extended Matching Questions (EMQ)', 'Assertion-Reasoning', 'Case-Based'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Tough'];

interface MCQ { question: string; options: string[]; correct: number; explanation: string; }

export default function MCQQuestionPage() {
  const [step, setStep] = useState<Step>('generate');

  // Form State
  const [course, setCourse] = useState('MBBS');
  const [subjectList, setSubjectList] = useState<string[]>(COURSE_DATA['MBBS'].subjects);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [qtype, setQtype] = useState('Single Best Answer');
  const [marks, setMarks] = useState('1');
  const [instruction, setInstruction] = useState('');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [count, setCount] = useState('10');
  const [timeAllowed, setTimeAllowed] = useState('10 mins');

  // App State
  const [generating, setGenerating] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Timer State
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timerStarted && timeLeft > 0 && !submitted) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerStarted && !submitted) {
      handleSubmitPractice();
    }
    return () => clearInterval(interval);
  }, [timerStarted, timeLeft, submitted]);

  const parseTimeToSeconds = (timeStr: string) => {
    const num = parseInt(timeStr);
    return isNaN(num) ? 600 : num * 60; // default 10 mins
  };

  useEffect(() => {
    if (COURSE_DATA[course]) {
      setSubjectList(COURSE_DATA[course].subjects);
    } else {
      setSubjectList([]);
    }
    setSubject('');
  }, [course]);

  const handleGenerate = async () => {
    if (!subject || !topic) return;
    setGenerating(true);
    setAnswers({});
    setSubmitted(false);
    
    // Simulate generation
    await new Promise(r => setTimeout(r, 2000));
    
    const num = parseInt(count) || 10;
    const generated: MCQ[] = Array.from({ length: num }, (_, i) => ({
      question: `Question ${i + 1}: Regarding ${topic} in ${subject}, which of the following statements is ${i % 2 === 0 ? 'TRUE' : 'INCORRECT'}?`,
      options: [
        `${topic} primarily affects the ${['liver', 'kidney', 'heart', 'lung'][i % 4]}`,
        `The main mechanism involves receptor-mediated ${['activation', 'inhibition', 'modulation', 'blockade'][i % 4]}`,
        `First-line treatment includes ${['drug A at standard dose', 'surgical intervention', 'conservative management', 'immunosuppression'][i % 4]}`,
        `Diagnosis is confirmed by ${['blood test', 'imaging', 'biopsy', 'clinical criteria'][i % 4]}`,
      ],
      correct: i % 4,
      explanation: `The correct answer is option ${['A', 'B', 'C', 'D'][i % 4]}. ${topic} ${i % 2 === 0 ? 'characteristically involves' : 'does NOT involve'} this mechanism because of its underlying pathophysiology. ${instruction ? 'Specific instruction followed: ' + instruction : ''}`
    }));
    
    setMcqs(generated);
    setGenerating(false);
    setTimeLeft(parseTimeToSeconds(timeAllowed));
    setTimerStarted(false);
    setStep('practice'); // Auto switch to practice
  };

  const handleSubmitPractice = () => {
    setSubmitted(true);
    setStep('report'); // Auto switch to report
  };

  const score = Object.entries(answers).filter(([i, a]) => mcqs[parseInt(i)]?.correct === a).length;
  const accuracy = mcqs.length > 0 ? Math.round((score / mcqs.length) * 100) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">✅ MCQ Question Module</h1>
        <p className="page-desc">Self assess, practice, and review your performance using AI-generated MCQs</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'generate', label: 'Self Assess using MCQs', icon: '🤖' },
          { id: 'practice', label: 'Practice Session', icon: '📊' },
          { id: 'report', label: 'Performance Report', icon: '📈' },
          { id: 'bank', label: 'Question Bank', icon: '📋' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setStep(t.id as Step)}
            className={`btn ${step === t.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {step === 'generate' && (
        <div className="animate-fadeIn" style={{ maxWidth: 800 }}>
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Configure Question Parameters</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Select Course *</label>
                <select className="input-field" value={course} onChange={e => setCourse(e.target.value)}>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Select Subject *</label>
                <select className="input-field" value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="">Select Subject</option>
                  {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Select/Type Topic *</label>
              <input
                className="input-field"
                list="topics-list"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g., Mechanism of Beta Blockers or Select from list"
              />
              <datalist id="topics-list">
                {TOPICS.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">Question Type</label>
                <input
                  className="input-field"
                  list="qtypes-list"
                  value={qtype}
                  onChange={e => setQtype(e.target.value)}
                  placeholder="Different types or type your own"
                />
                <datalist id="qtypes-list">
                  {QTYPES.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="label">Total Marks for each MCQ</label>
                <input className="input-field" type="number" min={1} value={marks} onChange={e => setMarks(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Any specific Instruction (Optional)</label>
              <textarea
                className="input-field"
                rows={2}
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                placeholder="e.g., Case based with 2 sub questions, reasoning, etc"
              />
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="label">Difficulty Level</label>
                <select className="input-field" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">No of MCQs</label>
                <input className="input-field" type="number" min={1} max={100} value={count} onChange={e => setCount(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Time Allowed</label>
                <input className="input-field" placeholder="e.g., 10 mins" value={timeAllowed} onChange={e => setTimeAllowed(e.target.value)} />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, marginTop: 12 }}
              onClick={handleGenerate}
              disabled={generating || !subject || !topic}
            >
              {generating ? <><span className="spinner" style={{ marginRight: 8 }} />Generating MCQs & Savingâ€¦</> : '🤖 Generate MCQs & Save'}
            </button>
          </div>
        </div>
      )}

      {step === 'practice' && (
        <div className="animate-fadeIn">
          {mcqs.length === 0 ? (
            <div className="empty-state card glass">
              <div className="empty-state-icon">ðŸ“­</div>
              <h3 className="empty-state-title">No Practice Session Active</h3>
              <p className="empty-state-desc">Generate MCQs first or select a set from the Question Bank.</p>
              <button className="btn btn-primary" onClick={() => setStep('generate')}>Go to Self Assess</button>
            </div>
          ) : (
            <div style={{ maxWidth: 800 }}>
              <div className="card glass" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{topic} Practice</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{subject} • {difficulty} Level • {mcqs.length} Questions</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--primary-light)' }}>
                    â³ {timerStarted ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : timeAllowed}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Time Remaining</div>
                </div>
              </div>

              {!timerStarted ? (
                <div className="card glass" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>â±ï¸</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ready to start the practice session?</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Once started, the timer will count down from {timeAllowed}. The session will auto-submit when time is up.</p>
                  <button className="btn btn-primary btn-lg" onClick={() => setTimerStarted(true)}>Start Timer</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mcqs.map((mcq, i) => (
                  <div key={i} className="card">
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                      <span className="badge badge-primary" style={{ flexShrink: 0 }}>Q{i + 1}</span>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>{mcq.question}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {mcq.options.map((opt, j) => {
                        const chosen = answers[i] === j;
                        return (
                          <button key={j} onClick={() => !submitted && setAnswers(prev => ({ ...prev, [i]: j }))}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: chosen ? 'rgba(108,59,255,0.1)' : 'var(--bg-elevated)', border: `1px solid ${chosen ? 'rgba(108,59,255,0.4)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', cursor: submitted ? 'default' : 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                            <span style={{ width: 26, height: 26, borderRadius: '50%', background: chosen ? 'var(--primary)' : 'var(--bg-surface)', border: `1px solid ${chosen ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: chosen ? 'white' : 'var(--text-secondary)', flexShrink: 0 }}>
                              {['A', 'B', 'C', 'D'][j]}
                            </span>
                            <span style={{ fontSize: 14, color: chosen ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: chosen ? 600 : 400 }}>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!submitted && (
                  <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleSubmitPractice} disabled={Object.keys(answers).length < mcqs.length}>
                    Submit Answers ({Object.keys(answers).length}/{mcqs.length} answered)
                  </button>
                )}
              </div>
              )}
            </div>
          )}
        </div>
      )}

      {step === 'report' && (
        <div className="animate-fadeIn">
          {!submitted ? (
            <div className="empty-state card glass">
              <div className="empty-state-icon">📊</div>
              <h3 className="empty-state-title">No Report Available</h3>
              <p className="empty-state-desc">You need to submit a practice session first to view the report.</p>
              <button className="btn btn-primary" onClick={() => setStep('practice')}>Go to Practice Session</button>
            </div>
          ) : (
            <div style={{ maxWidth: 800 }}>
              <div className="card glass" style={{ marginBottom: 24, textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>{accuracy >= 80 ? 'ðŸ†' : accuracy >= 50 ? 'ðŸ‘' : '📚'}</div>
                <h2 className="font-outfit" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Performance Report</h2>
                <div style={{ fontSize: 52, fontWeight: 900, fontFamily: 'Outfit', color: accuracy >= 80 ? 'var(--success)' : accuracy >= 50 ? 'var(--warning)' : 'var(--danger)', marginBottom: 8 }}>
                  {score}/{mcqs.length} ({accuracy}%)
                </div>
                <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                  {topic} • {subject}
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Question Review (Right vs Wrong)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mcqs.map((mcq, i) => {
                  const chosen = answers[i];
                  const isCorrect = mcq.correct === chosen;
                  return (
                    <div key={i} className="card" style={{ borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}` }}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`} style={{ flexShrink: 0 }}>Q{i + 1} {isCorrect ? '✓' : '✗'}</span>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>{mcq.question}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {mcq.options.map((opt, j) => {
                          const isUserChoice = chosen === j;
                          const isActualCorrect = mcq.correct === j;
                          let bg = 'var(--bg-elevated)';
                          let border = 'var(--border)';
                          if (isActualCorrect) { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.4)'; }
                          else if (isUserChoice && !isActualCorrect) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.4)'; }
                          
                          return (
                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-sm)' }}>
                              <span style={{ width: 24, height: 24, borderRadius: '50%', background: isActualCorrect ? 'var(--success)' : isUserChoice ? 'var(--danger)' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: (isActualCorrect || isUserChoice) ? 'white' : 'var(--text-secondary)', flexShrink: 0 }}>
                                {['A', 'B', 'C', 'D'][j]}
                              </span>
                              <span style={{ fontSize: 14, color: (isActualCorrect || isUserChoice) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt}</span>
                              {isActualCorrect && <span style={{ marginLeft: 'auto', color: 'var(--success)', fontWeight: 700 }}>✓ Correct</span>}
                              {isUserChoice && !isActualCorrect && <span style={{ marginLeft: 'auto', color: 'var(--danger)', fontWeight: 700 }}>✗ Your Answer</span>}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        💡 <strong>Explanation & Reasoning:</strong> {mcq.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'bank' && (
        <div className="animate-fadeIn">
          <div className="card">
            <div className="section-header">
              <div className="section-title">📚 Question Bank / Saved MCQs</div>
            </div>
            {topic && mcqs.length > 0 && submitted && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{topic}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subject} • {mcqs.length} MCQs • {new Date().toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-success">Attempted: {accuracy}%</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => setStep('practice')}>Retake</button>
                </div>
              </div>
            )}
            {[
              { t: 'Hypertension Management', sub: 'General Medicine', date: '2026-06-20', count: 15, score: 80 },
              { t: 'Brachial Plexus Anatomy', sub: 'Anatomy', date: '2026-06-18', count: 10, score: 90 },
              { t: 'Antibiotics Mechanisms', sub: 'Pharmacology', date: '2026-06-15', count: 20, score: 65 },
              { t: 'Renal Physiology Basics', sub: 'Physiology', date: '2026-06-10', count: 5, score: null },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{row.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.sub} • {row.count} MCQs • {row.date}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {row.score !== null ? (
                    <span className="badge badge-secondary">Prev Score: {row.score}%</span>
                  ) : (
                    <span className="badge badge-warning">Unattempted</span>
                  )}
                  <button className="btn btn-secondary btn-sm">Practice</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

