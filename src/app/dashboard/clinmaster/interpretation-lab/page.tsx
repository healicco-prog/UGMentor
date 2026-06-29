'use client';
import React, { useState, useRef } from 'react';

type ScanType = 'ECG' | 'X-Ray' | 'CT Scan' | 'MRI' | 'Laboratory Report' | 'Other';

const SCAN_GUIDES: Record<ScanType, { steps: string[]; findings: string[]; color: string; icon: string }> = {
  ECG: {
    icon: '💓', color: '#EF4444',
    steps: ['Check rate (HR = 300 ÷ RR interval in large squares)', 'Determine rhythm (regular/irregular)', 'Assess axis (normal: -30° to +90°)', 'P wave morphology (shape, PR interval 0.12-0.20s)', 'QRS complex (width <0.12s, morphology)', 'ST segment (elevation/depression, J point)', 'T wave (inversion, peaked)', 'QT interval (QTc = QT/√RR)', 'Look for specific patterns (LBBB, RBBB, WPW, AV blocks)'],
    findings: ['Normal Sinus Rhythm','Sinus Tachycardia','Sinus Bradycardia','Atrial Fibrillation','ST Elevation MI (STEMI)','Non-STEMI / ST Depression','Left Bundle Branch Block','Right Bundle Branch Block','Complete Heart Block','Ventricular Tachycardia','Left Ventricular Hypertrophy'],
  },
  'X-Ray': {
    icon: '🫁', color: '#6C3BFF',
    steps: ['Check: Patient name, date, projection (PA/AP), rotation', 'Adequacy: 10 posterior ribs visible', 'Trachea: midline, any deviation?', 'Bones: Ribs, clavicles, scapulae, vertebrae — fractures?', 'Cardiac size: CTR <0.5, silhouette, border clarity', 'Mediastinum: Width <8cm, hilar positions', 'Lungs: Opacity, lucency, compare both sides', 'Pleura: Costophrenic angles (effusion?), pneumothorax?', 'Diaphragm: Clear domes, air under diaphragm?', 'Soft tissues: Subcutaneous emphysema?'],
    findings: ['Normal CXR','Cardiomegaly','Pleural Effusion','Pneumothorax','Consolidation / Pneumonia','Pulmonary Oedema','Collapse / Atelectasis','Cavitation / Abscess','Mediastinal Widening','Rib Fractures','Free Air Under Diaphragm'],
  },
  'CT Scan': {
    icon: '🔬', color: '#0EA5E9',
    steps: ['Check: Window settings (brain, lung, bone, abdomen windows)', 'Systematic review: skull → brain → posterior fossa → orbits → sinuses', 'Brain CT: ABCS mnemonic (Air, Blood, CSF spaces, Substance)', 'Look for: Hyperdense areas (blood), hypodense (infarct/oedema)', 'Ventricles: Symmetry, midline shift, hydrocephalus?', 'Chest CT: Mediastinum, lungs, pleura, vasculature', 'Abdominal CT: Organs, bowel, mesentery, retroperitoneum', 'Bone windows: Fractures, osteolytic/blastic lesions', 'Note: IV contrast enhancement patterns'],
    findings: ['Normal CT Brain','Intracerebral Haemorrhage','Ischaemic Infarct','Subdural Haematoma','Extradural Haematoma','Subarachnoid Haemorrhage','Pulmonary Embolism','Aortic Dissection','Bowel Obstruction','Pneumonia on CT','Liver Lesion / Mass'],
  },
  MRI: {
    icon: '🧲', color: '#10B981',
    steps: ['Identify: Sequence (T1, T2, FLAIR, DWI, ADC)', 'T1: Fat = bright, CSF = dark, blood (subacute) = bright', 'T2: CSF = bright, fat = dark, pathology often bright', 'FLAIR: CSF suppressed, useful for periventricular lesions', 'DWI: Restricted diffusion = bright (acute infarct)', 'ADC: Bright in vasogenic oedema, dark in cytotoxic oedema', 'Review all planes: Axial, sagittal, coronal', 'Gadolinium enhancement: Blood-brain barrier breakdown', 'Musculoskeletal MRI: Tendons, ligaments, cartilage, bone marrow'],
    findings: ['Normal MRI Brain','Acute Ischaemic Infarct (DWI)','Demyelinating Lesions (MS)','Brain Tumour / Glioma','Disc Prolapse','Spinal Cord Compression','Ligament Tear (MSK)','Meniscal Tear (Knee)','Avascular Necrosis'],
  },
  'Laboratory Report': {
    icon: '🧪', color: '#F59E0B',
    steps: ['Check patient details and date on report', 'Identify the test (CBC, LFT, RFT, TFT, etc.)', 'Compare each value against reference range', 'CBC: Hb, WBC (differential), Platelets', 'RFT: Creatinine, BUN, eGFR, electrolytes', 'LFT: Bilirubin (total/direct), AST, ALT, ALP, GGT, albumin', 'Interpret in clinical context', 'Identify critical values requiring immediate action', 'Look for patterns (hepatocellular vs cholestatic jaundice)'],
    findings: ['Normal CBC','Anaemia (microcytic/macrocytic/normocytic)','Leukocytosis / Leukopenia','Thrombocytopenia','Elevated Creatinine (AKI/CKD)','Elevated Liver Enzymes','Hyponatraemia / Hypernatraemia','Hypokalaemia / Hyperkalaemia','Elevated Troponin','Elevated D-Dimer','Abnormal TFT (Hypo/Hyperthyroid)'],
  },
  Other: {
    icon: '📋', color: '#8B5CF6',
    steps: ['Identify the type of investigation/report', 'Check patient details, date, requesting physician', 'Read the report systematically', 'Identify key abnormal findings', 'Correlate with clinical presentation', 'Compare with previous reports if available', 'Note any critical values', 'Document your interpretation and clinical correlation'],
    findings: ['Abnormal findings noted','Normal report','Requires repeat testing','Requires specialist review'],
  },
};

