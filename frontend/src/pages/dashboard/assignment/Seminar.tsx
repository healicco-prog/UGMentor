// React component
import React, { useState, useEffect } from 'react';
import PptxGenJS from 'pptxgenjs';

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

export default function SeminarBuilderPage() {
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  
  const [topic, setTopic] = useState('');
  const [criteria, setCriteria] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ notes: string, slides: string } | null>(null);
  const [printingSection, setPrintingSection] = useState<'notes' | 'slides' | null>(null);

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
    if (!topic) return;
    setGenerating(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/generate-seminar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, subject, topic, criteria }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert('Error generating seminar: ' + data.error);
      } else {
        setResult({
          notes: data.notes,
          slides: data.slides
        });
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
        .replace(/^#### (.*)/g, '<h5 style="margin-top: 12px; margin-bottom: 4px; color: var(--primary); font-size: 14px; font-weight: 800;">$1</h5>')
        .replace(/^### (.*)/g, '<h4 style="margin-top: 12px; margin-bottom: 8px; color: var(--primary); font-size: 15px; font-weight: 800;">$1</h4>')
        .replace(/^## (.*)/g, '<h3 style="margin-top: 16px; margin-bottom: 8px; color: var(--primary); font-size: 16px; border-bottom: 2px solid var(--border); padding-bottom: 4px;">$1</h3>')
        .replace(/^# (.*)/g, '') // Remove floating single #
        .replace(/^---/g, '') // Remove triple dash
        .replace(/^- (.*)/g, '<li style="margin-left: 20px; margin-bottom: 4px; line-height: 1.5;">$1</li>')
        .replace(/^\* (.*)/g, '<li style="margin-left: 20px; margin-bottom: 4px; line-height: 1.5;">$1</li>');
      
      if (line.trim() === '' || line.trim() === '#') return <div key={i} style={{ height: 8 }} />;

      return <div key={i} dangerouslySetInnerHTML={{ __html: html }} style={{ lineHeight: 1.5, color: '#334155', fontSize: 13 }} />;
    });
  };

  const renderSlidesUI = (text: string) => {
    const rawSlides = text.split(/(?=\*\*Slide \d+:|Slide \d+:)/g);
    let slideCount = 1;
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, background: '#F1F5F9', padding: 24, borderRadius: 12 }}>
        {rawSlides.map((slideText, idx) => {
          if (!slideText.includes('Slide')) return null;
          
          let cleanText = slideText.trim();
          const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
          const rawTitle = lines.shift() || '';
          const title = rawTitle.replace(/\*\*/g, '').replace(/Slide \d+:/, '').trim();
          const currentSlideNum = slideCount++;
          
          return (
            <div key={idx} className="slide-card print-slide-card" style={{ background: '#fff', border: '1px solid #CBD5E1', borderRadius: 12, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative' }}>
              <div style={{ background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12, display: 'inline-block', marginBottom: 12 }}>Slide {currentSlideNum}</div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: 16, color: '#0F172A', fontWeight: 800 }}>{title}</h4>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lines.map((line, i) => {
                  let cleanLine = line.replace(/^[-*#\s]+/, ''); // Strip leading hyphens, asterisks, hashes, spaces
                  if (!cleanLine) return null;
                  return (
                    <li key={i} style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                      <span dangerouslySetInnerHTML={{ __html: cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--primary); font-weight:700;">$1</strong>').replace(/\*(.*?)\*/g, '<strong style="color:var(--primary); font-weight:600;">$1</strong>') }} />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  const handleDownloadNotesPDF = () => {
    setPrintingSection('notes');
    setTimeout(() => {
      window.print();
      setPrintingSection(null);
    }, 100);
  };

  const handleDownloadSlidesPDF = () => {
    setPrintingSection('slides');
    setTimeout(() => {
      window.print();
      setPrintingSection(null);
    }, 100);
  };

  const handleDownloadPPT = async () => {
    if (!result) return;
    
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    // Basic parsing of slides text
    const slidesData = result.slides.split(/(?=Slide \d+:)/g);
    
    for (const slideText of slidesData) {
      if (!slideText.trim() || !slideText.includes('Slide')) continue;
      
      const lines = slideText.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length === 0) continue;

      const title = lines[0].replace(/\*\*/g, '').replace(/Slide \d+:/, '').trim();
      const bodyLines = lines.slice(1).map(l => l.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim());

      const slide = pptx.addSlide();
      
      // Title
      slide.addText(title, {
        x: 0.5, y: 0.5, w: '90%', h: 1, 
        fontSize: 28, color: '3B82F6', bold: true
      });
      
      // Body bullets
      const bulletsText = bodyLines.map(text => ({ text, options: { bullet: true } }));
      if (bulletsText.length > 0) {
        slide.addText(bulletsText, {
          x: 0.5, y: 1.8, w: '90%', h: '70%', 
          fontSize: 18, color: '333333', align: 'left', valign: 'top'
        });
      }
    }

    try {
      await pptx.writeFile({ fileName: `${topic.replace(/\s+/g, '_')}_Presentation.pptx` });
    } catch (e) {
      console.error(e);
      alert('Failed to generate PPTX. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header print-hide">
        <h1 className="page-title font-outfit">🎤 Seminar Builder</h1>
        <p className="page-desc">Build comprehensive seminar notes and presentation structures automatically.</p>
      </div>

      <div className="card print-hide" style={{ marginBottom: 24, maxWidth: 800 }}>
        {/* Academic Context */}
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Course (Optional)</label>
            <select className="input-field" value={course} onChange={e => setCourse(e.target.value)}>
              <option value="">Select Course</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Subject (Optional)</label>
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
          <label className="label">Topic for Seminar *</label>
          <input className="input-field" placeholder="e.g., Recent Advances in Heart Failure Management" value={topic} onChange={e => setTopic(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="label">Specific Criteria / Focus Areas (Optional)</label>
          <textarea className="input-field" style={{ minHeight: 80 }} placeholder="e.g., Focus primarily on the pharmacological aspect and new guidelines..." value={criteria} onChange={e => setCriteria(e.target.value)} />
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, marginTop: 8 }} 
          onClick={handleGenerate} 
          disabled={generating || !topic}
        >
          {generating ? <><span className="spinner" style={{ marginRight: 8 }} />Building Seminarâ€¦</> : 'âœ¨ Generate Seminar PPT & Notes'}
        </button>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Notes Card */}
          <div className="card animate-fadeIn" style={{ display: printingSection === 'slides' ? 'none' : 'block' }}>
            <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>ðŸ—£ï¸ Speaker Notes</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(result.notes)}>📋 Copy</button>
                <button className="btn btn-primary btn-sm" onClick={handleDownloadNotesPDF}>ðŸ“¥ Save as PDF</button>
              </div>
            </div>
            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div className="print-only-title" style={{ display: 'none', marginBottom: 20, fontSize: 24, fontWeight: 800, color: '#334155' }}>Seminar Speaker Notes: {topic}</div>
              {formatMarkdown(result.notes)}
            </div>
          </div>

          {/* Slides Card */}
          <div className="card animate-fadeIn" style={{ display: printingSection === 'notes' ? 'none' : 'block' }}>
            <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>ðŸ–¥ï¸ Presentation Slides Structure</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary btn-sm" onClick={handleDownloadSlidesPDF}>ðŸ“¥ Save as PDF</button>
                <button className="btn btn-primary btn-sm" style={{ padding: '6px 14px' }} onClick={handleDownloadPPT}>ðŸ“¥ Download .PPTX</button>
              </div>
            </div>
            <div style={{ padding: '0px' }}>
              <div className="print-only-title" style={{ display: 'none', marginBottom: 20, fontSize: 24, fontWeight: 800, color: '#334155' }}>Presentation Slides: {topic}</div>
              {renderSlidesUI(result.slides)}
            </div>
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
          }
          .print-hide {
            display: none !important;
          }
          .print-only-title {
            display: block !important;
          }
          .print-slide-card {
            border: 1px solid #94A3B8 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}

