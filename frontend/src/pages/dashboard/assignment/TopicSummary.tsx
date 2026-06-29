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

export default function TopicSummaryPage() {
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState('');

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
    if (!course || !subject || !topic) return;
    setGenerating(true);
    setSummary('');
    
    try {
      const response = await fetch('/api/generate-topic-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, subject, topic }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert('Error generating topic summary: ' + data.error);
      } else {
        setSummary(data.summary);
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
        <h1 className="page-title font-outfit" style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: 'var(--primary)', fontWeight: 800 }}>📑 Topic Summary Generator</h1>
        <p className="page-desc" style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#64748B' }}>Generate concise, high-yield, and fact-based summaries for rapid revision and assignments.</p>
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
          <label className="label">Topic to Summarize</label>
          <input 
            className="input-field" 
            placeholder="e.g., Coagulation Cascade, Cranial Nerves" 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            disabled={!subject}
            style={{ opacity: subject ? 1 : 0.5, cursor: subject ? 'text' : 'not-allowed' }}
          />
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, marginTop: 8 }} 
          onClick={handleGenerate} 
          disabled={generating || !course || !subject || !topic}
        >
          {generating ? <><span className="spinner" style={{ marginRight: 8 }} />Generating Summaryâ€¦</> : 'âœ¨ Generate Topic Summary'}
        </button>
      </div>

      {summary && (
        <div className="card animate-fadeIn" style={{ borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', border: '1px solid #E2E8F0' }}>
          <div className="print-hide" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit', margin: 0 }}>📋 Generated Summary</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }} onClick={() => navigator.clipboard.writeText(summary)}>
                <span style={{ marginRight: 6 }}>📋</span> Copy Text
              </button>
              <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }} onClick={() => window.print()}>
                <span style={{ marginRight: 6 }}>ðŸ“¥</span> Save as PDF
              </button>
            </div>
          </div>
          <div style={{ padding: 'clamp(20px, 4vw, 40px)', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', overflowX: 'hidden' }}>
            <div className="print-only-title" style={{ display: 'none', marginBottom: 24, fontSize: 24, fontWeight: 800, color: '#0F172A', borderBottom: '2px solid var(--primary)', paddingBottom: 12 }}>Topic Summary: {topic}</div>
            {formatMarkdown(summary)}
          </div>
        </div>
      )}
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .card, .card * { visibility: visible; }
          .card { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; margin: 0; padding: 0; }
          .print-hide { display: none !important; }
          .print-only-title { display: block !important; }
        }
      `}</style>
    </div>
  );
}