interface ReportSection {
  label: string;
  value: string;
}

const formatText = (text: string) => {
  return text.split('\n').map((line, idx, arr) => {
    let formattedLine = line.trim();
    if (formattedLine.startsWith('* ')) {
      formattedLine = '• ' + formattedLine.slice(2);
    } else if (formattedLine.startsWith('- ')) {
      formattedLine = '• ' + formattedLine.slice(2);
    }
    
    const parts = formattedLine.split(/\*\*(.*?)\*\*/g);
    
    return (
      <React.Fragment key={idx}>
        {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
        {idx < arr.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export default function InterpretationLabPage() {
  const [scanType, setScanType] = useState<ScanType>('ECG');
  const [interpretation, setInterpretation] = useState('');
  const [clinicalCorrelation, setClinicalCorrelation] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; file: File } | null>(null);
  const [saved, setSaved] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportSection[] | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const guide = SCAN_GUIDES[scanType];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedFile({ name: file.name, url, file });
    setGeneratedReport(null);
    setReportError(null);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleGenerateReport = async () => {
    if (!uploadedFile) return;
    setGeneratingReport(true);
    setGeneratedReport(null);
    setReportError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('scanType', scanType);

      const res = await fetch('/api/generate-report', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate report');
      }

      const finalReport: ReportSection[] = [];
      let parsedInterpretation = '';
      let parsedCorrelation = '';

      data.report.forEach((sec: ReportSection) => {
        const lowerLabel = sec.label.toLowerCase();
        if (lowerLabel.includes('my interpretation')) {
          parsedInterpretation = sec.value;
        } else if (lowerLabel.includes('clinical correlation') || lowerLabel.includes('plan')) {
          parsedCorrelation = sec.value;
        } else {
          finalReport.push(sec);
        }
      });

      setGeneratedReport(finalReport);
      
      // Auto-populate the textareas if they were empty or if we want to overwrite
      setInterpretation(parsedInterpretation);
      setClinicalCorrelation(parsedCorrelation);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setReportError(message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleScanTypeChange = (type: ScanType) => {
    setScanType(type);
    setInterpretation('');
    setClinicalCorrelation('');
    setGeneratedReport(null);
    setReportError(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">🔬 Interpretation Lab</h1>
        <p className="page-desc">Upload ECG, X-Ray, CT, MRI, Lab Reports — Interpret with systematic AI-guided frameworks</p>
      </div>

      {/* Type selector */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {(Object.keys(SCAN_GUIDES) as ScanType[]).map(type => (
          <button key={type} onClick={() => handleScanTypeChange(type)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--radius-md)', border: `2px solid ${scanType === type ? SCAN_GUIDES[type].color : 'var(--border)'}`, background: scanType === type ? `${SCAN_GUIDES[type].color}15` : 'var(--bg-card)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: scanType === type ? SCAN_GUIDES[type].color : 'var(--text-secondary)', transition: 'all 0.2s' }}>
            <span style={{ fontSize: 18 }}>{SCAN_GUIDES[type].icon}</span> {type}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, maxWidth: 1100 }}>
        {/* Left: Upload + Guide */}
        <div>
          {/* Upload */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{guide.icon} Upload {scanType}</div>
            <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${uploadedFile ? guide.color : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '28px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: uploadedFile ? `${guide.color}08` : 'var(--bg-surface)' }}>
              {uploadedFile ? (
                <>
                  {uploadedFile.name.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ? (
                    <img src={uploadedFile.url} alt="Uploaded scan" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
                  ) : (
                    <div style={{ fontSize: 48, marginBottom: 8 }}>{guide.icon}</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: guide.color }}>{uploadedFile.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Click to change file</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>{guide.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Click to upload {scanType}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports: JPG, PNG, PDF</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} />

            {/* Generate Report Button — shown only after upload */}
            {uploadedFile && (
              <div style={{ marginTop: 16 }}>
                <button
                  id="generate-report-btn"
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '13px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: generatingReport
                      ? 'var(--bg-surface)'
                      : `linear-gradient(135deg, ${guide.color}, ${guide.color}bb)`,
                    color: generatingReport ? 'var(--text-muted)' : '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: generatingReport ? 'not-allowed' : 'pointer',
                    boxShadow: generatingReport ? 'none' : `0 4px 16px ${guide.color}44`,
                    transition: 'all 0.25s',
                    letterSpacing: '0.3px',
                  }}
                >
                  {generatingReport ? (
                    <>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 16 }}>⏳</span>
                      Gemini AI is analyzing…
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 18 }}>✨</span>
                      Generate Report
                    </>
                  )}
                </button>

                {/* AI Disclaimer Note */}
                <div style={{
                  marginTop: 10,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#FFF7ED',
                  border: '1px solid #FED7AA',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                  <p style={{ fontSize: 11.5, color: '#92400E', margin: 0, lineHeight: 1.6 }}>
                    <strong>Educational Purpose Only.</strong> This is an AI-generated report powered by Google Gemini, designed to support learning and self-assessment. It is <strong>not</strong> a clinical diagnosis and must <strong>not</strong> be used for patient management decisions. Always consult a qualified clinician.
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {reportError && (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>❌</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', marginBottom: 3 }}>Report Generation Failed</div>
                  <div style={{ fontSize: 11.5, color: '#7F1D1D' }}>{reportError}</div>
                  {reportError.includes('GEMINI_API_KEY') && (
                    <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 6, padding: '6px 8px', background: '#fff', borderRadius: 6, border: '1px solid #FECACA' }}>
                      👉 Add your key to <code style={{ fontFamily: 'monospace', fontSize: 10 }}>.env.local</code> → <code style={{ fontFamily: 'monospace', fontSize: 10 }}>GEMINI_API_KEY=AIza...</code> and restart the server.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Systematic Approach */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: guide.color }}>📋 Systematic Approach — {scanType}</div>
            {guide.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < guide.steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${guide.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: guide.color, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Interpretation */}
        <div>
          {/* Gemini AI Generated Report Display */}
          {generatedReport && (
            <div className="card" style={{
              marginBottom: 16,
              border: `2px solid ${guide.color}55`,
              background: `linear-gradient(135deg, ${guide.color}06, var(--bg-card))`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}>✨</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: guide.color }}>Gemini AI Report</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{scanType} · {uploadedFile?.name}</div>
                  </div>
                </div>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#FEF3C7',
                  color: '#92400E',
                  fontSize: 10,
                  fontWeight: 700,
                  border: '1px solid #FDE68A',
                  letterSpacing: '0.5px',
                }}>EDUCATIONAL ONLY</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {generatedReport.map((section, i) => (
                  <div key={i} style={{
                    padding: '10px 13px',
                    borderRadius: 'var(--radius-sm)',
                    background: i % 2 === 0 ? 'var(--bg-surface)' : 'transparent',
                    borderLeft: `3px solid ${i === generatedReport.length - 1 ? guide.color : `${guide.color}55`}`,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 11.5, color: guide.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {section.label}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {formatText(section.value)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom disclaimer ribbon */}
              <div style={{
                marginTop: 14,
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(90deg, #FFF7ED, #FFFBEB)',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>🎓</span>
                <p style={{ fontSize: 11, color: '#78350F', margin: 0, lineHeight: 1.5 }}>
                  This AI-generated report is produced <strong>for educational purposes only</strong> using Google Gemini. It does not constitute a medical diagnosis and should not replace professional clinical judgment.
                </p>
              </div>
            </div>
          )}



          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>✍️ My Interpretation</div>
            <textarea className="input-field" rows={6} value={interpretation} onChange={e => setInterpretation(e.target.value)}
              placeholder={`Describe your systematic interpretation of this ${scanType}…\n\nExample:\n• Rate/Quality: …\n• Key findings: …\n• Abnormalities: …\n• Impression: …`} />
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🏥 Clinical Correlation & Plan</div>
            <textarea className="input-field" rows={4} value={clinicalCorrelation} onChange={e => setClinicalCorrelation(e.target.value)}
              placeholder="How do these findings correlate with the clinical presentation? What is your management plan?" />
          </div>

          <button className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave}>
            {saved ? '✅ Interpretation Saved!' : `💾 Save ${scanType} Interpretation`}
          </button>
        </div>
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
