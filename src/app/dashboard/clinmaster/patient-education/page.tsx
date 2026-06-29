'use client';
import React, { useState } from 'react';

const COURSE_DATA: Record<string, string[]> = {
  MBBS: ['Anatomy','Physiology','Biochemistry','Pathology','Microbiology','Pharmacology','Community Medicine','General Medicine','Pediatrics','Dermatology','Psychiatry','General Surgery','Orthopedics','Obstetrics & Gynaecology','Emergency Medicine'],
  BDS: ['Dental Anatomy','Oral Pathology','Oral Medicine','Oral Surgery','Periodontology'],
  'BSc Nursing': ['Adult Health Nursing','Child Health Nursing','Community Health Nursing','Mental Health Nursing'],
  Other: [],
};

const CLINICAL_CASES: Record<string, string[]> = {
  'General Medicine': ['Diabetes Mellitus','Hypertension','Chronic Kidney Disease','Cardiac Failure','COPD','Tuberculosis','Hepatitis B','Asthma','Stroke','Anaemia'],
  'Pediatrics': ['Childhood Asthma','Malnutrition','Type 1 Diabetes','Epilepsy','Cerebral Palsy'],
  'General Surgery': ['Post-operative Care','Wound Care','Colostomy Care','Hernia Prevention'],
  'Obstetrics & Gynaecology': ['Ante-natal Care','PCOS','Gestational Diabetes','Family Planning'],
};

const EDUCATION_TEMPLATES: Record<string, { overview: string; lifestyle: string; medications: string; warning: string; followup: string }> = {
  'Diabetes Mellitus': {
    overview: 'Diabetes Mellitus is a condition where your body cannot properly control blood sugar levels. Type 2 diabetes is very common and is strongly influenced by lifestyle choices. With proper care, you can live a full, healthy life.',
    lifestyle: '• Diet: Reduce sugar, white rice, white bread, sweets, and soft drinks. Increase vegetables, pulses (dal), whole grains, and lean proteins.\n• Exercise: Walk 30 minutes daily, 5 days a week. Avoid prolonged sitting.\n• Weight: Losing even 5-10% of your body weight significantly improves blood sugar control.\n• Smoking: If you smoke, stopping will dramatically reduce your risk of complications.\n• Alcohol: Limit strictly — alcohol can cause dangerous blood sugar swings.',
    medications: '• Take your diabetes medicines every day at the same time, even when you feel well.\n• Do not stop medicines without telling your doctor.\n• Know your medicines: name, dose, what it does, and side effects.\n• If on insulin: Learn correct injection technique, rotate injection sites, store insulin properly.',
    warning: 'Go to the hospital immediately if you experience:\n🔴 Very high blood sugar: extreme thirst, frequent urination, vomiting, stomach pain, fruity breath smell.\n🔴 Low blood sugar (Hypoglycaemia): sweating, trembling, confusion, unconsciousness. Take 15g of sugar immediately (glucose tablets, sugar water, sweet drink).\n🔴 Chest pain, difficulty breathing, sudden weakness (may be heart attack or stroke).',
    followup: '• Blood sugar (fasting + post-meal) — every visit\n• HbA1c — every 3 months\n• Blood pressure — every visit\n• Kidney function (eGFR, urine albumin) — every 6 months\n• Cholesterol (lipid profile) — every year\n• Eye check (fundoscopy) — every year\n• Foot examination — every visit\n• Dental check — every 6 months',
  },
  'Hypertension': {
    overview: 'High Blood Pressure (Hypertension) means your heart is working too hard to pump blood through your arteries. If not controlled, it can lead to heart attack, stroke, and kidney damage. The good news: it is very well managed with lifestyle changes and medicines.',
    lifestyle: '• Diet: Reduce salt to <5g/day (avoid pickles, papad, processed foods, restaurant food). Follow DASH diet: more fruits, vegetables, and low-fat dairy.\n• Exercise: 30 minutes brisk walking, 5 days/week.\n• Weight loss: Each 1 kg loss reduces BP by ~1 mmHg.\n• Alcohol: Limit (men: ≤2 drinks/day, women: ≤1 drink/day).\n• Smoking: Stop completely — major cardiovascular risk factor.\n• Stress management: Yoga, meditation, adequate sleep (7-8 hours).',
    medications: '• Take BP medicines EVERY day — even if you feel fine. BP has no symptoms until a crisis occurs.\n• Do not stop medicines suddenly without consulting your doctor.\n• Take medicines at the same time daily.\n• Know your target BP: usually < 130/80 mmHg.',
    warning: 'Seek emergency care if:\n🔴 BP > 180/120 mmHg with symptoms (severe headache, vision change, chest pain, confusion) = Hypertensive Emergency.\n🔴 Sudden severe headache, face drooping, arm weakness, speech difficulty = Possible Stroke (FAST test).\n🔴 Chest pain radiating to arm or jaw = Possible Heart Attack.',
    followup: '• BP check — every visit or home monitoring daily\n• Kidney function (Creatinine, eGFR) — every 6 months\n• Urine protein — every year\n• ECG — every year\n• Fundoscopy — every year\n• Cholesterol profile — every year',
  },
};

const LANGUAGES = ['English','Hindi','Tamil','Telugu','Kannada','Malayalam','Marathi','Bengali','Gujarati','Urdu'];

