// React component
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

const QTYPES_ESSAY = ['Long Essay Questions (LEQ)', 'Structured Essay Questions (SEQ)', 'Modified Essay Questions (MEQ)', 'Problem-Based Essay Questions', 'Clinical Scenario-Based'];

interface SavedItem {
  id: string;
  question: string;
  answer?: string;
}

export default function EssayGeneratorPage() {
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  
  const [topic, setTopic] = useState('');
  const [qtype, setQtype] = useState('Long Essay Questions (LEQ)');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [count, setCount] = useState('5');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [generatingAnswer, setGeneratingAnswer] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [selectedSaved, setSelectedSaved] = useState<SavedItem | null>(null);

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
    try {
      const res = await fetch('/api/generate-essay-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, subject, topic: topic.trim(), qtype, difficulty, count: parseInt(count) || 5 })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions);
      setAnswers({});
    } catch (err: any) {
      alert(err.message || 'Error generating questions.');
    } finally {
      setGenerating(false);
    }
  };

  const generateAnswer = async (qIndex: number, question: string) => {
    setGeneratingAnswer(prev => ({ ...prev, [qIndex]: true }));
    try {
      const res = await fetch('/api/generate-essay-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, subject, topic, question })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnswers(prev => ({ ...prev, [qIndex]: data.answer }));
    } catch (err: any) {
      alert(err.message || 'Error generating answer.');
    } finally {
      setGeneratingAnswer(prev => ({ ...prev, [qIndex]: false }));
    }
  };

  const handleSave = (qIndex: number, question: string) => {
    const newItem: SavedItem = {
      id: Date.now().toString() + qIndex,
      question,
      answer: answers[qIndex]
    };
    setSaved(prev => [newItem, ...prev]);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">âœï¸ Essay Questions Generator</h1>
        <p className="page-desc">Generate exam-standard essay questions and AI model answers by course and subject</p>
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 340 }}>
          <div className="card" style={{ marginBottom: 24 }}>
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
            
            <div className="form-group">
              <label className="label">Topic</label>
              <input 
                className="input-field" 
                placeholder="e.g., Pathophysiology of Diabetes Mellitus" 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                disabled={!subject}
                style={{ opacity: subject ? 1 : 0.5, cursor: subject ? 'text' : 'not-allowed' }}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">Question Type</label>
                <select className="input-field" value={qtype} onChange={e => setQtype(e.target.value)}>
                  {QTYPES_ESSAY.map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Number of Questions</label>
                <input 
                  type="number"
                  min="1"
                  max="100"
                  className="input-field" 
                  value={count} 
                  onChange={e => setCount(e.target.value)} 
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['Easy', 'Moderate', 'Tough'].map(d => <button key={d} className={`chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>)}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 15 }}
              onClick={generate} disabled={generating || !course || !subject || !topic}>
              {generating ? <><span className="spinner" style={{ marginRight: 8 }} />Generating Questionsâ€¦</> : '🤖 Generate Questions'}
            </button>
          </div>

          {questions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <style>{`
                .md-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px; }
                .md-th { border: 1px solid var(--border); padding: 8px 12px; background: var(--bg-surface); font-weight: 600; color: var(--text-primary); white-space: nowrap; }
                .md-td { border: 1px solid var(--border); padding: 8px 12px; vertical-align: top; }
                .md-pre { overflow-x: auto; -webkit-overflow-scrolling: touch; background: var(--bg-base); padding: 12px; border-radius: 6px; border: 1px solid var(--border); font-size: 12.5px; line-height: 1.5; white-space: pre; margin: 12px 0; color: var(--text-primary); }
              `}</style>
              {questions.map((q, i) => (
                <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', border: answers[i] ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                  <div style={{ padding: '16px 20px', background: answers[i] ? 'rgba(108,59,255,0.03)' : 'var(--bg-elevated)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span className="badge badge-primary">Q{i + 1}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!answers[i] && (
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ fontSize: 11, padding: '4px 10px' }} 
                            onClick={() => generateAnswer(i, q)}
                            disabled={generatingAnswer[i]}
                          >
                            {generatingAnswer[i] ? <><span className="spinner" style={{width: 12, height: 12, marginRight: 4}} />Generatingâ€¦</> : 'âœ¨ Generate Answer'}
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => handleSave(i, q)}>â­ Save</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 14.5, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontWeight: 500 }}>{q}</div>
                  </div>
                  
                  {answers[i] && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', background: 'var(--bg-surface)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>💡</span> AI Model Answer
                      </div>
                      <div className="markdown-body" style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({node, ...props}) => <div style={{ overflowX: 'auto', width: '100%', marginBottom: '16px' }}><table className="md-table" {...props} /></div>,
                            th: ({node, ...props}) => <th className="md-th" {...props} />,
                            td: ({node, ...props}) => <td className="md-td" {...props} />,
                            pre: ({node, ...props}) => <pre className="md-pre" {...props} />,
                            h3: ({node, ...props}) => <h3 style={{ fontSize: 16, marginTop: 24, marginBottom: 12, color: 'var(--text-primary)' }} {...props} />,
                            h4: ({node, ...props}) => <h4 style={{ fontSize: 14, marginTop: 20, marginBottom: 8, color: 'var(--text-primary)' }} {...props} />,
                          }}
                        >
                          {answers[i]}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>â­ Saved Questions</span>
              <span className="badge badge-primary">{saved.length}</span>
            </div>
            
            {saved.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 20px' }}>
                <div className="empty-state-icon" style={{ fontSize: 28, marginBottom: 12 }}>📋</div>
                <div className="empty-state-desc" style={{ fontSize: 13 }}>Save questions and answers to review them later</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {saved.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => setSelectedSaved(selectedSaved?.id === item.id ? null : item)}
                    style={{ 
                      padding: '12px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer',
                      border: `1px solid ${selectedSaved?.id === item.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: selectedSaved?.id === item.id ? 'rgba(108,59,255,0.05)' : 'var(--bg-elevated)',
                      transition: 'var(--transition)', color: 'inherit',
                    }}
                  >
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.question}
                    </div>
                    {item.answer && (
                      <div style={{ marginTop: 8 }}>
                        <span className="badge badge-secondary" style={{ fontSize: 10, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: 'none' }}>
                          ✓ Includes Answer
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSaved && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, paddingRight: 12 }}>
                  {selectedSaved.question}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => {
                      const printContent = document.getElementById(`printable-essay-${selectedSaved.id}`)?.innerHTML;
                      if (!printContent) return;
                      const printWindow = window.open('', '', 'width=800,height=900');
                      if (!printWindow) return;
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Essay Question - UGMentor</title>
                            <style>
                              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                              h1, h2, h3 { color: #000; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-top: 24px; }
                              table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
                              th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
                              th { background-color: #f8f9fa; font-weight: 600; }
                              code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
                              pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid #e2e8f0; }
                              .q-box { background: #f8f9fa; padding: 20px; border-left: 4px solid #6C3BFF; margin-bottom: 30px; font-weight: 500; }
                              @media print {
                                body { padding: 0; }
                                @page { margin: 1.5cm; }
                              }
                            </style>
                          </head>
                          <body>
                            <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #6C3BFF;">
                              <h1 style="border:none; margin:0; padding:0; color: #6C3BFF;">UGMentor Essay Assessment</h1>
                            </div>
                            <div class="q-box">
                              <strong>Question:</strong><br/>
                              ${selectedSaved.question}
                            </div>
                            ${selectedSaved.answer ? `<h3>Model Answer</h3><div style="margin-top: 20px;">${printContent}</div>` : '<i>No model answer generated.</i>'}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 250);
                    }} 
                    style={{ padding: '2px 8px', fontSize: 11 }}
                    title="Download as PDF"
                  >
                    â¬‡ï¸ PDF
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSaved(null)} style={{ padding: '2px 8px' }}>âœ•</button>
                </div>
              </div>
              <div id={`printable-essay-${selectedSaved.id}`} className="markdown-body" style={{ padding: 20, maxHeight: 400, overflowY: 'auto', fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {selectedSaved.answer ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => <div style={{ overflowX: 'auto', width: '100%', marginBottom: '16px' }}><table className="md-table" {...props} /></div>,
                      th: ({node, ...props}) => <th className="md-th" {...props} />,
                      td: ({node, ...props}) => <td className="md-td" {...props} />,
                      pre: ({node, ...props}) => <pre className="md-pre" {...props} />,
                    }}
                  >
                    {selectedSaved.answer}
                  </ReactMarkdown>
                ) : (
                  <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No answer generated for this question.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

