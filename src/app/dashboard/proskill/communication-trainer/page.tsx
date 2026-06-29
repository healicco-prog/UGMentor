'use client';
import React, { useState, useEffect, useRef } from 'react';

const COURSES = ['MBBS', 'BDS', 'BSc Nursing', 'Pharmacy'];
const ALL_SUBJECTS = ['Anatomy','Physiology','Biochemistry','Pathology','Microbiology','Pharmacology','Community Medicine','General Medicine','Pediatrics','Dermatology','Psychiatry','General Surgery','Orthopedics','Obstetrics & Gynaecology','Emergency Medicine','Forensic Medicine','ENT','Ophthalmology','Anesthesiology','Oral Medicine','Public Health Dentistry','Community Health Nursing','Medical-Surgical Nursing','Pharmacy Practice','Clinical Pharmacy'];
const SUBJECTS: Record<string, string[]> = {
  MBBS: ALL_SUBJECTS,
  BDS: ALL_SUBJECTS,
  'BSc Nursing': ALL_SUBJECTS,
  Pharmacy: ALL_SUBJECTS
};
const SCENARIOS = [
  'Diabetes Counseling (New Diagnosis)',
  'Hypertension Counseling (Lifestyle changes)',
  'Medication Adherence (Missed doses)',
  'Explain treatment options for Asthma',
  'Post-operative care instructions'
];

interface EvalResult {
  score: number;
  strengths: string[];
  improvements: string[];
}

