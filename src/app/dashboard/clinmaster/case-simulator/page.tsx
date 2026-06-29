'use client';
import React, { useState } from 'react';

const COURSE_DATA: Record<string, string[]> = {
  MBBS: ['Anatomy','Physiology','Biochemistry','Pathology','Microbiology','Pharmacology','Community Medicine','Ophthalmology','ENT','General Medicine','Pediatrics','Dermatology','Psychiatry','General Surgery','Orthopedics','Obstetrics & Gynaecology','Anaesthesiology','Radiology','Emergency Medicine'],
  BDS: ['Dental Anatomy','Oral Pathology','Oral Medicine','Oral Surgery','Periodontology','Pediatric Dentistry','Conservative Dentistry','Prosthodontics','Orthodontics'],
  'BSc Nursing': ['Anatomy','Physiology','Biochemistry','Nursing Foundations','Adult Health Nursing','Child Health Nursing','Community Health Nursing','Mental Health Nursing','Midwifery','Pharmacology'],
  'Allied Health Sciences': ['Physiology','Biochemistry','Anatomy','Pathology','Pharmacology','Community Health'],
  Other: [],
};

const CLINICAL_CASES: Record<string, string[]> = {
  'General Medicine': ['Diabetic Ketoacidosis','Hypertensive Crisis','Acute MI','Pulmonary Embolism','Septic Shock','Community-acquired Pneumonia','Acute Kidney Injury','Stroke','GI Bleed','Anaphylaxis'],
  'Pediatrics': ['Febrile Seizure','Severe Acute Malnutrition','Bronchial Asthma Attack','Acute Gastroenteritis with Dehydration','Meningitis','Neonatal Jaundice','Pneumonia'],
  'General Surgery': ['Acute Appendicitis','Bowel Obstruction','Inguinal Hernia','Peptic Ulcer Perforation','Trauma Assessment','Thyroid Nodule','Breast Lump'],
  'Obstetrics & Gynaecology': ['Pre-eclampsia','Ectopic Pregnancy','Antepartum Haemorrhage','Postpartum Haemorrhage','PCOS','Fibroid Uterus'],
  'Emergency Medicine': ['Polytrauma','Cardiac Arrest','Status Epilepticus','Diabetic Emergency','Acute Poisoning','Airway Emergency'],
};

type Stage = 'config' | 'history' | 'examination' | 'diagnosis' | 'management' | 'feedback';

