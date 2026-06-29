'use client';
import React, { useState } from 'react';

// --- DATABASE MOCKS ---

const DRUG_DB = [
  { 
    id: 'paracetamol', name: 'Paracetamol', class: 'Analgesic / Antipyretic', route: 'Oral / IV',
    standardAdult: '500 - 1000 mg every 4-6 hours', pediatricDose: '15 mg/kg every 4-6 hours',
    maxDose: '4000 mg/day (Adult)', renalDose: 'Increase interval in severe impairment (CrCl < 10 mL/min).',
    forms: 'Tablets 500mg, IV 10mg/mL, Syrup 120mg/5mL', moa: 'Inhibits prostaglandin synthesis in the CNS.',
    indications: 'Mild to moderate pain, fever.', contraindications: 'Severe hepatic impairment.',
    adverseEffects: 'Hepatotoxicity (in overdose).', interactions: 'Warfarin (enhances anticoagulant effect).',
    alerts: ['Max daily dose 4g/day adult', 'Caution in liver disease']
  },
  { 
    id: 'amoxicillin', name: 'Amoxicillin', class: 'Aminopenicillin', route: 'Oral / IV',
    standardAdult: '500 mg every 8 hours', pediatricDose: '25-45 mg/kg/day in divided doses',
    maxDose: '4000 mg/day', renalDose: 'Reduce dose if CrCl < 30 mL/min',
    forms: 'Capsules 250/500mg, Suspension 125/250mg/5mL', moa: 'Inhibits bacterial cell wall synthesis.',
    indications: 'Otitis media, RTIs, UTIs, skin infections.', contraindications: 'Penicillin hypersensitivity.',
    adverseEffects: 'Rash, diarrhea, anaphylaxis.', interactions: 'Methotrexate, Allopurinol.',
    alerts: ['Check for penicillin allergy before prescribing']
  },
  { 
    id: 'gentamicin', name: 'Gentamicin', class: 'Aminoglycoside Antibiotic', route: 'IV / IM',
    standardAdult: '5-7 mg/kg IV once daily', pediatricDose: '7.5 mg/kg IV once daily',
    maxDose: 'Varies based on levels', renalDose: 'Strict dose adjustment and therapeutic monitoring required.',
    forms: 'IV vials 40mg/mL', moa: 'Binds to 30S ribosomal subunit, inhibiting protein synthesis.',
    indications: 'Severe gram-negative infections.', contraindications: 'Myasthenia gravis, pregnancy.',
    adverseEffects: 'Nephrotoxicity, Ototoxicity.', interactions: 'Loop diuretics (increased ototoxicity).',
    alerts: ['Requires therapeutic drug monitoring', 'Highly Nephrotoxic & Ototoxic']
  },
  {
    id: 'dopamine', name: 'Dopamine', class: 'Inotropic Agent / Vasopressor', route: 'IV Infusion',
    standardAdult: '2-20 mcg/kg/min', pediatricDose: '2-20 mcg/kg/min',
    maxDose: '50 mcg/kg/min', renalDose: 'No specific adjustment.',
    forms: 'IV Ampoules 200mg/5mL', moa: 'Stimulates dopaminergic, beta-1, and alpha-1 receptors dose-dependently.',
    indications: 'Hypotension, shock, heart failure.', contraindications: 'Pheochromocytoma, uncorrected tachyarrhythmias.',
    adverseEffects: 'Tachycardia, angina, arrhythmias, necrosis if extravasation occurs.', interactions: 'MAOIs (prolonged effect).',
    alerts: ['Administer via central line if possible', 'Monitor ECG and BP continuously']
  }
];

const CALC_CATEGORIES = [
  {
    name: 'Basic Dosing',
    calcs: [
      { id: 'weight_dose', name: 'Weight-Based Dose' },
      { id: 'pediatric_dose', name: 'Pediatric Dose' },
    ]
  },
  {
    name: 'Infusion Calculations',
    calcs: [
      { id: 'infusion_rate', name: 'Continuous Infusion Rate' },
      { id: 'dopamine_infusion', name: 'Inotrope Infusion (mcg/kg/min)' },
    ]
  },
  {
    name: 'Renal Calculations',
    calcs: [
      { id: 'crcl', name: 'Creatinine Clearance (CrCl)' },
    ]
  },
  {
    name: 'Fluid & Body',
    calcs: [
      { id: 'maintenance_fluid', name: 'Maintenance Fluids' },
      { id: 'bsa', name: 'Body Surface Area (BSA)' },
    ]
  }
];