export default function CommunicationTrainerPage() {
  const [course, setCourse] = useState('MBBS');
  const [subject, setSubject] = useState('');
  const [caseType, setCaseType] = useState('');
  const [customCase, setCustomCase] = useState('');

  const activeCase = caseType === 'Custom' ? customCase : caseType;

  // Session state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStage, setSessionStage] = useState<'idle' | 'ai_speaking' | 'user_recording' | 'analysing' | 'result'>('idle');
  const [question, setQuestion] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<EvalResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleStartSession = () => {
    if (!activeCase) return;
    setSessionStarted(true);
    const promptText = `Hello Doctor, I was just told that I have ${activeCase}. I'm really worried about what this means for my daily life. Can you explain this to me?`;
    setQuestion(`"${promptText}"`);
    setSessionStage('ai_speaking');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(promptText);
      utterance.rate = 0.9;
      utterance.onend = () => {
        startUserTurn();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        startUserTurn();
      }, 4000);
    }
  };

  const startUserTurn = () => {
    setSessionStage('user_recording');
    setUserTranscript('');
    setRecordingTime(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Start Voice Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setUserTranscript(currentTranscript);
      };
      
      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch(e) {
        console.error("Mic error", e);
      }
    }
  };

  const stopRecordingAndAnalyze = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    window.speechSynthesis.cancel();
    
    setSessionStage('analysing');
    
    try {
      const res = await fetch('/api/grade-proskill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: userTranscript, caseType: activeCase, type: 'communication' })
      });
      const data = await res.json();
      setEvaluation(data);
    } catch(e) {
      setEvaluation({
        score: 0,
        strengths: ['None'],
        improvements: ['Network error occurred during grading.']
      });
    }
    
    setSessionStage('result');
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const cleanUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    window.speechSynthesis.cancel();
    setSessionStarted(false);
  };

  useEffect(() => {
    return () => cleanUp(); // cleanup on unmount
  }, []);

  return (
    <div className="page-container" style={{ paddingBottom: 60 }}>
      <div className="page-header" style={{ marginBottom: 30 }}>
        <h1 className="page-title font-outfit" style={{ fontSize: 28, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🗣️</span> Communication Trainer
        </h1>
        <p className="page-desc">Doctor-Patient Communication & Patient Counseling Simulators</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sessionStarted ? '1fr' : '1fr', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
        
        {!sessionStarted ? (
          <div className="card shadow-sm animate-fadeIn" style={{ borderTop: '4px solid var(--primary)' }}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Configure Simulation Scenario</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Course</label>
                <select className="input-field" value={course} onChange={e => { setCourse(e.target.value); setSubject(''); }}>
                  {COURSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Subject</label>
                <select className="input-field" value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="">— Select —</option>
                  {(SUBJECTS[course] || []).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Clinical Case / Scenario</label>
                <select className="input-field" value={caseType} onChange={e => setCaseType(e.target.value)}>
                  <option value="">— Select —</option>
                  {SCENARIOS.map(s => <option key={s}>{s}</option>)}
                  <option value="Custom">Other (Custom Case)</option>
                </select>
              </div>
            </div>

            {caseType === 'Custom' && (
              <div className="form-group animate-fadeIn" style={{ marginBottom: 20 }}>
                <label className="label">Enter Custom Case / Condition</label>
                <input className="input-field" value={customCase} onChange={e => setCustomCase(e.target.value)} placeholder="e.g. Breaking news about a positive biopsy" />
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 30, padding: 30, background: '#F8FAFC', borderRadius: 8, border: '2px dashed #CBD5E1' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎙️ 🔊</div>
              <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text)' }}>Open Mic & Speaker</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>
                Ensure your microphone is connected and speakers are turned on. The AI will vocally present the patient's concern, and you will need to counsel them verbally.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ fontSize: 16, padding: '12px 24px', fontWeight: 700 }}
                onClick={handleStartSession}
                disabled={!activeCase}
              >
                Start Counseling Session
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, margin: 0 }}>Live Simulation Session</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Scenario: {activeCase}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={cleanUp}>
                ✕ End Session
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div className="card shadow-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', minHeight: 400, position: 'relative', overflow: 'hidden' }}>
                
                {sessionStage === 'ai_speaking' && (
                  <div className="animate-fadeIn" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 60, marginBottom: 20 }}>🔊</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>Patient is speaking...</div>
                    <div style={{ fontSize: 16, color: '#334155', fontStyle: 'italic', background: '#F1F5F9', padding: '16px 24px', borderRadius: 8, maxWidth: 600 }}>
                      {question}
                    </div>
                  </div>
                )}

                {sessionStage === 'user_recording' && (
                  <div className="animate-fadeIn" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, color: '#334155', fontStyle: 'italic', background: '#F8FAFC', padding: '12px 16px', borderRadius: 8, marginBottom: 20, border: '1px solid #E2E8F0', maxWidth: 600 }}>
                      Patient: {question}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 30, width: '100%', maxWidth: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#FEE2E2', border: '3px solid #EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite' }}>
                          <span style={{ fontSize: 24 }}>🎙️</span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#DC2626', fontFamily: 'monospace' }}>
                          {formatTime(recordingTime)}
                        </div>
                      </div>
                      
                      <div style={{ width: '100%', textAlign: 'left' }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>Live Transcript (Speak into mic or type manually)</label>
                        <textarea 
                          className="input-field" 
                          rows={4} 
                          value={userTranscript} 
                          onChange={e => setUserTranscript(e.target.value)}
                          placeholder="Speak your response clearly..."
                          style={{ width: '100%', resize: 'none' }}
                        />
                      </div>
                    </div>
                    
                    <button className="btn btn-primary" style={{ background: '#EF4444', borderColor: '#EF4444', padding: '10px 24px', fontSize: 15 }} onClick={stopRecordingAndAnalyze}>
                      ⏹ Stop Recording & Grade Response
                    </button>
                  </div>
                )}

                {sessionStage === 'analysing' && (
                  <div className="animate-fadeIn" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 40, marginBottom: 20, color: 'var(--primary)' }}>⚙️</div>
                    <h3 style={{ fontSize: 18, color: 'var(--primary)' }}>Analysing Communication with AI...</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Evaluating empathy, clarity, medical accuracy, and jargon usage based on your transcript.</p>
                  </div>
                )}

                {sessionStage === 'result' && evaluation && (
                  <div className="animate-fadeIn" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div style={{ fontSize: 48, marginBottom: 8 }}>🏅</div>
                      <h3 style={{ fontSize: 22, color: 'var(--text)' }}>Performance Evaluation</h3>
                      <div style={{ fontSize: 36, fontWeight: 800, color: evaluation.score > 60 ? '#10B981' : '#EF4444' }}>
                        {evaluation.score}/100
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ background: '#F0FDFA', padding: 16, borderRadius: 8, borderLeft: '4px solid #10B981' }}>
                        <div style={{ fontWeight: 700, color: '#047857', marginBottom: 8 }}>✅ Strengths</div>
                        <ul style={{ fontSize: 13, color: '#065F46', paddingLeft: 16, margin: 0 }}>
                          {evaluation.strengths.map((str, i) => <li key={i}>{str}</li>)}
                        </ul>
                      </div>
                      <div style={{ background: '#FEF2F2', padding: 16, borderRadius: 8, borderLeft: '4px solid #EF4444' }}>
                        <div style={{ fontWeight: 700, color: '#B91C1C', marginBottom: 8 }}>💡 Areas for Improvement</div>
                        <ul style={{ fontSize: 13, color: '#991B1B', paddingLeft: 16, margin: 0 }}>
                          {evaluation.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                        </ul>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 24, padding: 16, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14, color: '#334155' }}>Your Transcribed Response</div>
                      <p style={{ fontSize: 14, color: '#475569', fontStyle: 'italic', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {userTranscript || "No response recorded. Please ensure you speak into the mic or type in the transcript box."}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
                      <button className="btn btn-secondary" onClick={cleanUp}>↺ Retry Scenario</button>
                      <button className="btn btn-primary" onClick={() => alert('Results saved to Portfolio!')}>💾 Save Results for Analysis</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Guide */}
              <div className="card shadow-sm" style={{ background: '#F8FAFC' }}>
                <h3 style={{ fontSize: 16, marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>Scoring Criteria</h3>
                <ul style={{ fontSize: 13, color: '#334155', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li><strong>Empathy & Active Listening:</strong> Does the doctor validate emotions?</li>
                  <li><strong>Clarity & Jargon:</strong> Is the language simple enough for a layperson?</li>
                  <li><strong>Structure:</strong> Is the counseling logically organized?</li>
                  <li><strong>Check Understanding:</strong> Is the 'Teach-Back' method utilized?</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
