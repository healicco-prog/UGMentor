'use client';
import React, { useState, useEffect } from 'react';

const COURSE_DATA: Record<string, string[]> = {
  MBBS: ['Anatomy','Physiology','Biochemistry','Pathology','Microbiology','Pharmacology','Community Medicine','General Medicine','Pediatrics','Dermatology','General Surgery','Orthopedics','Obstetrics & Gynaecology','Emergency Medicine'],
  BDS: ['Oral Pathology','Oral Medicine','Oral Surgery','Periodontology','Pediatric Dentistry','Conservative Dentistry'],
  'BSc Nursing': ['Adult Health Nursing','Child Health Nursing','Community Health Nursing','Mental Health Nursing','Midwifery'],
  'Allied Health Sciences': ['Physiology','Biochemistry','Anatomy','Pathology','Pharmacology'],
  Other: [],
};

const CLINICAL_CASES: Record<string, string[]> = {
  'General Medicine': ['Diabetes Mellitus','Hypertension','Cardiac Failure','Hepatitis B','Tuberculosis','Chronic Kidney Disease','Anaemia','COPD','Stroke'],
  'General Surgery': ['Acute Appendicitis','Inguinal Hernia','Thyroid Swelling','Peptic Ulcer Disease','Breast Lump','Bowel Obstruction'],
  'Pediatrics': ['Pneumonia','Dengue Fever','Malnutrition','Febrile Seizure','Meningitis','Neonatal Jaundice'],
  'Obstetrics & Gynaecology': ['Pre-eclampsia','PCOS','Fibroid Uterus','Ante-partum Haemorrhage'],
  'Emergency Medicine': ['Polytrauma','Acute Poisoning','Status Epilepticus','Cardiac Arrest','Anaphylaxis'],
};

// AI generator — simulates detailed clinical content per case
function generateContent(caseName: string, subject: string) {
  const history = `📋 HISTORY TEMPLATE — ${caseName}\n\n` +
    `CHIEF COMPLAINT:\n  • Patient presents with symptoms consistent with ${caseName}.\n\n` +
    `HISTORY OF PRESENTING ILLNESS (SOCRATES):\n` +
    `  • Site: Relevant anatomical region affected\n` +
    `  • Onset: Acute / subacute / chronic — specify duration\n` +
    `  • Character: Nature of the symptom (pain type, severity, etc.)\n` +
    `  • Radiation: Does it radiate? Where?\n` +
    `  • Associations: Associated symptoms (fever, vomiting, dyspnoea, etc.)\n` +
    `  • Time course: Constant / intermittent / progressive / episodic\n` +
    `  • Exacerbating & relieving factors: What makes it worse or better?\n` +
    `  • Severity: Score on a 1–10 scale; impact on daily activities\n\n` +
    `PAST MEDICAL HISTORY:\n` +
    `  • Previous episodes of ${caseName}\n` +
    `  • Chronic illnesses: DM, HTN, CKD, cardiac disease, TB\n` +
    `  • Hospitalizations / surgeries\n` +
    `  • Known allergies\n\n` +
    `DRUG HISTORY:\n` +
    `  • Current medications (name, dose, duration)\n` +
    `  • Over-the-counter / herbal medications\n\n` +
    `FAMILY HISTORY:\n` +
    `  • Similar condition in first-degree relatives\n` +
    `  • Genetic / hereditary conditions relevant to ${caseName}\n\n` +
    `SOCIAL HISTORY:\n` +
    `  • Occupation, smoking (pack-years), alcohol (units/week)\n` +
    `  • Diet, exercise, travel history\n` +
    `  • Living conditions, socio-economic status\n\n` +
    `REVIEW OF SYSTEMS:\n` +
    `  • Systemic enquiry — any relevant symptoms in other systems`;

  const checklist = [
    `General: Conscious, oriented to time/place/person`,
    `Vital Signs: BP (both arms), HR, RR, Temperature, SpO₂`,
    `Anthropometry: Weight, Height, BMI, Waist circumference`,
    `Build & Nutrition: Adequately built / malnourished`,
    `Pallor: Conjunctiva, palm, tongue`,
    `Icterus: Sclera, skin`,
    `Cyanosis: Peripheral & central — lips, tongue, fingertips`,
    `Clubbing: Grade I–IV, bilateral/unilateral`,
    `Lymphadenopathy: Cervical, axillary, inguinal — size, consistency, tenderness`,
    `Oedema: Pitting / non-pitting, distribution (ankle → sacral)`,
    `JVP: Height above sternal angle; waveform`,
    `Relevant system examination for ${caseName}`,
    `Cardiovascular: Heart sounds, murmurs, apex beat`,
    `Respiratory: Chest expansion, percussion, breath sounds`,
    `Abdomen: Inspection, palpation (organomegaly, tenderness), percussion, auscultation`,
    `Neurological: GCS, cranial nerves, motor, sensory, reflexes (if relevant)`,
    `Skin: Rashes, lesions, pigmentation`,
    `Fundoscopy: Retinal changes (if indicated)`,
    `Peripheral pulses: Radial, brachial, femoral, popliteal, dorsalis pedis`,
  ];

  const pearls = [
    `🔑 In ${caseName}: Always take a complete, systematic history — the diagnosis is often made from history alone.`,
    `💊 Correlate presenting symptoms with signs before forming a differential diagnosis.`,
    `🩺 Use the SOCRATES framework for any pain-related complaint to avoid missing key features.`,
    `⚕️ Always ask about drug history — many presentations are iatrogenic or drug-modified.`,
    `📊 For ${caseName} — key investigations: confirm with appropriate first-line tests before escalating.`,
    `⚠️ Identify and document red-flag symptoms that require urgent escalation or specialist referral.`,
    `📋 Document all findings in structured SOAP format: Subjective → Objective → Assessment → Plan.`,
    `🧠 Use clinical reasoning to distinguish ${caseName} from its closest differentials by key discriminating features.`,
    `🔬 Gold standard investigation for confirmation should always be documented with rationale.`,
    `💡 Patient safety: Never discharge without ensuring adequate follow-up plan and patient education.`,
  ];

  return { history, checklist, pearls };
}

