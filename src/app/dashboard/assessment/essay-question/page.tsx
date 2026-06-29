'use client';
import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const COURSE_DATA: Record<string, { subjects: string[] }> = {
  MBBS: {
    subjects: [
      'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Microbiology',
      'Pharmacology', 'Forensic Medicine & Toxicology (FMT)',
      'Community Medicine (PSM)', 'Ophthalmology', 'ENT (Otorhinolaryngology)',
      'General Medicine', 'Pediatrics', 'Dermatology', 'Psychiatry',
      'General Surgery', 'Orthopedics', 'Obstetrics & Gynaecology (OBG)',
      'Anesthesia', 'Radiology', 'Emergency Medicine',
    ],
  },
  BDS: {
    subjects: [
      'General Human Anatomy incl. Embryology, Osteology & Histology',
      'General Physiology', 'Biochemistry, Nutrition and Dietetics',
      'Dental Anatomy, Embryology and Oral Histology',
      'General Pathology', 'Microbiology',
      'General and Dental Pharmacology and Therapeutics',
      'Dental Materials', 'Preclinical Prosthodontics and Crown & Bridge',
      'Preclinical Conservative Dentistry', 'General Medicine', 'General Surgery',
      'Oral and Maxillofacial Pathology & Oral Microbiology',
      'Oral Medicine and Radiology', 'Oral & Maxillofacial Surgery',
      'Periodontology', 'Pediatric and Preventive Dentistry',
      'Conservative Dentistry and Endodontics',
      'Prosthodontics and Crown & Bridge',
      'Orthodontics & Dentofacial Orthopaedics',
    ],
  },
  'BSc Nursing': {
    subjects: [
      'Adult Health Nursing (Medical Surgical Nursing) I',
      'Adult Health Nursing II', 'Applied Anatomy', 'Applied Biochemistry',
      'Applied Microbiology & Infection Control including Safety',
      'Applied Nutrition & Dietetics', 'Applied Physiology',
      'Applied Psychology', 'Applied Sociology',
      'Child Health Nursing I & II', 'Community Health Nursing I & II',
      'Educational Technology / Nursing Education', 'Genetics',
      'Mental Health Nursing I & II', 'Midwifery / OBG Nursing I & II',
      'Nursing Foundations I', 'Nursing Foundations II',
      'Nursing Management & Leadership', 'Nursing Research & Statistics',
      'Pathology I & II', 'Pharmacology I & II',
    ],
  },
};

