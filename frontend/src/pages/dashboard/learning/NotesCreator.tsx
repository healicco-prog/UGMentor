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

// â”€â”€â”€ Note Type options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NOTE_TYPES = [
  {
    id: 'detailed',
    label: 'Detailed Notes',
    desc: '~1500 words Â· Full explanations, clinical correlations & exam Q&A',
    icon: '📖',
    words: 1500,
  },
  {
    id: 'summary',
    label: 'Brief Summary',
    desc: '~750 words Â· Concise bullet points for quick revision',
    icon: 'âš¡',
    words: 750,
  },
];

// â”€â”€â”€ AI Note Generation endpoint connected â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€â”€ Saved Note type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface SavedNote {
  id: string;
  course: string;
  subject: string;
  topic: string;
  noteType: string;
  content: string;
  createdAt: string;
  wordCount: number;
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function NotesCreatorPage() {
  // Selection state
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [noteType, setNoteType] = useState('detailed');

  // Output state
  const [generatedNote, setGeneratedNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([
    {
      id: '1',
      course: 'MBBS',
      subject: 'Anatomy',
      topic: 'Brachial Plexus',
      noteType: 'detailed',
      content: '# Brachial Plexus...',
      createdAt: '2026-06-15',
      wordCount: 1512,
    },
    {
      id: '2',
      course: 'MBBS',
      subject: 'Physiology',
      topic: 'Cardiac Cycle',
      noteType: 'summary',
      content: '# Cardiac Cycle Summary...',
      createdAt: '2026-06-16',
      wordCount: 762,
    },
  ]);
  const [selectedSaved, setSelectedSaved] = useState<SavedNote | null>(null);

  // When course changes → reset subject and update list
  useEffect(() => {
    if (course) {
      const subs = COURSE_DATA[course] || [];
      setSubjectList(subs);
      setSubject('');
    } else {
      setSubjectList([]);
      setSubject('');
    }
    setGeneratedNote('');
  }, [course]);

  const canGenerate = !!course && !!subject && topic.trim().length > 2;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setGeneratedNote('');
    
    try {
      const res = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, subject, topic: topic.trim(), noteType })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedNote(data.content);
    } catch (err: any) {
      alert(err.message || 'Error generating notes.');
    } finally {
      setEditMode(false);
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedNote || !course || !subject || !topic) return;
    const wordCount = generatedNote.split(/\s+/).length;
    const newNote: SavedNote = {
      id: Date.now().toString(),
      course, subject,
      topic: topic.trim(),
      noteType,
      content: generatedNote,
      createdAt: new Date().toISOString().split('T')[0],
      wordCount,
    };
    setSavedNotes(prev => [newNote, ...prev]);
    // Reset form
    setCourse('');
    setSubject('');
    setTopic('');
    setGeneratedNote('');
  };

  const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">ðŸ“ Notes Creator</h1>
        <p className="page-desc">Select Course → Subject → Topic, choose note type, then generate & save AI-powered notes.</p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* â”€â”€ LEFT: Creator Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div style={{ flex: 1, minWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Step 1-3: Selectors */}
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              âœ¨ Create New Note
            </div>

            {/* STEP 1 — Course */}
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

            {/* STEP 2 — Subject (depends on course) */}
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
              {!course && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Select a course first</p>}
            </div>

            {/* STEP 3 — Topic */}
            <div className="form-group">
              <label className="label">
                <span style={{ background: subject ? 'var(--primary)' : 'var(--text-muted)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginRight: 6 }}>3</span>
                Topic
              </label>
              <input
                className="input-field"
                placeholder="e.g., Mechanism of Action of Beta Blockers"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={!subject}
                style={{ opacity: subject ? 1 : 0.5, cursor: subject ? 'text' : 'not-allowed' }}
              />
              {!subject && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Select a subject first</p>}
            </div>

            {/* STEP 4 — Note Type */}
            <div className="form-group" style={{ marginBottom: 4 }}>
              <label className="label">
                <span style={{ background: topic.trim().length > 2 ? 'var(--primary)' : 'var(--text-muted)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginRight: 6 }}>4</span>
                Note Type
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                {NOTE_TYPES.map(nt => (
                  <button
                    key={nt.id}
                    onClick={() => setNoteType(nt.id)}
                    style={{
                      flex: 1, padding: '14px 12px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                      cursor: 'pointer', transition: 'var(--transition)',
                      border: `2px solid ${noteType === nt.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: noteType === nt.id ? 'rgba(108,59,255,0.06)' : 'var(--bg-elevated)',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{nt.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: noteType === nt.id ? 'var(--primary)' : 'var(--text-primary)', marginBottom: 4 }}>{nt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{nt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '13px 20px', fontSize: 15 }}
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
            >
              {generating
                ? <><span className="spinner" style={{ marginRight: 8 }} />Generating {noteType === 'detailed' ? '~1500' : '~750'} wordsâ€¦</>
                : `🤖 Generate ${NOTE_TYPES.find(n => n.id === noteType)?.label}`}
            </button>

            {!canGenerate && !generating && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                Complete all 3 steps above to generate notes.
              </p>
            )}
          </div>

          {/* Generated Note Output */}
          {generatedNote && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {NOTE_TYPES.find(n => n.id === noteType)?.icon} Generated Note
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {course} Â· {subject} Â· {topic} — <strong>{countWords(generatedNote).toLocaleString()} words</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(!editMode)}>
                    {editMode ? 'ðŸ‘ï¸ View' : 'âœï¸ Edit'}
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}>
                    💾 Save Note
                  </button>
                </div>
              </div>

              {/* Note content */}
              <div style={{ padding: '20px 24px' }}>
                <style>{`
                  .md-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
                  .md-th { border: 1px solid var(--border); padding: 10px 14px; background: var(--bg-surface); font-weight: 600; color: var(--text-primary); white-space: nowrap; }
                  .md-td { border: 1px solid var(--border); padding: 10px 14px; vertical-align: top; min-width: 120px; }
                  .md-pre { overflow-x: auto; -webkit-overflow-scrolling: touch; background: var(--bg-elevated); padding: 16px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px; line-height: 1.5; white-space: pre; margin-bottom: 16px; color: var(--text-primary); }
                  @media (max-width: 768px) {
                    .md-table { font-size: 12px; }
                    .md-th, .md-td { padding: 8px 10px; min-width: 100px; }
                    .md-pre { font-size: 11px; padding: 12px; }
                  }
                `}</style>
                {editMode ? (
                  <textarea
                    className="input-field"
                    rows={24}
                    value={generatedNote}
                    onChange={e => setGeneratedNote(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }}
                  />
                ) : (
                  <div className="ai-response markdown-body" style={{ maxHeight: 600, overflowY: 'auto', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => <div style={{ overflowX: 'auto', width: '100%', marginBottom: '16px' }}><table className="md-table" {...props} /></div>,
                        th: ({node, ...props}) => <th className="md-th" {...props} />,
                        td: ({node, ...props}) => <td className="md-td" {...props} />,
                        pre: ({node, ...props}) => <pre className="md-pre" {...props} />,
                        code: ({node, className, children, ...props}: any) => {
                          const isBlock = /language-(\w+)/.test(className || '') || String(children).includes('\n');
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
                )}
              </div>

              {/* Save footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '0 24px 20px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setGeneratedNote('')}>ðŸ—‘ï¸ Discard</button>
                <button className="btn btn-primary" onClick={handleSave}>💾 Save to My Notes</button>
              </div>
            </div>
          )}
        </div>

        {/* â”€â”€ RIGHT: Saved Notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📚 My Saved Notes</span>
              <span className="badge badge-primary">{savedNotes.length}</span>
            </div>

            {savedNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>ðŸ“­</div>
                No saved notes yet. Generate one!
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{n.topic}</span>
                      <span className={`badge ${n.noteType === 'detailed' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: 10, flexShrink: 0 }}>
                        {n.noteType === 'detailed' ? '📖 Detailed' : 'âš¡ Summary'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{n.course} Â· {n.subject}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {n.createdAt} Â· ~{n.wordCount.toLocaleString()} words
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview selected saved note */}
          {selectedSaved && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedSaved.topic}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => {
                      const printContent = document.getElementById(`printable-note-${selectedSaved.id}`)?.innerHTML;
                      if (!printContent) return;
                      const printWindow = window.open('', '', 'width=800,height=900');
                      if (!printWindow) return;
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>${selectedSaved.topic} - UGMentor Notes</title>
                            <style>
                              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                              h1, h2, h3 { color: #000; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-top: 24px; }
                              table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
                              th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
                              th { background-color: #f8f9fa; font-weight: 600; }
                              code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
                              pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid #e2e8f0; }
                              @media print {
                                body { padding: 0; }
                                @page { margin: 1.5cm; }
                              }
                            </style>
                          </head>
                          <body>
                            <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #6C3BFF;">
                              <h1 style="border:none; margin:0; padding:0; color: #6C3BFF;">UGMentor Study Notes</h1>
                              <p style="margin: 5px 0 0; color: #666;">Course: ${selectedSaved.course} | Subject: ${selectedSaved.subject}</p>
                            </div>
                            ${printContent}
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
                    â¬‡ï¸ Download PDF
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSaved(null)} style={{ padding: '2px 8px' }}>âœ•</button>
                </div>
              </div>
              <div className="markdown-body" id={`printable-note-${selectedSaved.id}`} style={{ padding: 16, maxHeight: 360, overflowY: 'auto', fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
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

