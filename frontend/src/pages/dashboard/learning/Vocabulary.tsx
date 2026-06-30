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
const WORD_COUNT_OPTIONS = [5, 10, 15, 20, 25, 30];

// â”€â”€â”€ Word type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface VocabWord {
  word: string;
  def: string;
  subject: string;
  course: string;
  learned: boolean;
}

const SEED_WORDS: VocabWord[] = [
  { word: 'Homeostasis', def: 'The tendency of biological systems to maintain relatively constant internal conditions despite changes in the external environment.', subject: 'Physiology', course: 'MBBS', learned: true },
  { word: 'Apoptosis', def: 'Programmed cell death — a natural, regulated process of cellular self-destruction.', subject: 'Pathology', course: 'MBBS', learned: true },
  { word: 'Ischemia', def: 'Insufficient blood supply to an organ or tissue, causing shortage of oxygen and glucose.', subject: 'General Medicine', course: 'MBBS', learned: false },
  { word: 'Synapse', def: 'The junction between the axon terminal of one neuron and the dendrite or cell body of another.', subject: 'Anatomy', course: 'MBBS', learned: false },
  { word: 'Dyspnea', def: 'Shortness of breath; difficult or labored breathing.', subject: 'General Medicine', course: 'MBBS', learned: true },
  { word: 'Etiology', def: 'The cause or set of causes of a disease or condition.', subject: 'Pathology', course: 'MBBS', learned: false },
];