const COURSES = Object.keys(COURSE_DATA);
const TOPICS = ['Diabetes Mellitus', 'Hypertension', 'Tuberculosis', 'Myocardial Infarction', 'Asthma', 'Heart Failure'];
const QTYPES = ['Long Essay Questions (LEQ)', 'Structured Essay Questions (SEQ)', 'Modified Essay Questions (MEQ)', 'Problem-Based Essay Questions', 'Clinical Scenario-Based'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Tough'];

type Step = 'generate' | 'approve' | 'upload' | 'result';

type RubricSection = { title: string; marks: string; criteria: string[] };
type RubricsData = { title: string; scheme: string; sections: RubricSection[]; bonus: string };

export default function EssayQuestionPage() {
  const [step, setStep] = useState<Step>('generate');
  const [course, setCourse] = useState('MBBS');
  const [subjectList, setSubjectList] = useState<string[]>(COURSE_DATA['MBBS'].subjects);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [qtype, setQtype] = useState('Long Essay Questions (LEQ)');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [marks, setMarks] = useState('10');
  
  const [generating, setGenerating] = useState(false);
  const [question, setQuestion] = useState('');
  
  const [generatingRubrics, setGeneratingRubrics] = useState(false);
  const [rubricsData, setRubricsData] = useState<RubricsData | null>(null);
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ positive: string[]; negative: string[]; improve: string[]; marks: string; total: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (COURSE_DATA[course]) {
      setSubjectList(COURSE_DATA[course].subjects);
    } else {
      setSubjectList([]);
    }
    setSubject('');
  }, [course]);

  const handleGenerate = async () => {
    if (!subject || !topic) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2200));
    const qMap: Record<string, string> = {
      'Long Essay Questions (LEQ)': `Describe in detail the ${topic} with reference to its definition, classification, mechanism, clinical features, diagnosis, and management. Add a labeled diagram wherever necessary. [${marks} Marks]`,
      'Structured Essay Questions (SEQ)': `a) Define ${topic} and give its classification. [3 Marks]\nb) Describe the pathophysiology of ${topic} in detail. [4 Marks]\nc) Outline the management of a patient presenting with ${topic}. [3 Marks]`,
      'Modified Essay Questions (MEQ)': `A 45-year-old patient presents with symptoms consistent with ${topic}.\nPart A: What are the most likely diagnoses? What investigations would you order? [5 Marks]\nPart B: Based on the results showing [typical findings], how would you manage this patient? [5 Marks]`,
      'Problem-Based Essay Questions': `Clinical Problem: A ${difficulty === 'Tough' ? '55-year-old diabetic hypertensive' : '35-year-old previously healthy'} patient presents to the OPD with features of ${topic}. Using a problem-based approach, discuss the pathophysiology, diagnostic workup, and evidence-based management. [${marks} Marks]`,
      'Clinical Scenario-Based': `Clinical Scenario: During ward rounds, you encounter a patient with ${topic}. The attending physician asks you to explain the clinical basis, relevant examination findings, investigations, and treatment protocol. Prepare a structured clinical discussion. [${marks} Marks]`,
    };
    setQuestion(qMap[qtype] || `Write a detailed essay on ${topic} from the perspective of ${subject}. [${marks} Marks]`);
    setGenerating(false);
    setStep('approve');
  };

  const handleApprove = async () => {
    setGeneratingRubrics(true);
    setStep('upload');
    await new Promise(r => setTimeout(r, 3000));
    
    setRubricsData({
      title: `Answer Rubrics for ${qtype} – ${topic}`,
      scheme: `Total: ${marks} Marks`,
      sections: [
        {
          title: 'Definition & Introduction',
          marks: `${Math.ceil(parseInt(marks) * 0.2)} marks`,
          criteria: ['Accurate, concise definition – 1 mark', 'Brief historical context (if applicable) – 0.5 marks', 'Scope and importance – 0.5 marks']
        },
        {
          title: 'Classification',
          marks: `${Math.ceil(parseInt(marks) * 0.2)} marks`,
          criteria: ['Correct classification system used – 1 mark', 'At least 3 categories with examples – 1 mark', 'Clinical relevance of each category – 1 mark']
        },
        {
          title: 'Pathophysiology / Mechanism',
          marks: `${Math.ceil(parseInt(marks) * 0.3)} marks`,
          criteria: ['Correct mechanism described – 2 marks', 'Molecular/cellular level detail – 1 mark', 'Diagrams/flowcharts (if drawn) – 1 mark']
        },
        {
          title: 'Clinical Features',
          marks: `${Math.ceil(parseInt(marks) * 0.15)} marks`,
          criteria: ['Symptoms listed correctly – 0.5 marks', 'Signs described accurately – 0.5 marks', 'Staging/grading if applicable – 0.5 marks']
        },
        {
          title: 'Investigations & Management',
          marks: `${Math.ceil(parseInt(marks) * 0.15)} marks`,
          criteria: ['Relevant investigations – 0.5 marks', 'Conservative management – 0.5 marks', 'Medical/surgical management – 0.5 marks']
        }
      ],
      bonus: 'Bonus Marks: Diagrams, flowcharts, tables, clinical pearls (+0.5 each, max 1 bonus)'
    });
    setGeneratingRubrics(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropImageSrc(reader.result?.toString() || null));
      reader.readAsDataURL(file);
    }
  };

  const finalizeCrop = () => {
    if (!cropImageSrc) return;
    
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(
          image,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          completedCrop.width,
          completedCrop.height
        );
        const base64Image = canvas.toDataURL('image/jpeg');
        setUploadedImages(prev => [...prev, base64Image]);
      }
    } else {
      // If no crop was drawn, just save original
      setUploadedImages(prev => [...prev, cropImageSrc]);
    }
    
    setCropImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (uploadedImages.length === 0) return;
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 4000));
    const scored = Math.floor(parseInt(marks) * (difficulty === 'Easy' ? 0.85 : difficulty === 'Moderate' ? 0.72 : 0.65));
    setResult({
      positive: [
        'Clear and well-structured introduction with accurate definition',
        'Good classification scheme with relevant examples',
        'Pathophysiology described with appropriate depth and cellular detail',
        'Clinical features comprehensively listed with proper staging',
        'Neat handwriting and organized layout improved readability',
      ],
      negative: [
        'Management section was incomplete – surgical options not discussed',
        'No diagrams or flowcharts drawn despite being a LEQ format',
        'Investigation list missing some key tests (e.g., imaging modalities)',
        'Bonus clinical pearls were not included',
      ],
      improve: [
        'Always include a labeled diagram – it can earn you bonus marks',
        'Use a flowchart for management algorithms to demonstrate clarity',
        'For each investigation listed, briefly justify why it is ordered',
        'Practice writing within time limits – add a mock table for quick recall',
        'Review the latest treatment guidelines for this topic',
      ],
      marks: scored.toString(),
      total: marks,
    });
    setAnalyzing(false);
    setStep('result');
  };

  const reset = () => {
    setStep('generate'); setQuestion(''); setRubricsData(null);
    setUploadedImages([]); setResult(null);
    setSubject(''); setTopic(''); setCourse('MBBS');
  };

  const stepLabels = ['Generate Question', 'Approve Question', 'Upload Answer Script', 'View Results'];
  const stepIndex = { generate: 0, approve: 1, upload: 2, result: 3 }[step];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">📄 Essay Question Assessment</h1>
        <p className="page-desc">AI-powered essay question generation, auto-rubric creation, and intelligent answer script grading</p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
        {stepLabels.map((label, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < stepIndex ? 'var(--success)' : i === stepIndex ? 'var(--primary)' : 'var(--bg-elevated)',
                border: `2px solid ${i <= stepIndex ? (i < stepIndex ? 'var(--success)' : 'var(--primary)') : 'var(--border)'}`,
                color: i <= stepIndex ? 'white' : 'var(--text-muted)',
                fontWeight: 700, fontSize: 14, transition: 'all 0.3s'
              }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: i === stepIndex ? 'var(--primary-light)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < stepIndex ? 'var(--success)' : 'var(--border)', margin: '0 8px', marginBottom: 24, transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Generate */}
      {step === 'generate' && (
        <div style={{ maxWidth: 680 }}>
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Configure Question Parameters</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Select Course *</label>
                <select className="input-field" value={course} onChange={e => setCourse(e.target.value)}>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Select Subject *</label>
                <select className="input-field" value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="">Select Subject</option>
                  {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Select Topic *</label>
                <input className="input-field" list="topics-list" placeholder="Select or type your own topic" value={topic} onChange={e => setTopic(e.target.value)} />
                <datalist id="topics-list">
                  {TOPICS.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="label">Question Type</label>
                <input className="input-field" list="qtypes-list" placeholder="Select or type your own type" value={qtype} onChange={e => setQtype(e.target.value)} />
                <datalist id="qtypes-list">
                  {QTYPES.map(q => <option key={q} value={q} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="label">Difficulty Level</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {DIFFICULTIES.map(d => (
                    <button key={d} className={`chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Total Marks</label>
                <input className="input-field" type="number" min="5" max="20" value={marks} onChange={e => setMarks(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={handleGenerate} disabled={generating || !subject || !topic}>
              {generating ? <><span className="spinner" /> Generating Question…</> : '🤖 Generate Essay Question'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Approve */}
      {step === 'approve' && (
        <div style={{ maxWidth: 720 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(108,59,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Generated Essay Question</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{course} • {subject} • {qtype} • {difficulty} • {marks} Marks</div>
              </div>
            </div>
            <div className="ai-response" style={{ marginBottom: 20, fontSize: 15, lineHeight: 2 }}>
              {question}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep('generate')}>← Regenerate</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={handleApprove}>
                ✅ Approve & Generate Rubrics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Upload */}
      {step === 'upload' && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300, maxWidth: 500 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                📋 Auto-Generated Answer Rubrics
              </div>
              {generatingRubrics ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14, padding: '20px 0' }}>
                  <span className="spinner" /> AI is generating detailed answer rubrics...
                </div>
              ) : rubricsData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{rubricsData.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginTop: 4 }}>{rubricsData.scheme}</div>
                  </div>
                  
                  {rubricsData.sections.map((section, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--bg-elevated)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{section.title}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'rgba(108,59,255,0.1)', padding: '2px 8px', borderRadius: 12 }}>
                          {section.marks}
                        </span>
                      </div>
                      <div style={{ padding: '10px 14px', background: 'var(--card-bg)' }}>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {section.criteria.map((c, cidx) => (
                            <li key={cidx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(16,185,129,0.4)' }}>
                    <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>🎁 {rubricsData.bonus}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 300 }}>
            <div className="card">
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>📸 Upload Answer Script</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Write your essay on paper and upload an image. You can crop it from all sides.</p>

              <div onClick={() => fileRef.current?.click()} style={{
                border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
                transition: 'var(--transition)', marginBottom: 16,
                background: 'var(--bg-elevated)'
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Click to upload image</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG supported</div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
              </div>

              {uploadedImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                  {uploadedImages.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={img} alt={`Script page ${i + 1}`}
                      style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  ))}
                </div>
              )}

              <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleAnalyze}
                disabled={uploadedImages.length === 0 || analyzing || generatingRubrics}>
                {analyzing ? <><span className="spinner" /> AI is analysing your answer…</> : '🤖 Analyse & Grade Answer Script'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal Overlay */}
      {cropImageSrc && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--radius-lg)', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Crop Image</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Drag the edges to crop the document correctly.</p>
            
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', borderRadius: 'var(--radius-md)' }}>
              <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imgRef} src={cropImageSrc} alt="Crop me" style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }} />
              </ReactCrop>
            </div>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => { setCropImageSrc(null); setCrop(undefined); if(fileRef.current) fileRef.current.value=''; }}>Cancel</button>
              <button className="btn btn-primary" onClick={finalizeCrop}>Save & Add Page</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 'result' && result && (
        <div>
          {/* Score banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(108,59,255,0.1))',
            border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-xl)',
            padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 60, fontWeight: 900, fontFamily: 'Outfit', color: 'var(--success)', lineHeight: 1 }}>{result.marks}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>out of {result.total} marks</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Outfit', marginBottom: 4 }}>Assessment Complete!</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {topic} • {qtype} • {difficulty}
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: `${(parseInt(result.marks) / parseInt(result.total)) * 100}%`, background: 'linear-gradient(90deg, var(--success), #34D399)' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {Math.round((parseInt(result.marks) / parseInt(result.total)) * 100)}% Score
              </div>
            </div>
          </div>

          <div className="grid-3" style={{ marginBottom: 20 }}>
            {/* Positives */}
            <div className="card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)', marginBottom: 14 }}>✅ What You Did Well</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.positive.map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Negatives */}
            <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--danger)', marginBottom: 14 }}>❌ Areas Needing Work</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.negative.map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--danger)', flexShrink: 0 }}>✗</span>{p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning)', marginBottom: 14 }}>💡 How to Improve</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.improve.map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--warning)', flexShrink: 0 }}>→</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary btn-lg" onClick={reset}>📄 New Essay Question</button>
            <button className="btn btn-secondary">💾 Save to Portfolio</button>
            <button className="btn btn-secondary">🖨️ Print Report</button>
          </div>
        </div>
      )}
    </div>
  );
}