export default function ClinicalCaseSimulatorPage() {
  const [course, setCourse] = useState('MBBS');
  const [subject, setSubject] = useState('');
  const [clinicalCase, setClinicalCase] = useState('');
  const [customCase, setCustomCase] = useState('');
  const [stage, setStage] = useState<Stage>('config');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState({ chiefComplaint: '', hpi: '', pmh: '', medications: '', allergies: '', socialHistory: '', familyHistory: '', ros: '' });
  const [examination, setExamination] = useState({ vitals: '', general: '', systemic: '', specific: '' });
  const [diagnosis, setDiagnosis] = useState({ primary: '', differentials: '', investigations: '' });
  const [management, setManagement] = useState({ immediate: '', medications: '', monitoring: '', followup: '' });

  const subjects = COURSE_DATA[course] || [];
  const cases = subject && CLINICAL_CASES[subject] ? CLINICAL_CASES[subject] : [];
  const activeCase = customCase || clinicalCase;

  const handleStart = async () => {
    if (!subject || !activeCase) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStage('history');
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const STAGES: { key: Stage; label: string; icon: string }[] = [
    { key: 'history', label: 'History Taking', icon: '📝' },
    { key: 'examination', label: 'Clinical Examination', icon: '🩺' },
    { key: 'diagnosis', label: 'Diagnosis', icon: '🔍' },
    { key: 'management', label: 'Management', icon: '💊' },
    { key: 'feedback', label: 'AI Feedback', icon: '📊' },
  ];
  const stageIdx = STAGES.findIndex(s => s.key === stage);

  const resetCase = () => {
    setStage('config');
    setHistory({ chiefComplaint:'',hpi:'',pmh:'',medications:'',allergies:'',socialHistory:'',familyHistory:'',ros:'' });
    setExamination({ vitals:'',general:'',systemic:'',specific:'' });
    setDiagnosis({ primary:'',differentials:'',investigations:'' });
    setManagement({ immediate:'',medications:'',monitoring:'',followup:'' });
    setClinicalCase(''); setCustomCase('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">🏥 Clinical Case Simulator</h1>
        <p className="page-desc">Virtual Patient Encounters — History, Examination, Diagnosis & Management with AI Feedback</p>
      </div>

      {stage === 'config' && (
        <div style={{ maxWidth: 780 }} className="animate-fadeIn">
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>⚙️ Select Clinical Scenario</h2>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="label">Course *</label>
                <select className="input-field" value={course} onChange={e => { setCourse(e.target.value); setSubject(''); setClinicalCase(''); }}>
                  {Object.keys(COURSE_DATA).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Subject / Department *</label>
                <select className="input-field" value={subject} onChange={e => { setSubject(e.target.value); setClinicalCase(''); }}>
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Select Clinical Case</label>
              <select className="input-field" value={clinicalCase} onChange={e => setClinicalCase(e.target.value)} disabled={!subject}>
                <option value="">— Select a Case —</option>
                {cases.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Or Type Custom Clinical Presentation</label>
              <input className="input-field" value={customCase} onChange={e => setCustomCase(e.target.value)} placeholder="e.g., 45-year-old male with chest pain and shortness of breath…" />
            </div>
          </div>
          <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(108,59,255,0.06), rgba(14,165,233,0.04))', border: '1px solid rgba(108,59,255,0.15)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 12 }}>📋 Simulation includes:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Virtual Patient Encounter','History Taking (SOCRATES)','Clinical Examination','Differential Diagnosis','Investigation Planning','Management Decisions','AI Performance Feedback'].map(t => (
                <span key={t} className="badge badge-primary">{t}</span>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', padding: 16 }}
            onClick={handleStart} disabled={loading || !subject || !activeCase}>
            {loading ? <><span className="spinner" style={{ marginRight: 8 }} />Preparing Virtual Patient…</> : '🏥 Start Virtual Patient Encounter'}
          </button>
        </div>
      )}

      {stage !== 'config' && (
        <div className="animate-fadeIn">
          <div className="card" style={{ marginBottom: 20, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, background: 'linear-gradient(135deg, rgba(108,59,255,0.08), rgba(14,165,233,0.04))' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{course} • {subject}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>📋 Patient: {activeCase}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={resetCase}>🔄 New Case</button>
              <button className={`btn btn-sm ${saved ? 'btn-secondary' : 'btn-primary'}`} onClick={handleSave}>{saved ? '✅ Saved!' : '💾 Save'}</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            {STAGES.map((s, i) => (
              <button key={s.key} onClick={() => i <= stageIdx && setStage(s.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: i <= stageIdx ? 'pointer' : 'default', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                  background: stage === s.key ? 'var(--primary)' : i < stageIdx ? 'rgba(16,185,129,0.15)' : 'var(--bg-elevated)',
                  color: stage === s.key ? 'white' : i < stageIdx ? 'var(--success)' : 'var(--text-muted)' }}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {stage === 'history' && (
            <div style={{ maxWidth: 820 }}>
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 18, padding: 14, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6C3BFF,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤖</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    <strong>AI Virtual Patient:</strong> <em>"Good morning, Doctor. I have been having problems related to <strong>{activeCase}</strong>. I came here seeking your help."</em>
                  </div>
                </div>
                <div className="grid-2">
                  {[
                    { key: 'chiefComplaint', label: 'Chief Complaint', placeholder: 'Main presenting symptom, duration…' },
                    { key: 'hpi', label: 'History of Presenting Illness (SOCRATES)', placeholder: 'Site, Onset, Character, Radiation, Associations, Time, Exacerbating/Relieving, Severity…' },
                    { key: 'pmh', label: 'Past Medical / Surgical History', placeholder: 'Previous illnesses, hospitalizations, surgeries, chronic conditions…' },
                    { key: 'medications', label: 'Current Medications', placeholder: 'Drug name, dose, frequency, duration…' },
                    { key: 'allergies', label: 'Allergies', placeholder: 'Drug, food, environmental allergies and reactions…' },
                    { key: 'socialHistory', label: 'Social History', placeholder: 'Occupation, smoking, alcohol, diet, travel, living conditions…' },
                    { key: 'familyHistory', label: 'Family History', placeholder: 'Similar conditions in parents, siblings…' },
                    { key: 'ros', label: 'Review of Systems', placeholder: 'Systematic enquiry of other systems…' },
                  ].map(field => (
                    <div key={field.key} className="form-group">
                      <label className="label">{field.label}</label>
                      <textarea className="input-field" rows={3} style={{ minHeight: 76 }}
                        value={history[field.key as keyof typeof history]}
                        onChange={e => setHistory(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder} />
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setStage('examination')}>Next: Clinical Examination →</button>
            </div>
          )}

          {stage === 'examination' && (
            <div style={{ maxWidth: 820 }}>
              <div className="card" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>🩺 Clinical Examination Findings</h2>
                {[
                  { key: 'vitals', label: 'Vital Signs', placeholder: 'BP, HR, RR, Temperature, SpO₂, Weight, Height, BMI…' },
                  { key: 'general', label: 'General Examination', placeholder: 'Conscious, oriented, built, nutrition; Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Oedema (PICCLE)…' },
                  { key: 'systemic', label: 'Systemic Examination', placeholder: 'Cardiovascular, Respiratory, Abdomen, CNS, Musculoskeletal findings…' },
                  { key: 'specific', label: 'Specific / Focused Examination', placeholder: 'Region-specific or specialist examination findings relevant to the case…' },
                ].map(field => (
                  <div key={field.key} className="form-group">
                    <label className="label">{field.label}</label>
                    <textarea className="input-field" rows={3}
                      value={examination[field.key as keyof typeof examination]}
                      onChange={e => setExamination(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setStage('history')}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStage('diagnosis')}>Next: Diagnosis →</button>
              </div>
            </div>
          )}

          {stage === 'diagnosis' && (
            <div style={{ maxWidth: 820 }}>
              <div className="card" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>🔍 Diagnosis & Investigations</h2>
                <div className="form-group">
                  <label className="label">Primary Diagnosis</label>
                  <input className="input-field" value={diagnosis.primary} onChange={e => setDiagnosis(p => ({ ...p, primary: e.target.value }))} placeholder="Most likely diagnosis with justification…" />
                </div>
                <div className="form-group">
                  <label className="label">Differential Diagnoses (rank by likelihood)</label>
                  <textarea className="input-field" rows={4} value={diagnosis.differentials} onChange={e => setDiagnosis(p => ({ ...p, differentials: e.target.value }))} placeholder="1. Most likely — reasoning&#10;2. Second differential — reasoning&#10;3. Third differential — reasoning…" />
                </div>
                <div className="form-group">
                  <label className="label">Investigations to Order</label>
                  <textarea className="input-field" rows={4} value={diagnosis.investigations} onChange={e => setDiagnosis(p => ({ ...p, investigations: e.target.value }))} placeholder="First-line: CBC, Metabolic panel, Urinalysis, ECG…&#10;Second-line: USG, CT, MRI…&#10;Special: Biopsy, Culture, Scoring systems…" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setStage('examination')}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStage('management')}>Next: Management →</button>
              </div>
            </div>
          )}

          {stage === 'management' && (
            <div style={{ maxWidth: 820 }}>
              <div className="card" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>💊 Management Decisions</h2>
                {[
                  { key: 'immediate', label: 'Immediate / Emergency Management', placeholder: 'Stabilise ABC, IV access, O₂, monitoring, emergency medications…' },
                  { key: 'medications', label: 'Medications & Definitive Treatment', placeholder: 'Drug name — dose — route — frequency — duration…' },
                  { key: 'monitoring', label: 'Monitoring & Parameters', placeholder: 'What to monitor, frequency, target values, alert thresholds…' },
                  { key: 'followup', label: 'Discharge, Follow-up & Long-term Plan', placeholder: 'Discharge criteria, outpatient follow-up schedule, lifestyle advice, referrals…' },
                ].map(field => (
                  <div key={field.key} className="form-group">
                    <label className="label">{field.label}</label>
                    <textarea className="input-field" rows={3}
                      value={management[field.key as keyof typeof management]}
                      onChange={e => setManagement(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setStage('diagnosis')}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStage('feedback')}>📊 View AI Feedback →</button>
              </div>
            </div>
          )}

          {stage === 'feedback' && (
            <div style={{ maxWidth: 860 }} className="animate-fadeIn">
              <div className="card" style={{ textAlign: 'center', padding: 36, marginBottom: 20 }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>🏆</div>
                <h2 className="font-outfit" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Case Completed!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Patient: <strong>{activeCase}</strong> • {course} — {subject}</p>
                <div className="grid-4" style={{ marginBottom: 20 }}>
                  {[{ label: 'History Sections', val: `${Object.values(history).filter(v => v.trim()).length}/8`, color: 'var(--primary)' },
                    { label: 'Examination', val: `${Object.values(examination).filter(v => v.trim()).length}/4`, color: 'var(--secondary)' },
                    { label: 'Diagnosis', val: diagnosis.primary ? '✓ Done' : '—', color: 'var(--success)' },
                    { label: 'Management', val: `${Object.values(management).filter(v => v.trim()).length}/4`, color: 'var(--accent)' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 14, borderTop: `3px solid ${item.color}` }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: item.color, fontFamily: 'Outfit' }}>{item.val}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
                <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`} onClick={handleSave}>{saved ? '✅ Saved!' : '💾 Save Case Report'}</button>
              </div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🤖 AI Clinical Feedback</div>
                {[
                  { title: 'History Taking', icon: '📝', feedback: history.chiefComplaint ? 'Chief complaint documented. Ensure SOCRATES framework is applied completely for HPI.' : 'Complete the history sections for full feedback.' },
                  { title: 'Examination', icon: '🩺', feedback: examination.vitals ? 'Vital signs documented. Ensure systematic examination using head-to-toe or system-based approach.' : 'Document all examination findings.' },
                  { title: 'Diagnosis', icon: '🔍', feedback: diagnosis.primary ? `Primary: "${diagnosis.primary}". ${diagnosis.differentials ? 'Differentials listed — good approach.' : 'Always provide ≥3 ranked differentials.'}` : 'A primary diagnosis is required.' },
                  { title: 'Management', icon: '💊', feedback: management.immediate ? 'Immediate management addressed. Verify drug doses, routes, and follow-up plan completeness.' : 'Complete the management plan.' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{item.icon} {item.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.feedback}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary" onClick={resetCase}>🔄 Start New Case</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
