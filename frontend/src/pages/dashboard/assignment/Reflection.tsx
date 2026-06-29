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

export default function ReflectionGeneratorPage() {
  const [course, setCourse] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  
  const [topic, setTopic] = useState('');
  const [competency, setCompetency] = useState('');
  
  const [intro, setIntro] = useState('');
  const [description, setDescription] = useState('');
  const [response, setResponse] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [learning, setLearning] = useState('');
  const [application, setApplication] = useState('');
  const [conclusion, setConclusion] = useState('');
  
  const [wordCount, setWordCount] = useState('500');
  const [generating, setGenerating] = useState(false);
  const [reflection, setReflection] = useState('');

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
    if (!topic || !description) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 3000));
    setReflection(`
# Reflective Writing: ${topic}
**Subject Context:** ${course ? `${course} - ${subject}` : 'General Clinical Practice'}
**Competency/Session:** ${competency || 'N/A'}

## Introduction
${intro || `This reflection focuses on the clinical encounter regarding ${topic}. The objective was to critically evaluate the practical approaches applied during the session.`}

## Description of the Event
${description}

## Personal Response & Feelings
${response || 'Initially, the situation presented several clinical challenges that required rapid assessment and decision making. I felt a strong need to verify my theoretical knowledge against the practical presentation.'}

## Critical Analysis
${analysis || 'Analyzing the event through the lens of evidence-based medicine reveals several gaps in standard protocols versus real-world application. The pathophysiology of the condition dictated a specific therapeutic approach which was effectively implemented.'}

## Learning Points
${learning || '- Importance of accurate history taking.\n- Understanding the nuances of physical examination in atypical presentations.\n- The value of interdisciplinary communication.'}

## Application to Future Practice
${application || 'In future clinical encounters, I will ensure a more structured approach to similar cases, utilizing the newly acquired diagnostic algorithms to minimize errors and improve patient outcomes.'}

## Conclusion
${conclusion || 'This experience has significantly enhanced my clinical acumen and reinforced the necessity of continuous medical education and reflective practice.'}
    `.trim());
    setGenerating(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">💭­ Reflection Generator</h1>
        <p className="page-desc">Structure and generate professional reflective writing for your academic portfolio.</p>
      </div>

      <div className="card" style={{ marginBottom: 24, maxWidth: 900 }}>
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

        {/* Primary Inputs */}
        <div className="grid-2">
          <div className="form-group">
            <label className="label">Topic *</label>
            <input className="input-field" placeholder="e.g., Management of Diabetic Ketoacidosis" value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Competency / Session</label>
            <input className="input-field" placeholder="e.g., IM-1.2, Bedside Clinics" value={competency} onChange={e => setCompetency(e.target.value)} />
          </div>
        </div>

        {/* Reflection Prompts */}
        <div className="form-group">
          <label className="label">Description of the Event *</label>
          <textarea className="input-field" style={{ minHeight: 80 }} placeholder="What happened? Describe the clinical scenario or learning event..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">Personal Response (Optional)</label>
            <textarea className="input-field" style={{ minHeight: 80 }} placeholder="What were your thoughts and feelings?" value={response} onChange={e => setResponse(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Critical Analysis (Optional)</label>
            <textarea className="input-field" style={{ minHeight: 80 }} placeholder="What sense can you make of the situation?" value={analysis} onChange={e => setAnalysis(e.target.value)} />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="label">Learning Points (Optional)</label>
            <textarea className="input-field" style={{ minHeight: 80 }} placeholder="What did you learn from this?" value={learning} onChange={e => setLearning(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Application to Future Practice (Optional)</label>
            <textarea className="input-field" style={{ minHeight: 80 }} placeholder="What will you do differently next time?" value={application} onChange={e => setApplication(e.target.value)} />
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginTop: 12 }}>
          <div className="form-group" style={{ marginBottom: 0, width: 200 }}>
            <label className="label">Word Count</label>
            <select className="input-field" value={wordCount} onChange={e => setWordCount(e.target.value)}>
              <option value="250">~250 Words (Brief)</option>
              <option value="500">~500 Words (Standard)</option>
              <option value="750">~750 Words (Detailed)</option>
              <option value="1000">~1000 Words (Comprehensive)</option>
            </select>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, justifyContent: 'center', padding: '12px 20px', fontSize: 15 }} 
            onClick={handleGenerate} 
            disabled={generating || !topic || !description}
          >
            {generating ? <><span className="spinner" style={{ marginRight: 8 }} />Structuring Reflectionâ€¦</> : 'âœ¨ Generate Reflection'}
          </button>
        </div>
      </div>

      {reflection && (
        <div className="card animate-fadeIn" style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Generated Reflection</h2>
            <button className="btn btn-secondary btn-sm">📋 Copy to Clipboard</button>
          </div>
          <div className="ai-response" style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--bg-elevated)' }}>
            {reflection}
          </div>
        </div>
      )}
    </div>
  );
}