interface SavedEntry {
  id: string;
  caseName: string;
  subject: string;
  course: string;
  history: string;
  checklist: string[];
  pearls: string[];
  savedAt: string;
}

const DB_KEY = 'ugmentor_bedside_db';

function loadDB(): SavedEntry[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); } catch { return []; }
}
function saveDB(entries: SavedEntry[]) {
  localStorage.setItem(DB_KEY, JSON.stringify(entries));
}

export default function BedsideCompanionPage() {
  const [view, setView] = useState<'generate' | 'library'>('generate');
  const [course, setCourse] = useState('MBBS');
  const [subject, setSubject] = useState('');
  const [clinicalCase, setClinicalCase] = useState('');
  const [customCase, setCustomCase] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ history: string; checklist: string[]; pearls: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'checklist' | 'pearls'>('history');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [savedMsg, setSavedMsg] = useState('');
  const [library, setLibrary] = useState<SavedEntry[]>([]);
  const [viewEntry, setViewEntry] = useState<SavedEntry | null>(null);

  useEffect(() => { setLibrary(loadDB()); }, []);

  const subjects = COURSE_DATA[course] || [];
  const cases = subject && CLINICAL_CASES[subject] ? CLINICAL_CASES[subject] : [];
  const activeCase = customCase.trim() || clinicalCase;

  const handleGenerate = async () => {
    if (!activeCase) return;
    setGenerating(true);
    setGenerated(null);
    setChecked({});
    await new Promise(r => setTimeout(r, 1800));
    setGenerated(generateContent(activeCase, subject));
    setActiveTab('history');
    setGenerating(false);
  };

  const handleSave = () => {
    if (!generated) return;
    const entry: SavedEntry = {
      id: Date.now().toString(),
      caseName: activeCase,
      subject, course,
      history: generated.history,
      checklist: generated.checklist,
      pearls: generated.pearls,
      savedAt: new Date().toLocaleString(),
    };
    const updated = [entry, ...loadDB()];
    saveDB(updated);
    setLibrary(updated);
    setSavedMsg('✅ Saved to library!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const handleDelete = (id: string) => {
    const updated = library.filter(e => e.id !== id);
    saveDB(updated);
    setLibrary(updated);
    if (viewEntry?.id === id) setViewEntry(null);
  };

  const checkedCount = generated ? generated.checklist.filter(i => checked[i]).length : 0;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title font-outfit">📋 Bedside Learning Companion</h1>
          <p className="page-desc">AI-generated History Templates, Examination Checklists & Clinical Pearls — saved to your library</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${view === 'generate' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('generate')}>✨ Generate</button>
          <button className={`btn ${view === 'library' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setView('library'); setViewEntry(null); }}>
            📚 Library {library.length > 0 && <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 999, padding: '1px 7px', fontSize: 11, marginLeft: 4 }}>{library.length}</span>}
          </button>
        </div>
      </div>

      {/* ── GENERATE VIEW ── */}
      {view === 'generate' && (
        <div style={{ maxWidth: 880 }}>
          {/* Config */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⚙️ Select Clinical Case</h2>
            <div className="grid-2" style={{ marginBottom: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Course</label>
                <select className="input-field" value={course} onChange={e => { setCourse(e.target.value); setSubject(''); setClinicalCase(''); setGenerated(null); }}>
                  {Object.keys(COURSE_DATA).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Subject / Department</label>
                <select className="input-field" value={subject} onChange={e => { setSubject(e.target.value); setClinicalCase(''); setGenerated(null); }}>
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Clinical Case</label>
                <select className="input-field" value={clinicalCase} onChange={e => { setClinicalCase(e.target.value); setCustomCase(''); setGenerated(null); }} disabled={!subject}>
                  <option value="">— Select Case —</option>
                  {cases.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">Custom Case</label>
                <input className="input-field" value={customCase} onChange={e => { setCustomCase(e.target.value); setClinicalCase(''); setGenerated(null); }} placeholder="e.g., Acute Appendicitis, Typhoid Fever…" />
              </div>
            </div>

            {activeCase && (
              <div style={{ marginTop: 14, padding: '8px 14px', background: 'rgba(108,59,255,0.07)', border: '1px solid rgba(108,59,255,0.18)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--primary-light)' }}>
                🏥 Ready to generate content for: <strong>{activeCase}</strong>
              </div>
            )}

            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: 14 }}
              onClick={handleGenerate} disabled={generating || !activeCase}>
              {generating
                ? <><span className="spinner" style={{ marginRight: 8 }} />AI is generating clinical content…</>
                : '🤖 Generate History Template, Checklist & Pearls'}
            </button>
          </div>

          {/* Generated Content */}
          {generated && (
            <div className="animate-fadeIn">
              {/* Header bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, fontFamily: 'Outfit' }}>✨ Generated: {activeCase}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{course} • {subject || 'Custom'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {savedMsg && <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>{savedMsg}</span>}
                  <button className="btn btn-primary" onClick={handleSave}>💾 Save to Library</button>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs" style={{ marginBottom: 20, width: '100%' }}>
                {[{ key: 'history', label: '📝 History Template' }, { key: 'checklist', label: `✅ Exam Checklist (${checkedCount}/${generated.checklist.length})` }, { key: 'pearls', label: '💡 Clinical Pearls' }].map(tab => (
                  <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setActiveTab(tab.key as typeof activeTab)}>{tab.label}</button>
                ))}
              </div>

              {activeTab === 'history' && (
                <div className="animate-fadeIn">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,#6C3BFF,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📋</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>AI-Generated History Template</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeCase}</div>
                      </div>
                    </div>
                    <span style={{ background: 'linear-gradient(135deg,#6C3BFF,#8B5CF6)', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>✨ AI Generated</span>
                  </div>
                  {generated.history.split('\n\n').map((section, si) => {
                    const lines = section.split('\n');
                    const heading = lines[0];
                    const body = lines.slice(1);
                    const colors = ['#6C3BFF','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6'];
                    const col = colors[si % colors.length];
                    return (
                      <div key={si} style={{ marginBottom: 14, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ background: `linear-gradient(135deg,${col}18,${col}08)`, borderBottom: `2px solid ${col}30`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, fontSize: 13, color: col }}>{heading.replace(/^[📋🏥💊👨‍👩‍👦🧑‍🤝‍🧑🔍]/u,'').trim()}</span>
                        </div>
                        <div style={{ padding: '12px 16px', background: 'var(--bg-card)' }}>
                          {body.map((line, li) => line.trim() && (
                            <div key={li} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: li < body.length - 1 ? '1px solid var(--border)' : 'none' }}>
                              <span style={{ color: col, fontWeight: 700, flexShrink: 0, fontSize: 13 }}>•</span>
                              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{line.replace(/^\s*•\s*/,'').trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'checklist' && (
                <div className="animate-fadeIn">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,#0EA5E9,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🩺</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Examination Checklist</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{checkedCount} of {generated.checklist.length} completed</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Outfit', color: checkedCount === generated.checklist.length ? 'var(--success)' : 'var(--primary)' }}>{Math.round((checkedCount/generated.checklist.length)*100)}%</div>
                    </div>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 999, marginBottom: 20, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#0EA5E9,#10B981)', width: `${(checkedCount / generated.checklist.length) * 100}%`, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {generated.checklist.map((item, i) => (
                      <div key={i} onClick={() => setChecked(p => ({ ...p, [item]: !p[item] }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: checked[item] ? 'rgba(16,185,129,0.07)' : 'var(--bg-card)', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `1px solid ${checked[item] ? 'rgba(16,185,129,0.35)' : 'var(--border)'}`, transition: 'all 0.18s', boxShadow: checked[item] ? '0 2px 8px rgba(16,185,129,0.1)' : 'none' }}>
                        <div style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${checked[item] ? 'var(--success)' : 'var(--border)'}`, background: checked[item] ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, color: 'white', fontWeight: 800, transition: 'all 0.18s' }}>
                          {checked[item] ? '✓' : ''}
                        </div>
                        <span style={{ fontSize: 13, color: checked[item] ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: checked[item] ? 'line-through' : 'none', lineHeight: 1.4 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  {checkedCount === generated.checklist.length && (
                    <div style={{ marginTop: 16, padding: '16px 20px', background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(14,165,233,0.08))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--success)', fontWeight: 700, fontSize: 15 }}>
                      🎉 Excellent! Examination Complete — Document your findings now.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pearls' && (
                <div className="animate-fadeIn">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,#F59E0B,#EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💡</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>Clinical Pearls</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeCase} — {generated.pearls.length} key insights</div>
                    </div>
                  </div>
                  {generated.pearls.map((pearl, i) => {
                    const pearlColors = ['#6C3BFF','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6','#0EA5E9','#10B981','#F59E0B'];
                    const col = pearlColors[i % pearlColors.length];
                    return (
                      <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', marginBottom: 10, border: `1px solid ${col}25`, borderLeft: `4px solid ${col}`, boxShadow: `0 2px 8px ${col}10`, transition: 'all 0.2s' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${col}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: col }}>{i + 1}</div>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{pearl}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSave}>
                💾 Save All to Library
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── LIBRARY VIEW ── */}
      {view === 'library' && (
        <div style={{ maxWidth: 1060 }}>
          {!viewEntry ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>📚 Saved Library ({library.length})</div>
                {library.length > 0 && (
                  <button className="btn btn-secondary btn-sm" onClick={() => { if (confirm('Clear entire library?')) { saveDB([]); setLibrary([]); } }}>🗑️ Clear All</button>
                )}
              </div>

              {library.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: 'var(--text-secondary)' }}>No saved entries yet</div>
                  <div style={{ fontSize: 13, marginBottom: 20 }}>Generate content and save it to your library to access it anytime.</div>
                  <button className="btn btn-primary" onClick={() => setView('generate')}>✨ Generate Now</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                  {library.map((entry, idx) => {
                    const cardColors = ['#6C3BFF','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899'];
                    const col = cardColors[idx % cardColors.length];
                    return (
                      <div key={entry.id} onClick={() => setViewEntry(entry)}
                        style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 0, cursor: 'pointer', border: '1px solid var(--border)', overflow: 'hidden', transition: 'all 0.2s', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 24px ${col}20`, e.currentTarget.style.borderColor = `${col}50`, e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)', e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.transform = 'none')}>
                        <div style={{ background: `linear-gradient(135deg,${col}20,${col}08)`, padding: '16px 18px', borderBottom: `2px solid ${col}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${col}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: col }}>{entry.caseName}</div>
                          </div>
                          <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)', borderRadius: 6, padding: '3px 9px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                            onClick={e => { e.stopPropagation(); handleDelete(entry.id); }}>✕</button>
                        </div>
                        <div style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{entry.course} • {entry.subject || 'Custom'}</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            <span style={{ background: 'rgba(108,59,255,0.1)', color: 'var(--primary-light)', border: '1px solid rgba(108,59,255,0.2)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>📝 History</span>
                            <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>✅ {entry.checklist.length} Checks</span>
                            <span style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>💡 {entry.pearls.length} Pearls</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🕐 {entry.savedAt}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Entry detail view */
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, fontFamily: 'Outfit' }}>🏥 {viewEntry.caseName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{viewEntry.course} • {viewEntry.subject || 'Custom'} • Saved: {viewEntry.savedAt}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setViewEntry(null)}>← Back to Library</button>
                  <button className="btn btn-danger btn-sm" onClick={() => { handleDelete(viewEntry.id); setViewEntry(null); }}>🗑️ Delete</button>
                </div>
              </div>

              <div className="tabs" style={{ marginBottom: 20, width: '100%' }}>
                {[{ key: 'history', label: '📝 History Template' }, { key: 'checklist', label: `✅ Checklist (${viewEntry.checklist.length})` }, { key: 'pearls', label: '💡 Pearls' }].map(tab => (
                  <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setActiveTab(tab.key as typeof activeTab)}>{tab.label}</button>
                ))}
              </div>

              {activeTab === 'history' && (
                <div className="card animate-fadeIn">
                  <pre style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                    {viewEntry.history}
                  </pre>
                </div>
              )}
              {activeTab === 'checklist' && (
                <div className="card animate-fadeIn">
                  {viewEntry.checklist.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: 8, border: '1px solid var(--border)' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid var(--border)', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'pearls' && (
                <div className="card animate-fadeIn">
                  {viewEntry.pearls.map((pearl, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: 10, border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>💎</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75 }}>{pearl}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
