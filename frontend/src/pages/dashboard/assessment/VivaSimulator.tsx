// React component
import React, { useState, useEffect, useRef } from 'react';
import { COURSE_DATA, TOPIC_SUGGESTIONS, EXAMINER_PERSONAS, VIVA_MODES, generateQuestions, VivaQuestion, QuestionResult } from './data';

type Stage = 'config' | 'session' | 'report';

const COURSES = Object.keys(COURSE_DATA);
const BLOOM_COLORS: Record<string,string> = { Remember:'#6C3BFF', Understand:'#0EA5E9', Apply:'#10B981', Analyze:'#F59E0B', Evaluate:'#EF4444', Create:'#EC4899' };

export default function VivaSimulatorPage() {
  // Config
  const [course, setCourse] = useState('MBBS');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [totalMarks, setTotalMarks] = useState('10');
  const [numQ, setNumQ] = useState('5');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [timeAllowed, setTimeAllowed] = useState('10');
  const [instructions, setInstructions] = useState('');
  const [persona, setPersona] = useState('university');
  const [vivaMode, setVivaMode] = useState('standard');
  const [realtimeFeedback, setRealtimeFeedback] = useState(true);

  // Session
  const [stage, setStage] = useState<Stage>('config');
  const [questions, setQuestions] = useState<VivaQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showModel, setShowModel] = useState(false);
  const [showProbing, setShowProbing] = useState(false);
  const [selfScore, setSelfScore] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const subjects = COURSE_DATA[course] || [];
  const topicSuggestions = subject ? (TOPIC_SUGGESTIONS[subject] || []) : [];

  useEffect(() => { setSubject(''); setTopic(''); }, [course]);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(id); handleFinishSession(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft]);

  const startSession = async () => {
    if (!subject || !topic) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const qs = generateQuestions(topic, subject, parseInt(numQ), parseInt(totalMarks));
    setQuestions(qs); setCurrentQ(0); setResults([]);
    setUserAnswer(''); setShowModel(false); setShowProbing(false); setSelfScore(0);
    setTimeLeft(parseInt(timeAllowed) * 60); setTimerActive(true);
    setLoading(false); setStage('session');
  };

  const submitAnswer = () => {
    const q = questions[currentQ];
    const pct = selfScore / q.marks;
    const strength = pct >= 0.75 ? 'Good conceptual understanding and recall.' : pct >= 0.5 ? 'Adequate understanding with minor gaps.' : 'Basic understanding demonstrated.';
    const improvement = pct >= 0.75 ? 'Include recent advances and clinical correlations.' : pct >= 0.5 ? 'Elaborate on classifications and management steps.' : 'Revise definition, pathophysiology, and clinical features in detail.';
    const result: QuestionResult = { question: q, userAnswer, marksAwarded: selfScore, aiStrength: strength, aiImprovement: improvement };
    const newResults = [...results, result];
    setResults(newResults);
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1); setUserAnswer(''); setShowModel(false); setShowProbing(false); setSelfScore(0);
    } else { handleFinishSession(newResults); }
  };

  const handleFinishSession = (r?: QuestionResult[]) => {
    setTimerActive(false); setStage('report');
    if (r) setResults(r);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { alert('Speech recognition not supported in this browser.'); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
    rec.onresult = (e: any) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; setUserAnswer(p => p + t); };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec; rec.start(); setListening(true);
  };
  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  const totalScore = results.reduce((a, r) => a + r.marksAwarded, 0);
  const maxScore = questions.reduce((a, q) => a + q.marks, 0);
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const grade = pct >= 75 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 50 ? 'Average' : 'Needs Improvement';
  const gradeColor = pct >= 75 ? 'var(--success)' : pct >= 60 ? '#0EA5E9' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  const bloomCounts = results.reduce((acc, r) => { acc[r.question.bloomLevel] = (acc[r.question.bloomLevel] || 0) + 1; return acc; }, {} as Record<string,number>);
  const sessionDate = new Date().toLocaleDateString('en-CA');
  const reportName = subject && topic ? `${subject}_${topic}_${sessionDate}`.replace(/\s+/g,'_').replace(/[&]/g,'and') : 'VivaReport';

  const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">ðŸŽ™ï¸ Viva Simulator</h1>
        <p className="page-desc">Practice. Perform. Perfect. — AI-Powered Oral Examination & Performance Analytics System</p>
      </div>

      {stage === 'config' && (
        <div style={{ maxWidth: 860 }} className="animate-fadeIn">
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>âš™ï¸ Configure Viva Session</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Select Course *</label>
                <select className="input-field" value={course} onChange={e => setCourse(e.target.value)}>
                  {COURSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Select Subject *</label>
                <select className="input-field" value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Select / Type Topic *</label>
              <input className="input-field" list="topic-list" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Search or type topicâ€¦" />
              <datalist id="topic-list">{topicSuggestions.map(t => <option key={t} value={t}/>)}</datalist>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>ðŸŽ›ï¸ Viva Configuration</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 12, marginBottom: 16 }}>
              {VIVA_MODES.map(m => (
                <button key={m.id} onClick={() => setVivaMode(m.id)} className={`chip ${vivaMode === m.id ? 'active' : ''}`} style={{ padding:'8px 16px' }}>{m.icon} {m.label}</button>
              ))}
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label className="label">Total Marks</label>
                <select className="input-field" value={totalMarks} onChange={e => setTotalMarks(e.target.value)}>
                  {['10','20','25','50'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">No. of Questions</label>
                <select className="input-field" value={numQ} onChange={e => setNumQ(e.target.value)}>
                  {['5','10','15','20'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Difficulty Level</label>
                <select className="input-field" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  {['Easy','Moderate','Difficult','Mixed'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Time Allowed (minutes)</label>
                <select className="input-field" value={timeAllowed} onChange={e => setTimeAllowed(e.target.value)}>
                  {['5','10','15','20','30'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">AI Examiner Personality</label>
                <select className="input-field" value={persona} onChange={e => setPersona(e.target.value)}>
                  {EXAMINER_PERSONAS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Specific Instructions (Optional)</label>
              <textarea className="input-field" rows={2} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g., Focus on university viva questions, Ask clinically oriented questions, Include recent advancesâ€¦" />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <label className="label" style={{ margin:0 }}>Real-time Feedback after each answer:</label>
              <button onClick={() => setRealtimeFeedback(p => !p)} className={`chip ${realtimeFeedback ? 'active' : ''}`}>{realtimeFeedback ? '✅ Enabled' : '⬜ Disabled'}</button>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center', padding:'16px', fontSize:17 }}
            onClick={startSession} disabled={loading || !subject || !topic}>
            {loading ? <><span className="spinner" style={{ marginRight:8 }}/>Setting up AI Examinerâ€¦</> : 'ðŸŽ™ï¸ Start the Session'}
          </button>
        </div>
      )}

      {stage === 'session' && questions.length > 0 && (
        <div style={{ maxWidth: 800 }} className="animate-fadeIn">
          {/* Header bar */}
          <div className="card glass" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, padding:'14px 20px' }}>
            <div>
              <div style={{ fontWeight:700, fontSize:16 }}>{topic} — {subject}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{EXAMINER_PERSONAS.find(p=>p.id===persona)?.label} • {difficulty} • {numQ} Questions</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:22, fontWeight:800, fontFamily:'Outfit', color: timeLeft < 60 ? 'var(--danger)' : 'var(--primary-light)' }}>â± {fmtTime(timeLeft)}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>Time Remaining</div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-muted)', marginBottom:6 }}>
              <span>Question {currentQ+1} of {questions.length}</span>
              <span style={{ color: BLOOM_COLORS[questions[currentQ].bloomLevel] }}>🧠 {questions[currentQ].bloomLevel}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width:`${(currentQ/questions.length)*100}%` }}/></div>
          </div>

          <div className="card" style={{ marginBottom:16 }}>
            {/* AI Examiner bubble */}
            <div style={{ display:'flex', gap:12, marginBottom:20 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#6C3BFF,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🤖</div>
              <div style={{ flex:1, background:'var(--bg-surface)', borderRadius:'var(--radius-md)', padding:'14px 16px' }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>AI Examiner • Q{currentQ+1} • {questions[currentQ].marks} marks</div>
                <div style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)', lineHeight:1.6 }}>{questions[currentQ].question}</div>
              </div>
            </div>

            {/* Probing */}
            {showProbing && (
              <div style={{ marginLeft:56, marginBottom:16, padding:'10px 14px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:'var(--radius-sm)', fontSize:14, color:'var(--warning)' }}>
                ðŸ” <strong>Follow-up:</strong> {questions[currentQ].probingQuestion}
              </div>
            )}

            {/* Answer area */}
            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <label className="label" style={{ margin:0 }}>Your Answer</label>
                <div style={{ display:'flex', gap:8 }}>
                  <button className={`btn btn-sm ${listening ? 'btn-danger' : 'btn-secondary'}`} onClick={listening ? stopListening : startListening} style={{ padding:'4px 10px', fontSize:12 }}>
                    {listening ? 'â¹ Stop' : '🎤 Speak'}
                  </button>
                  {!showProbing && <button className="btn btn-secondary btn-sm" style={{ padding:'4px 10px', fontSize:12 }} onClick={() => setShowProbing(true)}>ðŸ” Probing Q</button>}
                </div>
              </div>
              <textarea className="input-field" rows={5} value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="Type your answer here, or use the mic to speak your answerâ€¦" />
            </div>

            {!showModel ? (
              <button className="btn btn-secondary" onClick={() => setShowModel(true)}>ðŸ‘ï¸ Show Model Answer</button>
            ) : (
              <>
                <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'var(--radius-md)', padding:16, marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--success)', marginBottom:8 }}>✅ Expected Answer / Key Points</div>
                  <div style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.8 }}>{questions[currentQ].modelAnswer}</div>
                </div>
                <div className="form-group">
                  <label className="label">Self-Assessment Score (out of {questions[currentQ].marks})</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {Array.from({ length: questions[currentQ].marks * 2 + 1 }, (_, i) => i/2).map(v => (
                      <button key={v} className={`chip ${selfScore === v ? 'active' : ''}`} onClick={() => setSelfScore(v)} style={{ minWidth:40 }}>{v}</button>
                    ))}
                  </div>
                </div>
                {realtimeFeedback && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                    <div style={{ padding:'12px 14px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'var(--radius-sm)' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'var(--success)', marginBottom:4 }}>✅ Strength</div>
                      <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{selfScore / questions[currentQ].marks >= 0.75 ? 'Good conceptual understanding and recall.' : selfScore / questions[currentQ].marks >= 0.5 ? 'Adequate understanding with minor gaps.' : 'Basic points mentioned.'}</div>
                    </div>
                    <div style={{ padding:'12px 14px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'var(--radius-sm)' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'var(--danger)', marginBottom:4 }}>📈 Improve</div>
                      <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{selfScore / questions[currentQ].marks >= 0.75 ? 'Include recent advances and clinical correlations.' : 'Elaborate on pathophysiology and management steps.'}</div>
                    </div>
                  </div>
                )}
                <button className="btn btn-primary" onClick={submitAnswer}>
                  {currentQ < questions.length - 1 ? 'Next Question →' : 'ðŸ Finish Viva →'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {stage === 'report' && (
        <div style={{ maxWidth: 860 }} className="animate-fadeIn">
          {/* Score card */}
          <div className="card glass" style={{ textAlign:'center', padding:'40px 20px', marginBottom:24 }}>
            <div style={{ fontSize:60, marginBottom:12 }}>{pct >= 75 ? 'ðŸ†' : pct >= 60 ? '🌟' : pct >= 50 ? 'ðŸ‘' : '📚'}</div>
            <h2 className="font-outfit" style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Viva Completed!</h2>
            <div style={{ fontSize:56, fontWeight:900, fontFamily:'Outfit', color:gradeColor, marginBottom:6 }}>{totalScore}/{maxScore}</div>
            <div style={{ fontSize:18, color:'var(--text-secondary)', marginBottom:16 }}>{pct}% — <strong style={{ color:gradeColor }}>{grade}</strong></div>
            <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap', marginBottom:20 }}>
              {[{ label:'Questions', val:`${results.length}/${questions.length}` },{ label:'Subject', val:subject },{ label:'Topic', val:topic },{ label:'Date', val:sessionDate }].map(item => (
                <div key={item.label} style={{ background:'var(--bg-surface)', borderRadius:'var(--radius-md)', padding:'10px 16px', minWidth:100 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{item.label}</div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
              <button className="btn btn-primary" onClick={() => { setStage('config'); setResults([]); setQuestions([]); }}>🔄 New Session</button>
              <button className="btn btn-secondary" onClick={() => window.print()}>ðŸ–¨ï¸ Print Report</button>
            </div>
          </div>

          {/* Bloom's Analysis */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="section-title" style={{ marginBottom:16 }}>🧠 Bloom's Taxonomy Analysis</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {Object.entries(bloomCounts).map(([level, count]) => (
                <div key={level} style={{ flex:'1 1 120px', background:'var(--bg-surface)', borderRadius:'var(--radius-md)', padding:'14px 16px', textAlign:'center', borderTop:`3px solid ${BLOOM_COLORS[level] || '#888'}` }}>
                  <div style={{ fontSize:22, fontWeight:800, color:BLOOM_COLORS[level] }}>{count}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{level}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths / Improvements */}
          <div className="grid-2" style={{ marginBottom:20 }}>
            <div className="card">
              <div style={{ fontWeight:700, color:'var(--success)', marginBottom:12 }}>✅ Strengths Identified</div>
              {results.filter(r => r.marksAwarded / r.question.marks >= 0.5).length > 0
                ? results.filter(r => r.marksAwarded / r.question.marks >= 0.5).map((r,i) => (
                  <div key={i} style={{ fontSize:13, padding:'6px 0', borderBottom:'1px solid var(--border)', color:'var(--text-secondary)' }}>✓ {r.aiStrength}</div>
                ))
                : <div style={{ fontSize:13, color:'var(--text-muted)' }}>Keep practicing to build strengths!</div>}
            </div>
            <div className="card">
              <div style={{ fontWeight:700, color:'var(--danger)', marginBottom:12 }}>📈 Areas for Improvement</div>
              {results.map((r,i) => (
                <div key={i} style={{ fontSize:13, padding:'6px 0', borderBottom:'1px solid var(--border)', color:'var(--text-secondary)' }}>• {r.aiImprovement}</div>
              ))}
            </div>
          </div>

          {/* Q-wise Analysis */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="section-title" style={{ marginBottom:16 }}>📋 Question-wise Analysis</div>
            {results.map((r, i) => (
              <div key={i} style={{ borderLeft:`4px solid ${r.marksAwarded >= r.question.marks * 0.75 ? 'var(--success)' : r.marksAwarded >= r.question.marks * 0.5 ? 'var(--warning)' : 'var(--danger)'}`, paddingLeft:16, marginBottom:20, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span className="badge badge-primary">Q{i+1}</span>
                  <span style={{ fontSize:13, fontWeight:700, color: r.marksAwarded >= r.question.marks * 0.75 ? 'var(--success)' : 'var(--warning)' }}>{r.marksAwarded}/{r.question.marks} marks</span>
                </div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>{r.question.question}</div>
                {r.userAnswer && (
                  <div style={{ fontSize:13, color:'var(--text-secondary)', background:'var(--bg-surface)', padding:'8px 12px', borderRadius:'var(--radius-sm)', marginBottom:8 }}>
                    <strong>Your Answer:</strong> {r.userAnswer || '(No answer typed)'}
                  </div>
                )}
                <div style={{ fontSize:13, color:'var(--text-secondary)', background:'rgba(16,185,129,0.06)', padding:'8px 12px', borderRadius:'var(--radius-sm)', marginBottom:8 }}>
                  <strong style={{ color:'var(--success)' }}>Expected:</strong> {r.question.modelAnswer}
                </div>
                <div style={{ display:'flex', gap:12, fontSize:12 }}>
                  <span style={{ color:'var(--success)' }}>✅ {r.aiStrength}</span>
                  <span style={{ color:'var(--danger)' }}>📈 {r.aiImprovement}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="section-title" style={{ marginBottom:16 }}>🤖 Personalized AI Recommendations</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
              {[
                { icon:'📖', title:'Topics to Revise', items:[topic,'Pathophysiology','Clinical Features','Management'] },
                { icon:'ðŸ†', title:'Competencies', items:['Knowledge Recall','Clinical Application','Analytical Thinking','Communication'] },
                { icon:'📚', title:'Study Resources', items:['Standard Textbooks','USMLE/NEXT Q-Bank','Previous Year Papers','Mnemonics'] },
                { icon:'ðŸŽ™ï¸', title:'Practice Next', items:[`${subject} — Related Topics`,'Case-Based Viva','Rapid Fire Mode','Peer Viva Practice'] },
              ].map((block,i) => (
                <div key={i} style={{ background:'var(--bg-surface)', borderRadius:'var(--radius-md)', padding:16 }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>{block.icon} {block.title}</div>
                  {block.items.map((item,j) => <div key={j} style={{ fontSize:13, color:'var(--text-secondary)', padding:'4px 0', borderBottom:'1px solid var(--border)' }}>• {item}</div>)}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding:'12px 16px', background:'var(--bg-surface)', borderRadius:'var(--radius-md)', fontSize:13, color:'var(--text-muted)', textAlign:'center' }}>
            💾 Report saved as: <strong style={{ color:'var(--text-primary)' }}>{reportName}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