export default function PatientEducationPage() {
  const [course, setCourse] = useState('MBBS');
  const [subject, setSubject] = useState('');
  const [clinicalCase, setClinicalCase] = useState('');
  const [customCase, setCustomCase] = useState('');
  const [language, setLanguage] = useState('English');
  const [customNotes, setCustomNotes] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [template, setTemplate] = useState<{overview:string, lifestyle:string, medications:string, warning:string, followup:string} | null>(null);

  const subjects = COURSE_DATA[course] || [];
  const cases = subject && CLINICAL_CASES[subject] ? CLINICAL_CASES[subject] : [];
  const activeCase = clinicalCase || customCase;

  const handleGenerate = async () => {
    if (!activeCase) return;
    setIsGenerating(true);
    setHasGenerated(false);
    
    try {
      const res = await fetch('/api/generate-education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition: activeCase, language, customNotes })
      });
      const data = await res.json();
      
      if (res.ok) {
        setTemplate(data);
        setHasGenerated(true);
      } else {
        alert(data.error || 'Failed to generate education sheet.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while generating.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: 60 }}>
      <div className="page-header" style={{ marginBottom: 30 }}>
        <h1 className="page-title font-outfit" style={{ fontSize: 28, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>👨‍⚕️</span> Patient Education
        </h1>
        <p className="page-desc">Generate structured, patient-friendly educational content for clinical cases — printable & multilingual</p>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* INPUT FORM */}
        <div className="card shadow-sm" style={{ marginBottom: 24, borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">Course</label>
              <select className="input-field" value={course} onChange={e => { setCourse(e.target.value); setSubject(''); setClinicalCase(''); setHasGenerated(false); }}>
                {Object.keys(COURSE_DATA).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">Subject</label>
              <select className="input-field" value={subject} onChange={e => { setSubject(e.target.value); setClinicalCase(''); setHasGenerated(false); }}>
                <option value="">— Select —</option>
                {subjects.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">Clinical Case</label>
              <select className="input-field" value={clinicalCase} onChange={e => { setClinicalCase(e.target.value); setHasGenerated(false); }} disabled={!subject}>
                <option value="">— Select Case —</option>
                {cases.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">Language</label>
              <select className="input-field" value={language} onChange={e => { setLanguage(e.target.value); setHasGenerated(false); }}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {!clinicalCase && (
            <div className="form-group" style={{ marginTop: 16, marginBottom: 0 }}>
              <label className="label">Or Enter Custom Case / Condition</label>
              <input className="input-field" value={customCase} onChange={e => { setCustomCase(e.target.value); setHasGenerated(false); }} placeholder="e.g., Post-operative appendectomy care, Asthma management, Gout…" />
            </div>
          )}

          {activeCase && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: 24, width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, fontWeight: 700 }} 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> Generating Education Material...</>
              ) : (
                <>✨ Generate Patient Education Sheet</>
              )}
            </button>
          )}
        </div>

        {/* RESULTS */}
        {hasGenerated && template && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '0 8px' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text)' }}>📋 {activeCase}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Patient Education Sheet • {language}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Print Sheet</button>
                <button className="btn btn-primary">💾 Save to Patient File</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
              
              {/* SECTION: Overview */}
              <div className="card shadow-sm" style={{ borderLeft: '4px solid #6366F1' }}>
                <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#4F46E5' }}>
                  <span style={{ fontSize: 20 }}>📖</span> What is this condition?
                </h3>
                <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {template.overview}
                </div>
              </div>

              {/* SECTION: Lifestyle */}
              <div className="card shadow-sm" style={{ borderLeft: '4px solid #10B981' }}>
                <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
                  <span style={{ fontSize: 20 }}>🌱</span> Lifestyle Advice
                </h3>
                <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {template.lifestyle}
                </div>
              </div>

              {/* SECTION: Medications */}
              <div className="card shadow-sm" style={{ borderLeft: '4px solid #F59E0B' }}>
                <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#D97706' }}>
                  <span style={{ fontSize: 20 }}>💊</span> Medication Guidance
                </h3>
                <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {template.medications}
                </div>
              </div>

              {/* SECTION: Warning Signs */}
              <div className="card shadow-sm" style={{ borderLeft: '4px solid #EF4444', background: '#FEF2F2' }}>
                <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626' }}>
                  <span style={{ fontSize: 20 }}>🚨</span> Warning Signs
                </h3>
                <div style={{ fontSize: 14, color: '#991B1B', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                  {template.warning}
                </div>
              </div>

              {/* SECTION: Follow-up */}
              <div className="card shadow-sm" style={{ borderLeft: '4px solid #3B82F6' }}>
                <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#2563EB' }}>
                  <span style={{ fontSize: 20 }}>📅</span> Follow-up Plan
                </h3>
                <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {template.followup}
                </div>
              </div>

              {/* SECTION: Custom Notes */}
              <div className="card shadow-sm" style={{ borderLeft: '4px solid #8B5CF6' }}>
                <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#7C3AED' }}>
                  <span style={{ fontSize: 20 }}>✍️</span> Custom Notes
                </h3>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  value={customNotes} 
                  onChange={e => setCustomNotes(e.target.value)}
                  placeholder="Add personalized instructions, specific advice, dosage reminders, or dietary restrictions for this specific patient..." 
                  style={{ background: '#F8FAFC' }}
                />
              </div>

            </div>
          </div>
        )}

        {!activeCase && (
          <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>👨‍⚕️</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--text-secondary)' }}>Select a Clinical Case</div>
            <div style={{ fontSize: 14 }}>Choose a course, subject, and clinical case above to generate a patient education sheet.</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