// â”€â”€â”€ AI Connected Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function VocabularyPage() {
  const [ws, setWs] = useState<VocabWord[]>(SEED_WORDS);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');

  // Generate panel state
  const [genCourse, setGenCourse] = useState('');
  const [genSubjectList, setGenSubjectList] = useState<string[]>([]);
  const [genSubject, setGenSubject] = useState('');
  const [genCount, setGenCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<VocabWord[]>([]);

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [showDef, setShowDef] = useState(false);

  // When genCourse changes → update subject list
  useEffect(() => {
    if (genCourse) {
      const subs = COURSE_DATA[genCourse] || [];
      setGenSubjectList(subs);
      setGenSubject(subs[0] || '');
    } else {
      setGenSubjectList([]);
      setGenSubject('');
    }
    setLastGenerated([]);
  }, [genCourse]);

  const canGenerate = !!genCourse && !!genSubject;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setLastGenerated([]);
    
    try {
      const res = await fetch('/api/generate-vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: genCourse, subject: genSubject, count: genCount })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      const generated: VocabWord[] = data.words.map((w: any) => ({
        word: w.word,
        def: w.def,
        subject: genSubject,
        course: genCourse,
        learned: false
      }));
      setLastGenerated(generated);
    } catch (err: any) {
      alert(err.message || 'Error generating vocabulary.');
    } finally {
      setGenerating(false);
    }
  };

  const saveGenerated = () => {
    setWs(prev => {
      const existingWords = new Set(prev.map(w => w.word.toLowerCase()));
      const fresh = lastGenerated.filter(w => !existingWords.has(w.word.toLowerCase()));
      return [...prev, ...fresh];
    });
    setLastGenerated([]);
  };

  // Unique subjects for filter
  const allSubjects = ['All', ...Array.from(new Set(ws.map(w => w.subject)))];

  const filtered = ws.filter(w => {
    const matchSearch = w.word.toLowerCase().includes(search.toLowerCase()) || w.subject.toLowerCase().includes(search.toLowerCase());
    const matchSub = filterSubject === 'All' || w.subject === filterSubject;
    return matchSearch && matchSub;
  });

  const learned = ws.filter(w => w.learned).length;
  const toggleLearned = (word: string) => setWs(prev => prev.map(w => w.word === word ? { ...w, learned: !w.learned } : w));
  const unlearnedWords = ws.filter(w => !w.learned);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">📖 Vocabulary Builder</h1>
        <p className="page-desc">AI-generate medical vocabulary by course & subject, then master them with quiz mode.</p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(90deg, #6C3BFF, #8B5CF6)' } as React.CSSProperties}>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{ws.length}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Words</div>
        </div>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(90deg, #10B981, #34D399)' } as React.CSSProperties}>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{learned}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Words Learned</div>
        </div>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(90deg, #F59E0B, #FCD34D)' } as React.CSSProperties}>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
            {ws.length ? Math.round((learned / ws.length) * 100) : 0}%
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Mastery</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* â”€â”€ LEFT: Word List / Quiz â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div style={{ flex: 1, minWidth: 300 }}>
          {!quizMode ? (
            <>
              {/* Search + filter bar */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <input className="input-field" placeholder="ðŸ” Search wordsâ€¦" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
                <select className="input-field" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
                  {allSubjects.map(s => <option key={s}>{s}</option>)}
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => { setQuizMode(true); setQuizIdx(0); setShowDef(false); }}>🎯 Quiz Mode</button>
              </div>

              {/* Word cards */}
              {filtered.length === 0 ? (
                <div className="empty-state card">
                  <div className="empty-state-icon">ðŸ“­</div>
                  <div className="empty-state-title">No words found</div>
                  <div className="empty-state-desc">Generate words using the panel on the right.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map((w, i) => (
                    <div key={i} className="card" style={{ padding: '14px 18px', borderLeft: `3px solid ${w.learned ? 'var(--success)' : 'var(--border)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{w.word}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className="badge badge-primary" style={{ fontSize: 10 }}>{w.subject}</span>
                          <button onClick={() => toggleLearned(w.word)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                            {w.learned ? '✅' : '⬜'}
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{w.def}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{w.course}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Quiz Mode */
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              {unlearnedWords.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">ðŸŽ‰</div>
                  <div className="empty-state-title">All words learned!</div>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setQuizMode(false)}>Exit Quiz</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>
                    {quizIdx + 1} of {unlearnedWords.length} remaining
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', marginBottom: 12, color: 'var(--text-primary)' }}>
                    {unlearnedWords[quizIdx % unlearnedWords.length]?.word}
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
                    <span className="badge badge-primary">{unlearnedWords[quizIdx % unlearnedWords.length]?.subject}</span>
                    <span className="badge badge-secondary">{unlearnedWords[quizIdx % unlearnedWords.length]?.course}</span>
                  </div>
                  {!showDef ? (
                    <button className="btn btn-secondary" onClick={() => setShowDef(true)}>ðŸ‘ï¸ Show Definition</button>
                  ) : (
                    <>
                      <div className="ai-response" style={{ marginBottom: 20, textAlign: 'left' }}>
                        {unlearnedWords[quizIdx % unlearnedWords.length]?.def}
                      </div>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => { setQuizIdx(q => q + 1); setShowDef(false); }}>âŒ Not Yet</button>
                        <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' }}
                          onClick={() => { toggleLearned(unlearnedWords[quizIdx % unlearnedWords.length].word); setQuizIdx(q => q + 1); setShowDef(false); }}>✅ Got It!</button>
                      </div>
                    </>
                  )}
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 20 }} onClick={() => setQuizMode(false)}>Exit Quiz</button>
                </>
              )}
            </div>
          )}
        </div>

        {/* â”€â”€ RIGHT: Generate Words Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div style={{ width: 296, flexShrink: 0 }}>
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🤖 Generate New Words
            </div>

            {/* Step 1: Course */}
            <div className="form-group">
              <label className="label">
                <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, marginRight: 6 }}>1</span>
                Select Course
              </label>
              <select className="input-field" value={genCourse} onChange={e => setGenCourse(e.target.value)}>
                <option value="">— Select Course —</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Step 2: Subject (dynamic) */}
            <div className="form-group">
              <label className="label">
                <span style={{ background: genCourse ? 'var(--primary)' : 'var(--text-muted)', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, marginRight: 6 }}>2</span>
                Select Subject
              </label>
              <select
                className="input-field"
                value={genSubject}
                onChange={e => setGenSubject(e.target.value)}
                disabled={!genCourse}
                style={{ opacity: genCourse ? 1 : 0.5 }}
              >
                {!genCourse && <option value="">— Select Course first —</option>}
                {genSubjectList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Step 3: Number of words */}
            <div className="form-group">
              <label className="label">
                <span style={{ background: genSubject ? 'var(--primary)' : 'var(--text-muted)', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, marginRight: 6 }}>3</span>
                Number of Words
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {WORD_COUNT_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setGenCount(n)}
                    style={{
                      padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      border: `1.5px solid ${genCount === n ? 'var(--primary)' : 'var(--border)'}`,
                      background: genCount === n ? 'rgba(108,59,255,0.1)' : 'var(--bg-elevated)',
                      color: genCount === n ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: 'var(--transition)',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Will generate {genCount} medical terms for {genSubject || 'â€¦'}
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
            >
              {generating
                ? <><span className="spinner" style={{ marginRight: 8 }} />Generating {genCount} wordsâ€¦</>
                : `âœ¨ Generate ${genCount} Words`}
            </button>

            {!canGenerate && !generating && (
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Select course & subject to generate.
              </p>
            )}
          </div>

          {/* Generated word preview */}
          {lastGenerated.length > 0 && (
            <div className="card" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>✅ {lastGenerated.length} Words Generated</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{genSubject} Â· {genCourse}</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={saveGenerated}>💾 Save All</button>
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lastGenerated.map((w, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{w.word}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{w.def}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setLastGenerated([])}>Discard</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={saveGenerated}>💾 Add to Library</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

