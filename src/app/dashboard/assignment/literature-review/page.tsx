'use client';
import React, { useState, useEffect, useRef } from 'react';

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

export default function LiteratureReviewPage() {
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ notes: string, slides: string } | null>(null);

  useEffect(() => {
    if (course) {
      setSubjectList(COURSE_DATA[course] || []);
      setSubject('');
    } else {
      setSubjectList([]);
      setSubject('');
    }
  }, [course]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!course || !subject || !topic || !file) return;
    setGenerating(true);
    // Simulate generation delay
    await new Promise(r => setTimeout(r, 4000));
    setResult({
      notes: `
# Brief Notes: ${topic}
**Based on Uploaded Literature:** ${file.name}

## Executive Summary
This literature review synthesizes current research regarding ${topic}. The uploaded document highlights recent advancements and critical methodologies applicable to ${subject} within the ${course} curriculum.

## Key Findings
1. **Primary Insight:** The study demonstrates a significant correlation between X and Y.
2. **Methodological Shift:** Recent literature suggests moving away from traditional techniques toward novel approach Z.
3. **Clinical Implication:** These findings directly impact patient management by altering standard diagnostic criteria.

## Limitations & Future Scope
The reviewed literature indicates a gap in long-term observational data. Future research should focus on multi-center randomized trials.
      `.trim(),
      slides: `
# Presentation Slides (10 Slides)

**Slide 1: Title Slide**
- Title: Literature Review on ${topic}
- Subtitle: Recent Advances in ${subject}
- Context: ${course}

**Slide 2: Introduction**
- Definition of ${topic}
- Scope of the review
- Importance in current clinical practice

**Slide 3: Objectives**
- To evaluate recent findings in ${file.name}
- To analyze methodological approaches
- To determine clinical applicability

**Slide 4: Methodology of Reviewed Literature**
- Study design: e.g., Meta-analysis / RCT
- Sample size and demographics
- Inclusion/Exclusion criteria

**Slide 5: Key Finding 1**
- Major breakthrough or statistical result
- Graph/Chart placeholder
- Impact on current understanding

**Slide 6: Key Finding 2**
- Secondary outcomes
- Comparison with older literature
- Novel therapeutic targets identified

**Slide 7: Clinical Applications**
- How this changes diagnosis
- Changes in management protocols
- Cost-benefit analysis

**Slide 8: Limitations of Current Studies**
- Small sample sizes in certain cohorts
- Potential biases identified
- Need for broader demographic inclusion

**Slide 9: Future Directions**
- Proposed areas for future research
- Ongoing clinical trials
- Unanswered questions in the field

**Slide 10: Conclusion & Q&A**
- Summary of main points
- Final verdict on the literature
- Open floor for questions
      `.trim()
    });
    setGenerating(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">📰 Literature Review</h1>
        <p className="page-desc">Upload academic papers to automatically generate brief notes and a 10-slide PPT structure.</p>
      </div>

      <div className="card" style={{ marginBottom: 24, maxWidth: 800 }}>
        <div className="grid-2">
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
          <label className="label">Topic</label>
          <input 
            className="input-field" 
            placeholder="e.g., Efficacy of novel antibiotics in MRSA" 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            disabled={!subject}
            style={{ opacity: subject ? 1 : 0.5, cursor: subject ? 'text' : 'not-allowed' }}
          />
        </div>

        <div className="form-group">
          <label className="label">Upload Literature (PDF/DOCX)</label>
          <div 
            style={{ 
              border: '2px dashed var(--border)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '30px', 
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--bg-elevated)',
              opacity: topic ? 1 : 0.5
            }}
            onClick={() => topic && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {file ? (
              <div style={{ color: 'var(--primary)', fontWeight: 600 }}>📄 {file.name}</div>
            ) : (
              <div>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📁</div>
                <div style={{ color: 'var(--text-secondary)' }}>Click to upload literature document</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Maximum file size: 10MB</div>
              </div>
            )}
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, marginTop: 8 }} 
          onClick={handleGenerate} 
          disabled={generating || !course || !subject || !topic || !file}
        >
          {generating ? <><span className="spinner" style={{ marginRight: 8 }} />Analyzing Literature…</> : '✨ Generate Brief Notes & PPT Slides'}
        </button>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Brief Notes</h2>
              <button className="btn btn-secondary btn-sm">📋 Copy Notes</button>
            </div>
            <div className="ai-response" style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--bg-elevated)' }}>
              {result.notes}
            </div>
          </div>

          <div className="card animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Presentation Slides (10 Slides)</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm">📋 Copy Layout</button>
                <button className="btn btn-primary btn-sm" style={{ padding: '6px 14px' }}>📥 Download PPTX</button>
              </div>
            </div>
            <div className="ai-response" style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--bg-elevated)' }}>
              {result.slides}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
