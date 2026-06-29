'use client';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const COURSE_DATA: Record<string, string[]> = {
  MBBS: [
    'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Microbiology',
    'Pharmacology', 'Forensic Medicine & Toxicology', 'Community Medicine',
    'Ophthalmology', 'ENT', 'General Medicine', 'Pediatrics', 'Dermatology',
    'Psychiatry', 'General Surgery', 'Orthopedics', 'Obstetrics & Gynaecology',
    'Anesthesia', 'Radiology', 'Emergency Medicine',
  ],
  BDS: [
    'General Human Anatomy incl. Embryology & Histology', 'General Physiology',
    'Biochemistry, Nutrition and Dietetics', 'Dental Anatomy & Oral Histology',
    'General Pathology', 'Microbiology',
    'General & Dental Pharmacology and Therapeutics', 'Dental Materials',
    'Preclinical Prosthodontics & Crown & Bridge', 'Preclinical Conservative Dentistry',
    'General Medicine', 'General Surgery', 'Oral Pathology & Oral Microbiology',
    'Oral Medicine and Radiology', 'Oral & Maxillofacial Surgery', 'Periodontology',
    'Pediatric & Preventive Dentistry', 'Conservative Dentistry & Endodontics',
    'Prosthodontics & Crown & Bridge', 'Orthodontics & Dentofacial Orthopaedics',
  ],
  'BSc Nursing': [
    'Applied Anatomy', 'Applied Physiology', 'Applied Biochemistry',
    'Applied Microbiology & Infection Control', 'Applied Nutrition & Dietetics',
    'Applied Psychology', 'Applied Sociology', 'Genetics',
    'Nursing Foundations I', 'Nursing Foundations II',
    'Adult Health Nursing I', 'Adult Health Nursing II',
    'Child Health Nursing I & II', 'Community Health Nursing I & II',
    'Mental Health Nursing I & II', 'Midwifery / OBG Nursing I & II',
    'Pathology I & II', 'Pharmacology I & II',
    'Nursing Education & Technology', 'Nursing Management & Leadership',
    'Nursing Research & Statistics',
  ],
};

const COURSES = Object.keys(COURSE_DATA);

interface SavedMnemonic {
  id: string;
  course: string;
  subject: string;
  topic: string;
  content: string;
  createdAt: string;
}

