'use client';
import React, { useState, useEffect } from 'react';

// ─── Course → Subject Mapping ─────────────────────────────────────────────────
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

export default function CasePresentationPage() {
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [presentationType, setPresentationType] = useState('');
  const [customPresentationType, setCustomPresentationType] = useState('');
  const [clinicalFeatures, setClinicalFeatures] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [generating, setGenerating] = useState(false);
  const [presentation, setPresentation] = useState('');
  const [isSpecificCase, setIsSpecificCase] = useState(false);

  const activePresentationType = presentationType === 'Other' ? customPresentationType : presentationType;

  useEffect(() => {
    if (course) {
      setSubjectList(COURSE_DATA[course] || []);
      setSubject('');
    } else {
      setSubjectList([]);
      setSubject('');
    }
  }, [course]);

  const handleGenerate = async () => {
    if (!course || !subject || !topic || !activePresentationType) return;
    setGenerating(true);
    setPresentation('');
    
    // Check if this is a specific case based on inputs
    const hasSpecifics = clinicalFeatures.trim().length > 0 || files.length > 0;
    setIsSpecificCase(hasSpecifics);
    
    try {
      // Convert files to base64 generative parts
      const fileParts = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Data = (reader.result as string).split(',')[1];
                resolve({
                  inlineData: { data: base64Data, mimeType: file.type },
                });
              };
              reader.readAsDataURL(file);
            })
        )
      );

      const response = await fetch('/api/generate-case-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          course, 
          subject, 
          topic, 
          presentationType: activePresentationType,
          clinicalFeatures,
          fileParts
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert('Error generating case presentation: ' + data.error);
      } else {
        setPresentation(data.presentation);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the generation server.');
    } finally {
      setGenerating(false);
    }
  };

  const formatMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      let html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--primary); font-weight: 800;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<strong style="color: var(--primary); font-weight: 600;">$1</strong>')
        .replace(/^#### (.*)/g, '<h5 style="margin-top: 16px; margin-bottom: 8px; color: var(--primary); font-size: 15px; font-weight: 800;">$1</h5>')
        .replace(/^### (.*)/g, '<h4 style="margin-top: 20px; margin-bottom: 12px; color: var(--primary); font-size: 16px; font-weight: 800;">$1</h4>')
        .replace(/^## (.*)/g, '<h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--primary); font-size: 18px; border-bottom: 2px solid var(--border); padding-bottom: 8px;">$1</h3>')
        .replace(/^# (.*)/g, '<h2 style="margin-top: 16px; margin-bottom: 24px; color: var(--text-primary); font-size: 22px; font-weight: 800;">$1</h2>')
        .replace(/^---/g, '<hr style="margin: 24px 0; border: none; border-top: 1px solid #E2E8F0;" />');

      if (line.match(/^[-*]\s/)) {
        let listHtml = line.replace(/^[-*]\s(.*)/, '<li style="margin-left: 20px; margin-bottom: 6px; line-height: 1.6; padding-left: 4px;">$1</li>');
        listHtml = listHtml.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--primary); font-weight: 700;">$1</strong>');
        return <div key={i} dangerouslySetInnerHTML={{ __html: listHtml }} style={{ color: '#334155', fontSize: '15px' }} />;
      }
      
      if (line.trim() === '' || line.trim() === '#') return <div key={i} style={{ height: 12 }} />;
      
      return <div key={i} dangerouslySetInnerHTML={{ __html: html }} style={{ lineHeight: 1.6, color: '#334155', fontSize: '15px' }} />;
    });
  };

  return (
    <div className="page-container" style={{ padding: 'clamp(16px, 3vw, 32px)', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 className="page-title font-outfit" style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: 'var(--primary)', fontWeight: 800 }}>🏥 Case Presentation Generator</h1>
        <p className="page-desc" style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#64748B' }}>Generate structured, highly detailed clinical case presentations tailored to your academic needs.</p>
      </div>

      <div className="card" style={{ marginBottom: 32, width: '100%', padding: 'clamp(20px, 4vw, 32px)', borderRadius: 16, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
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
          <label className="label">Topic (Diagnosis or Syndrome)</label>
          <input 
            className="input-field" 
            placeholder="e.g., Acute Appendicitis, Myocardial Infarction" 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            disabled={!subject}
            style={{ opacity: subject ? 1 : 0.5, cursor: subject ? 'text' : 'not-allowed' }}
          />
        </div>

        <div className="form-group">
          <label className="label">Case Presentation Type</label>
          <select 
            className="input-field" 
            value={presentationType} 
            onChange={e => setPresentationType(e.target.value)}
          >
            <option value="">Select Case Presentation Type</option>
            <option value="Short Case Presentation">Short Case Presentation</option>
            <option value="Long Case Presentation">Long Case Presentation</option>
            <option value="Seminar Style Case Presentation">Seminar Style Case Presentation</option>
            <option value="Ward Round Presentation">Ward Round Presentation</option>
            <option value="Nursing Case Presentation">Nursing Case Presentation</option>
            <option value="Problem-Based Case Discussion">Problem-Based Case Discussion</option>
            <option value="Clinicopathological Conference (CPC)">Clinicopathological Conference (CPC)</option>
            <option value="Other">Add any other specific type</option>
          </select>
        </div>

        {presentationType === 'Other' && (
          <div className="form-group animate-fadeIn">
            <label className="label">Enter Custom Presentation Type</label>
            <input 
              className="input-field" 
              placeholder="e.g., Grand Rounds, Morbidity & Mortality" 
              value={customPresentationType} 
              onChange={e => setCustomPresentationType(e.target.value)} 
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
          <div className="form-group">
            <label className="label">Clinical Features (Optional)</label>
            <textarea 
              className="input-field" 
              placeholder="Specific details of the case (e.g., 45 yo male, smoker, presenting with sudden chest pain...)" 
              value={clinicalFeatures} 
              onChange={e => setClinicalFeatures(e.target.value)}
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          
          <div className="form-group">
            <label className="label">Clinical Written Notes (Optional)</label>
            <div style={{ padding: 16, border: '2px dashed #CBD5E1', borderRadius: 8, background: '#F8FAFC', textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '6px 12px', background: '#fff', border: '1px solid #E2E8F0' }}>
                  <span style={{ marginRight: 6 }}>📸</span> Take Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    style={{ display: 'none' }} 
                    onChange={e => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])} 
                  />
                </label>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0, padding: '6px 12px', background: '#fff', border: '1px solid #E2E8F0' }}>
                  <span style={{ marginRight: 6 }}>📁</span> Choose Files
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,application/pdf" 
                    style={{ display: 'none' }} 
                    onChange={e => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])} 
                  />
                </label>
              </div>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 12, marginBottom: 0 }}>Take photos of clinical notes directly, or upload images / PDF.</p>
              
              {files.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ background: '#E2E8F0', fontSize: 12, padding: '4px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                      <button 
                        onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontWeight: 'bold', fontSize: 14, padding: 0, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, marginTop: 8 }} 
          onClick={handleGenerate} 
          disabled={generating || !course || !subject || !topic || !activePresentationType}
        >
          {generating ? <><span className="spinner" style={{ marginRight: 8 }} />Generating Case Presentation…</> : '✨ Generate Case Presentation'}
        </button>
      </div>

      {presentation && (
        <div className="card animate-fadeIn" style={{ borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', border: '1px solid #E2E8F0' }}>
          <div className="print-hide" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit', marginBottom: 6 }}>📋 Generated Case Presentation</h2>
              {!isSpecificCase && (
                <p style={{ fontSize: 14, color: '#64748B', margin: 0, fontStyle: 'italic' }}>This is just an indication of how a Case Presentation will be handled.</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }} onClick={() => navigator.clipboard.writeText(presentation)}>
                <span style={{ marginRight: 6 }}>📋</span> Copy Text
              </button>
              <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }} onClick={() => window.print()}>
                <span style={{ marginRight: 6 }}>📥</span> Save as PDF
              </button>
            </div>
          </div>
          <div style={{ padding: 'clamp(20px, 4vw, 40px)', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', overflowX: 'hidden' }}>
            <div className="print-only-title" style={{ display: 'none', marginBottom: 24, fontSize: 24, fontWeight: 800, color: '#0F172A', borderBottom: '2px solid var(--primary)', paddingBottom: 12 }}>Case Presentation: {topic}</div>
            {formatMarkdown(presentation)}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .card, .card * {
            visibility: visible;
          }
          .card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
            margin: 0;
            padding: 0;
          }
          .print-hide {
            display: none !important;
          }
          .print-only-title {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