// --- MAIN COMPONENT ---

export default function DrugCalculationsPage() {
  const [step, setStep] = useState(1);
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [selectedCalc, setSelectedCalc] = useState('');
  
  // Custom Drug State
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customDrug, setCustomDrug] = useState({
    id: 'custom', name: '', class: '', route: '',
    standardAdult: 'N/A', pediatricDose: 'N/A', maxDose: 'N/A', renalDose: 'N/A',
    forms: 'N/A', moa: 'Custom drug entry', indications: 'N/A', contraindications: 'N/A',
    adverseEffects: 'N/A', interactions: 'N/A', alerts: [] as string[]
  });
  
  // Patient Details
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [gender, setGender] = useState('male');
  
  // Calc Specific Fields
  const [dosePerKg, setDosePerKg] = useState('');
  const [concentration, setConcentration] = useState('');
  const [customDose, setCustomDose] = useState('');
  
  const [results, setResults] = useState<any>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const drug = isAddingCustom ? (customDrug.name ? customDrug : undefined) : DRUG_DB.find(d => d.id === selectedDrugId);
  const calcName = CALC_CATEGORIES.flatMap(c => c.calcs).find(c => c.id === selectedCalc)?.name;

  const handleCalculate = () => {
    const W = parseFloat(weight);
    const H = parseFloat(height);
    const A = parseFloat(age);
    const Cr = parseFloat(creatinine);

    let calcData: any = {
      formula: '',
      resultStr: '',
      details: []
    };
    const warnings = [];

    if (selectedCalc === 'weight_dose' || selectedCalc === 'pediatric_dose') {
      const dose = parseFloat(dosePerKg) || (selectedDrugId === 'paracetamol' ? 15 : 5);
      const total = W * dose;
      calcData.formula = `Dose = Weight (${W} kg) × Recommended Dose/kg (${dose} mg/kg)`;
      calcData.resultStr = `${total.toFixed(1)} mg`;
      calcData.details = [
        { label: 'Recommended Dose', value: `${dose} mg/kg` },
        { label: 'Patient Weight', value: `${W} kg` }
      ];
      if (drug && total > 1000 && drug.id === 'paracetamol') warnings.push('Calculated dose exceeds standard adult single max (1000mg).');
      if (selectedCalc === 'pediatric_dose') warnings.push('Pediatric doses must not exceed the maximum adult dose.');
    } 
    else if (selectedCalc === 'infusion_rate' || selectedCalc === 'dopamine_infusion') {
      const targetDose = parseFloat(customDose); // mcg/kg/min
      const conc = parseFloat(concentration); // mcg/mL
      const rate = (targetDose * W * 60) / conc;
      calcData.formula = `Rate (mL/hr) = [Dose (${targetDose} mcg/kg/min) × Weight (${W} kg) × 60 min] ÷ Concentration (${conc} mcg/mL)`;
      calcData.resultStr = `${rate.toFixed(1)} mL/hr`;
      calcData.details = [
        { label: 'Target Dose', value: `${targetDose} mcg/kg/min` },
        { label: 'Concentration', value: `${conc} mcg/mL` }
      ];
      warnings.push('Ensure infusion pump is programmed correctly to prevent medication errors.');
    }
    else if (selectedCalc === 'crcl') {
      const crcl = ((140 - A) * W) / (72 * Cr) * (gender === 'female' ? 0.85 : 1);
      calcData.formula = `CrCl = [((140 - Age) × Weight) / (72 × Serum Cr)] ${gender === 'female' ? '× 0.85' : ''}`;
      calcData.resultStr = `${crcl.toFixed(1)} mL/min`;
      if (crcl < 30) warnings.push('Severe renal impairment (CrCl < 30). Renal dose adjustments mandatory.');
    }
    else if (selectedCalc === 'maintenance_fluid') {
      let ml = 0;
      if (W <= 10) ml = W * 100;
      else if (W <= 20) ml = 1000 + (W - 10) * 50;
      else ml = 1500 + (W - 20) * 20;
      calcData.formula = 'Holliday-Segar Method: 100 mL/kg (1st 10kg) + 50 mL/kg (next 10kg) + 20 mL/kg (remaining)';
      calcData.resultStr = `${ml} mL/day (${(ml/24).toFixed(1)} mL/hr)`;
    }
    else if (selectedCalc === 'bsa') {
      const bsa = Math.sqrt((H * W) / 3600);
      calcData.formula = 'Mosteller Formula: BSA = √([Height(cm) × Weight(kg)] / 3600)';
      calcData.resultStr = `${bsa.toFixed(2)} m²`;
    }

    setResults({ ...calcData, warnings });
    setStep(4);
    setAiExplanation(null);
  };

  const handleAIAction = (action: string) => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      if (action === 'explain') {
        setAiExplanation(`**AI Pharmacist Explanation:**\nThe calculated dose is derived directly from established clinical guidelines. For ${drug?.name || 'this drug'}, weight-based dosing provides precise therapeutic plasma concentrations while minimizing toxicity. Because the patient weighs ${weight}kg, the formula scales the dose linearly up to the safe threshold.\n\n*Key Clinical Pearl:* Always ensure that pediatric weight-based calculations do not inadvertently exceed the standard adult maximum dose. Keep an eye on renal function as it may alter drug clearance.`);
      } else if (action === 'viva') {
        setAiExplanation(`**Clinical Viva Questions Generated:**\n1. What is the mechanism of action of ${drug?.name}?\n2. In a patient with renal failure, how would you adjust this ${results?.resultStr} dose?\n3. What are the earliest signs of toxicity for this medication, and what is the antidote or management strategy?`);
      }
    }, 1500);
  };

  return (
    <div className="page-container" style={{ paddingBottom: 60 }}>
      <div className="page-header" style={{ marginBottom: 30 }}>
        <h1 className="page-title font-outfit" style={{ fontSize: 28, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: 'var(--primary)', color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 20 }}>Rx</span>
          Advanced Dosing Assistant
        </h1>
        <p className="page-desc">Drug Calculations, Dosing Rules, and Clinical Pharmacology Learning Tool</p>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 30 }}>
        {['Select Drug', 'Calculation Type', 'Patient Details', 'Results'].map((s, i) => (
          <div key={i} style={{ 
            flex: 1, height: 6, borderRadius: 10, 
            background: step > i ? 'var(--primary)' : step === i + 1 ? 'var(--primary-light)' : 'var(--border)',
            transition: 'all 0.3s'
          }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: step === 4 ? '1fr' : '1fr 1fr', gap: 24 }}>
        
        {/* LEFT COLUMN: Input Workflow */}
        {step < 4 && (
          <div className="card shadow-sm" style={{ borderTop: '4px solid var(--primary)' }}>
            
            {step === 1 && (
              <div className="animate-fadeIn">
                <h2 style={{ fontSize: 18, marginBottom: 16 }}>Step 1: Enter Drug Information</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label className="label" style={{ marginBottom: 0 }}>{isAddingCustom ? 'Enter Custom Drug Details' : 'Search Generic Drug Database'}</label>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setIsAddingCustom(!isAddingCustom)}>
                    {isAddingCustom ? 'Cancel' : '+ Add Custom Drug'}
                  </button>
                </div>
                {isAddingCustom ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input type="text" className="input-field" placeholder="Drug Name (e.g. Ciprofloxacin)" value={customDrug.name} onChange={e => setCustomDrug({...customDrug, name: e.target.value})} />
                    <input type="text" className="input-field" placeholder="Drug Class (e.g. Fluoroquinolone)" value={customDrug.class} onChange={e => setCustomDrug({...customDrug, class: e.target.value})} />
                    <input type="text" className="input-field" placeholder="Route (e.g. Oral/IV)" value={customDrug.route} onChange={e => setCustomDrug({...customDrug, route: e.target.value})} />
                  </div>
                ) : (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select className="input-field" value={selectedDrugId} onChange={e => setSelectedDrugId(e.target.value)}>
                      <option value="">— Select a Drug —</option>
                      {DRUG_DB.map(d => <option key={d.id} value={d.id}>{d.name} ({d.class})</option>)}
                    </select>
                  </div>
                )}
                {drug && (
                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 16 }}>
                    <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>DRUG PROFILE</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>{drug.name}</div>
                    <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>{drug.class} • {drug.route}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                      <div><strong>Adult Dose:</strong> {drug.standardAdult}</div>
                      <div><strong>Peds Dose:</strong> {drug.pediatricDose}</div>
                      <div style={{ color: '#B91C1C' }}><strong>Max Dose:</strong> {drug.maxDose}</div>
                      <div><strong>Renal:</strong> {drug.renalDose}</div>
                    </div>
                  </div>
                )}
                <button className="btn btn-primary" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }} disabled={isAddingCustom ? !customDrug.name : !selectedDrugId} onClick={() => setStep(2)}>
                  Next: Select Calculation ➔
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fadeIn">
                <h2 style={{ fontSize: 18, marginBottom: 16 }}>Step 2: Select Calculation Type</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {CALC_CATEGORIES.map(cat => (
                    <div key={cat.name}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{cat.name}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {cat.calcs.map(c => (
                          <button key={c.id} onClick={() => setSelectedCalc(c.id)} style={{
                            padding: '12px', textAlign: 'left', borderRadius: 8, border: `2px solid ${selectedCalc === c.id ? 'var(--primary)' : 'var(--border)'}`,
                            background: selectedCalc === c.id ? 'var(--primary-light)' : '#fff', color: selectedCalc === c.id ? '#fff' : 'var(--text)',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
                          }}>
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={!selectedCalc} onClick={() => setStep(3)}>Next: Patient Details ➔</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fadeIn">
                <h2 style={{ fontSize: 18, marginBottom: 16 }}>Step 3: Patient Information</h2>
                <div style={{ background: '#F0F9FF', padding: '10px 14px', borderRadius: 6, border: '1px solid #BAE6FD', color: '#0284C7', fontSize: 13, marginBottom: 20 }}>
                  <strong>Calculation:</strong> {calcName}
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="label">Weight (kg)</label>
                    <input type="number" className="input-field" value={weight} onChange={e => setWeight(e.target.value)} />
                  </div>
                  {(selectedCalc === 'crcl' || selectedCalc === 'pediatric_dose') && (
                    <div className="form-group">
                      <label className="label">Age (years)</label>
                      <input type="number" className="input-field" value={age} onChange={e => setAge(e.target.value)} />
                    </div>
                  )}
                  {selectedCalc === 'bsa' && (
                    <div className="form-group">
                      <label className="label">Height (cm)</label>
                      <input type="number" className="input-field" value={height} onChange={e => setHeight(e.target.value)} />
                    </div>
                  )}
                  {selectedCalc === 'crcl' && (
                    <>
                      <div className="form-group">
                        <label className="label">Serum Creatinine (mg/dL)</label>
                        <input type="number" className="input-field" value={creatinine} onChange={e => setCreatinine(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="label">Gender</label>
                        <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
                          <option value="male">Male</option><option value="female">Female</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {/* Additional Calc Fields */}
                {(selectedCalc === 'weight_dose' || selectedCalc === 'pediatric_dose') && (
                  <div className="form-group" style={{ marginTop: 10 }}>
                    <label className="label">Dose per kg (mg/kg)</label>
                    <input type="number" className="input-field" value={dosePerKg} onChange={e => setDosePerKg(e.target.value)} placeholder={`e.g. ${selectedDrugId==='paracetamol'?'15':'5'}`} />
                  </div>
                )}
                {(selectedCalc === 'infusion_rate' || selectedCalc === 'dopamine_infusion') && (
                  <div className="grid-2" style={{ marginTop: 10 }}>
                    <div className="form-group">
                      <label className="label">Target Dose (mcg/kg/min)</label>
                      <input type="number" className="input-field" value={customDose} onChange={e => setCustomDose(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Concentration (mcg/mL)</label>
                      <input type="number" className="input-field" value={concentration} onChange={e => setConcentration(e.target.value)} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', background: '#10B981', borderColor: '#10B981' }} onClick={handleCalculate}>🧮 Calculate Dose</button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* EDUCATIONAL PANEL (Shown during steps 1-3) */}
        {step < 4 && (
          <div className="card shadow-sm" style={{ background: '#F8FAFC' }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🎓</span> Educational Mode
            </h3>
            {drug ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 12, background: '#fff', borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>MECHANISM OF ACTION</div>
                  <div style={{ fontSize: 13, color: '#334155' }}>{drug.moa}</div>
                </div>
                <div style={{ padding: 12, background: '#fff', borderRadius: 8, borderLeft: '3px solid #10B981' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', marginBottom: 4 }}>INDICATIONS</div>
                  <div style={{ fontSize: 13, color: '#334155' }}>{drug.indications}</div>
                </div>
                <div style={{ padding: 12, background: '#fff', borderRadius: 8, borderLeft: '3px solid #EF4444' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>CONTRAINDICATIONS</div>
                  <div style={{ fontSize: 13, color: '#334155' }}>{drug.contraindications}</div>
                </div>
                <div style={{ padding: 12, background: '#fff', borderRadius: 8, borderLeft: '3px solid #F59E0B' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', marginBottom: 4 }}>ADVERSE EFFECTS & INTERACTIONS</div>
                  <div style={{ fontSize: 13, color: '#334155' }}><strong>AEs:</strong> {drug.adverseEffects}<br/><strong>Interactions:</strong> {drug.interactions}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
                <p>Select a drug to view its pharmacology profile, mechanism of action, and clinical pearls.</p>
              </div>
            )}
          </div>
        )}

        {/* RESULTS PANEL (Step 4) */}
        {step === 4 && results && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, margin: 0 }}>Calculation Report</h2>
              <button className="btn btn-secondary" onClick={() => setStep(3)}>↺ Recalculate</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Result Hero */}
                <div className="card shadow-sm" style={{ border: '2px solid var(--primary)', background: 'linear-gradient(135deg, rgba(108,59,255,0.05), #fff)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 8, textTransform: 'uppercase' }}>FINAL RESULT</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>{results.resultStr}</div>
                  
                  <div style={{ padding: '12px 14px', background: '#F1F5F9', borderRadius: 6, fontSize: 13, fontFamily: 'monospace', color: '#334155', border: '1px solid #E2E8F0' }}>
                    <strong>Formula:</strong> {results.formula}
                  </div>
                </div>

                {/* Warnings */}
                {results.warnings.length > 0 && (
                  <div className="card" style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>⚠️</span> Safety Alerts
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: '#7F1D1D', fontSize: 13 }}>
                      {results.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                      {drug?.alerts.map((a, i) => <li key={`d-${i}`}>{a}</li>)}
                    </ul>
                  </div>
                )}

                {/* Patient & Drug Summary */}
                <div className="card shadow-sm" style={{ padding: 20 }}>
                  <h4 style={{ fontSize: 14, margin: '0 0 12px 0' }}>Report Details</h4>
                  <table style={{ width: '100%', fontSize: 13, textAlign: 'left' }}>
                    <tbody>
                      <tr><td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Drug</td><td style={{ fontWeight: 600 }}>{drug?.name || 'N/A'}</td></tr>
                      <tr><td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Calculation</td><td style={{ fontWeight: 600 }}>{calcName}</td></tr>
                      <tr><td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Patient Weight</td><td style={{ fontWeight: 600 }}>{weight} kg</td></tr>
                      {age && <tr><td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Age</td><td style={{ fontWeight: 600 }}>{age} yrs</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI & Education Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                <div className="card shadow-sm">
                  <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>✨</span> AI Clinical Assistant
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', background: '#F8FAFC' }} onClick={() => handleAIAction('explain')}>
                      🧠 Explain this dose & rationale
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', background: '#F8FAFC' }} onClick={() => handleAIAction('viva')}>
                      📝 Generate Viva Questions on {drug?.name || 'this drug'}
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', background: '#F8FAFC' }}>
                      🏥 Generate Clinical Case
                    </button>
                  </div>

                  {aiGenerating && (
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--primary)', fontSize: 13, background: '#F0F9FF', borderRadius: 8 }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }}>⌛</span>
                      AI is generating insights...
                    </div>
                  )}

                  {aiExplanation && !aiGenerating && (
                    <div style={{ padding: 16, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap' }}>
                      {aiExplanation}
                    </div>
                  )}
                </div>

                <div className="card shadow-sm" style={{ background: '#F0FDFA', border: '1px solid #CCFBF1' }}>
                  <h3 style={{ fontSize: 14, color: '#0F766E', marginBottom: 8 }}>Save & Export</h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" style={{ flex: 1, background: '#0F766E', borderColor: '#0F766E', fontSize: 12 }}>💾 Save Report</button>
                    <button className="btn btn-secondary" style={{ flex: 1, fontSize: 12 }}>📄 Download PDF</button>
                  </div>
                </div>

              </div>

            </div>
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