export default function MnemonicGeneratorPage() {
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');

  const [generatedNote, setGeneratedNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedMnemonic[]>([]);
  const [selectedSaved, setSelectedSaved] = useState<SavedMnemonic | null>(null);

  useEffect(() => {
    if (course) {
      setSubjectList(COURSE_DATA[course] || []);
      setSubject('');
    } else {
      setSubjectList([]);
      setSubject('');
    }
    setGeneratedNote('');
  }, [course]);

  const canGenerate = !!course && !!subject && topic.trim().length > 2 && content.trim().length > 5;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setGeneratedNote('');
    
    try {
      const res = await fetch('/api/generate-mnemonic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, subject, topic: topic.trim(), content: content.trim() })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedNote(data.content);
    } catch (err: any) {
      alert(err.message || 'Error generating mnemonics.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedNote || !course || !subject || !topic) return;
    const newNote: SavedMnemonic = {
      id: Date.now().toString(),
      course, subject,
      topic: topic.trim(),
      content: generatedNote,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSavedNotes(prev => [newNote, ...prev]);
    setCourse('');
    setSubject('');
    setTopic('');
    setContent('');
    setGeneratedNote('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">🧠 Mnemonic Generator</h1>
        <p className="page-desc">Enter a topic and specific facts to generate memorable, medically accurate mnemonics instantly.</p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* ── LEFT: Creator Form ──────────────────────────── */}
        <div style={{ flex: 1, minWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✨ Create New Mnemonic
            </div>

            <div className="form-group">
              <label className="label">
                <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginRight: 6 }}>1</span>
                Course
              </label>
              <select className="input-field" value={course} onChange={e => setCourse(e.target.value)}>
                <option value="">— Select Course —</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">
                <span style={{ background: course ? 'var(--primary)' : 'var(--text-muted)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginRight: 6 }}>2</span>
                Subject
              </label>
              <select
                className="input-field"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                disabled={!course}
                style={{ opacity: course ? 1 : 0.5, cursor: course ? 'pointer' : 'not-allowed' }}
              >
                <option value="">— Select Subject —</option>
                {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">
                <span style={{ background: subject ? 'var(--primary)' : 'var(--text-muted)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginRight: 6 }}>3</span>
                Topic
              </label>
              <input
                className="input-field"
                placeholder="e.g., Causes of Acute Pancreatitis"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={!subject}
                style={{ opacity: subject ? 1 : 0.5, cursor: subject ? 'text' : 'not-allowed' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label">
                <span style={{ background: topic.trim().length > 2 ? 'var(--primary)' : 'var(--text-muted)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginRight: 6 }}>4</span>
                Content to Memorize
              </label>
              <textarea
                className="input-field"
                placeholder="List the specific facts, drugs, or causes you want a mnemonic for... (e.g., Gallstones, Ethanol, Trauma, Steroids...)"
                rows={4}
                value={content}
                onChange={e => setContent(e.target.value)}
                disabled={!topic}
                style={{ opacity: topic ? 1 : 0.5, cursor: topic ? 'text' : 'not-allowed' }}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 15 }}
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
            >
              {generating
                ? <><span className="spinner" style={{ marginRight: 8 }} />Generating Mnemonics…</>
                : `🤖 Generate Mnemonics`}
            </button>
          </div>

          {generatedNote && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>🧠 Generated Mnemonics</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{course} · {subject} · {topic}</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleSave}>💾 Save to My Mnemonics</button>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <style>{`
                  .md-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
                  .md-th { border: 1px solid var(--border); padding: 10px 14px; background: var(--bg-surface); font-weight: 600; color: var(--text-primary); white-space: nowrap; }
                  .md-td { border: 1px solid var(--border); padding: 10px 14px; vertical-align: top; min-width: 120px; }
                  .md-pre { overflow-x: auto; -webkit-overflow-scrolling: touch; background: var(--bg-elevated); padding: 16px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px; line-height: 1.5; white-space: pre; margin-bottom: 16px; color: var(--text-primary); }
                `}</style>
                <div className="ai-response markdown-body" style={{ maxHeight: 600, overflowY: 'auto', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => <div style={{ overflowX: 'auto', width: '100%', marginBottom: '16px' }}><table className="md-table" {...props} /></div>,
                      th: ({node, ...props}) => <th className="md-th" {...props} />,
                      td: ({node, ...props}) => <td className="md-td" {...props} />,
                      pre: ({node, ...props}) => <pre className="md-pre" {...props} />,
                      code: ({node, className, children, ...props}: any) => {
                        const isBlock = /language-(\w+)/.test(className || '') || String(children).includes('\\n');
                        return isBlock ? (
                          <code style={{ fontFamily: 'monospace', background: 'transparent', padding: 0, color: 'inherit' }} {...props}>{children}</code>
                        ) : (
                          <code style={{ background: 'rgba(108,59,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px', color: 'var(--primary)' }} {...props}>{children}</code>
                        );
                      }
                    }}
                  >
                    {generatedNote}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Saved Notes ──────────────────────────── */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📚 Saved Mnemonics</span>
              <span className="badge badge-primary">{savedNotes.length}</span>
            </div>

            {savedNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                No mnemonics saved yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {savedNotes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedSaved(selectedSaved?.id === n.id ? null : n)}
                    style={{
                      padding: '12px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer',
                      border: `1px solid ${selectedSaved?.id === n.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: selectedSaved?.id === n.id ? 'rgba(108,59,255,0.05)' : 'var(--bg-elevated)',
                      transition: 'var(--transition)', color: 'inherit',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{n.topic}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{n.course} · {n.subject}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSaved && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedSaved.topic}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSaved(null)} style={{ padding: '2px 8px' }}>✕</button>
              </div>
              <div className="markdown-body" style={{ padding: 16, maxHeight: 360, overflowY: 'auto', fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({node, ...props}) => <div style={{ overflowX: 'auto', width: '100%', marginBottom: '16px' }}><table className="md-table" {...props} /></div>,
                    th: ({node, ...props}) => <th className="md-th" {...props} />,
                    td: ({node, ...props}) => <td className="md-td" {...props} />,
                    pre: ({node, ...props}) => <pre className="md-pre" {...props} />,
                    code: ({node, className, children, ...props}: any) => {
                      const isBlock = /language-(\w+)/.test(className || '') || String(children).includes('\\n');
                      return isBlock ? (
                        <code style={{ fontFamily: 'monospace', background: 'transparent', padding: 0, color: 'inherit' }} {...props}>{children}</code>
                      ) : (
                        <code style={{ background: 'rgba(108,59,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px', color: 'var(--primary)' }} {...props}>{children}</code>
                      );
                    }
                  }}
                >
                  {selectedSaved.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
