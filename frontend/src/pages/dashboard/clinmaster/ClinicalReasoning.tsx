// React component
import React, { useState, useEffect } from 'react';

const COURSE_DATA: Record<string,string[]> = {
  MBBS:['General Medicine','General Surgery','Pediatrics','Obstetrics & Gynaecology','Emergency Medicine','Orthopedics','Dermatology','Psychiatry'],
  BDS:['Oral Medicine','Oral Surgery','Oral Pathology'],
  'BSc Nursing':['Adult Health Nursing','Child Health Nursing'],
  Other:[],
};
const CASES: Record<string,string[]> = {
  'General Medicine':['Chest Pain','Shortness of Breath','Jaundice','Fever','Altered Consciousness','Haematuria','Anaemia','Weight Loss'],
  'General Surgery':['Acute Abdomen','Neck Swelling','Breast Lump','Rectal Bleeding','Inguinal Swelling'],
  'Pediatrics':['Febrile Child','Child with Seizure','Failure to Thrive','Cyanotic Newborn'],
  'Emergency Medicine':['Unconscious Patient','Anaphylaxis','Polytrauma','Acute Poisoning'],
};

function genDDx(c:string,s:string,cas:string){
  return [
    {rank:1,diagnosis:`Most Likely: Primary ${cas}`,probability:'High',reasoning:`Classic presentation of ${cas} in ${s}. History and examination findings strongly support this diagnosis. First-line investigations: CBC, metabolic panel, ECG, imaging as appropriate.`,investigations:'CBC, CMP, ECG, CXR, relevant imaging',management:'Immediate stabilisation, specific treatment per guidelines'},
    {rank:2,diagnosis:`${cas} with complications`,probability:'High',reasoning:`Consider complicated course if patient shows systemic signs, abnormal vitals, or co-morbidities. Warrants aggressive investigation and specialist review.`,investigations:'Extended lab panel, CT/MRI, specialist consult',management:'Escalate care, monitor closely, consider ICU'},
    {rank:3,diagnosis:`Atypical presentation of ${cas}`,probability:'Medium',reasoning:`Atypical features may mask the true diagnosis. Consider in elderly, immunocompromised, or diabetic patients where classic signs may be absent.`,investigations:'Targeted investigations based on atypical features',management:'Treat empirically while awaiting confirmation'},
    {rank:4,diagnosis:`Secondary ${cas} (underlying cause)`,probability:'Medium',reasoning:`May be secondary to underlying systemic disease — DM, HTN, malignancy, autoimmune. Look for systemic clues in history and examination.`,investigations:'ANA, tumour markers, thyroid function, glucose',management:'Treat underlying cause alongside presenting complaint'},
    {rank:5,diagnosis:`Drug-induced / Iatrogenic`,probability:'Low',reasoning:`Always consider medication side effects or interactions. Review complete drug history including OTC and herbal medications.`,investigations:'Drug levels, liver/renal function, drug interaction screen',management:'Withdraw offending agent, supportive care'},
    {rank:6,diagnosis:`Functional / Psychosomatic`,probability:'Low',reasoning:`After ruling out organic causes, consider functional disorder especially if chronic, inconsistent symptoms with normal investigations.`,investigations:'Psychiatric assessment, PHQ-9, GAD-7',management:'Reassurance, CBT referral, symptom management'},
  ];
}

function genDrug(name:string){
  return {
    moa:`${name} acts by targeting specific receptors or enzymes involved in the pathophysiological pathway. It competitively or non-competitively inhibits/activates the target, leading to downstream effects that produce the therapeutic benefit. The onset, duration, and intensity of action depend on pharmacokinetic properties including bioavailability, protein binding, and half-life.`,
    indications:`Primary indications: As first-line or adjunct therapy in the management of conditions where ${name} has proven efficacy. Secondary indications include off-label use in selected cases based on clinical evidence. Dosage varies by indication, severity, and patient factors.`,
    adverse:`Common (>10%): GI disturbance, headache, dizziness. Uncommon (1-10%): Rash, elevated liver enzymes, electrolyte imbalance. Rare (<1%): Serious hypersensitivity reactions, organ toxicity. Monitor: LFTs, RFTs, CBC periodically. Contraindicated in: Pregnancy (if teratogenic), severe hepatic/renal failure, known hypersensitivity.`,
    interactions:`Major interactions: Avoid co-administration with drugs that share metabolic pathways (CYP450 interactions). Moderate interactions: Additive effects with similar drug classes — monitor closely. Minor: Adjust dose when used with inducers or inhibitors. Food interactions: Check for grapefruit juice, high-fat meals affecting absorption.`,
    dosing:`Adult standard dose: As per clinical guidelines (mg/kg or fixed dose). Renal adjustment: Reduce dose when eGFR <30 mL/min. Hepatic adjustment: Use with caution in Child-Pugh B/C. Paediatric dose: Weight-based calculation — consult formulary. Route: Oral / IV / IM as indicated. Duration: Determined by indication and response.`,
    monitoring:`Efficacy: Clinical response, relevant biomarkers, imaging. Safety: Organ function tests (LFT, RFT, CBC) at baseline and periodically. Therapeutic drug monitoring: Required for narrow therapeutic index drugs. Patient counselling: Adherence, side effects to watch, when to seek help.`,
  };
}

const DB_DDX = 'ugmentor_ddx_db';
const DB_DRUG = 'ugmentor_drug_db';
function load(key:string){if(typeof window==='undefined')return[];try{return JSON.parse(localStorage.getItem(key)||'[]');}catch{return[];}}
function save(key:string,data:unknown[]){localStorage.setItem(key,JSON.stringify(data));}

export default function ClinicalReasoningPage(){
  const [tool,setTool]=useState<'ddx'|'drug'>('ddx');

  // DDx state
  const [course,setCourse]=useState('MBBS');
  const [subject,setSubject]=useState('');
  const [clinCase,setClinCase]=useState('');
  const [customCase,setCustomCase]=useState('');
  const [ddxResult,setDdxResult]=useState<ReturnType<typeof genDDx>|null>(null);
  const [genDDxLoading,setGenDDxLoading]=useState(false);
  const [ddxSaved,setDdxSaved]=useState('');
  const [ddxLib,setDdxLib]=useState<{id:string;case:string;subject:string;course:string;items:ReturnType<typeof genDDx>;savedAt:string}[]>([]);

  // Drug state
  const [drugName,setDrugName]=useState('');
  const [drugResult,setDrugResult]=useState<ReturnType<typeof genDrug>|null>(null);
  const [drugLoading,setDrugLoading]=useState(false);
  const [drugSaved,setDrugSaved]=useState('');
  const [drugLib,setDrugLib]=useState<{id:string;name:string;data:ReturnType<typeof genDrug>;savedAt:string}[]>([]);
  const [showDdxLib,setShowDdxLib]=useState(false);
  const [showDrugLib,setShowDrugLib]=useState(false);

  useEffect(()=>{setDdxLib(load(DB_DDX));setDrugLib(load(DB_DRUG));},[]);

  const subjects=COURSE_DATA[course]||[];
  const cases=subject&&CASES[subject]?CASES[subject]:[];
  const activeCase=customCase.trim()||clinCase;

  const handleGenDDx=async()=>{
    if(!activeCase)return;
    setGenDDxLoading(true);setDdxResult(null);
    await new Promise(r=>setTimeout(r,1800));
    setDdxResult(genDDx(course,subject||'Clinical',activeCase));
    setGenDDxLoading(false);
  };

  const handleSaveDDx=()=>{
    if(!ddxResult)return;
    const entry={id:Date.now().toString(),case:activeCase,subject:subject||'Custom',course,items:ddxResult,savedAt:new Date().toLocaleString()};
    const updated=[entry,...load(DB_DDX)];
    save(DB_DDX,updated);setDdxLib(updated);
    setDdxSaved('✅ Saved!');setTimeout(()=>setDdxSaved(''),2500);
  };

  const handleGenDrug=async()=>{
    if(!drugName.trim())return;
    setDrugLoading(true);setDrugResult(null);
    await new Promise(r=>setTimeout(r,1600));
    setDrugResult(genDrug(drugName.trim()));
    setDrugLoading(false);
  };

  const handleSaveDrug=()=>{
    if(!drugResult)return;
    const entry={id:Date.now().toString(),name:drugName,data:drugResult,savedAt:new Date().toLocaleString()};
    const updated=[entry,...load(DB_DRUG)];
    save(DB_DRUG,updated);setDrugLib(updated);
    setDrugSaved('✅ Saved!');setTimeout(()=>setDrugSaved(''),2500);
  };

  const PROB_COLOR:Record<string,string>={High:'#EF4444',Medium:'#F59E0B',Low:'#10B981'};
  const DRUG_SECTIONS=[
    {key:'moa',label:'Mechanism of Action',icon:'âš™ï¸',color:'#6C3BFF'},
    {key:'indications',label:'Indications & Dosage',icon:'✅',color:'#10B981'},
    {key:'adverse',label:'Adverse Effects',icon:'âš ï¸',color:'#EF4444'},
    {key:'interactions',label:'Drug Interactions',icon:'ðŸ”—',color:'#F59E0B'},
    {key:'dosing',label:'Dosing Guidelines',icon:'💊',color:'#0EA5E9'},
    {key:'monitoring',label:'Monitoring',icon:'ðŸ“Š',color:'#8B5CF6'},
  ];

  return(
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title font-outfit">🧩 Clinical Reasoning Tools</h1>
        <p className="page-desc">AI-powered Differential Diagnosis Builder & Drug Learning Assistant</p>
      </div>

      {/* Tool Selector */}
      <div style={{display:'flex',gap:12,marginBottom:28,maxWidth:700}}>
        {[{key:'ddx',icon:'ðŸ”',label:'Differential Diagnosis Builder',desc:'Generate ranked DDx with reasoning'},{key:'drug',icon:'💊',label:'Drug Learning Assistant',desc:'Full drug profile in seconds'}].map(t=>(
          <button key={t.key} onClick={()=>setTool(t.key as 'ddx'|'drug')}
            style={{flex:1,padding:'18px 20px',borderRadius:'var(--radius-lg)',border:`2px solid ${tool===t.key?'var(--primary)':'var(--border)'}`,background:tool===t.key?'linear-gradient(135deg,rgba(108,59,255,0.12),rgba(139,92,246,0.06))':'var(--bg-card)',cursor:'pointer',textAlign:'left',transition:'all 0.2s',boxShadow:tool===t.key?'0 4px 20px rgba(108,59,255,0.15)':'none'}}>
            <div style={{fontSize:24,marginBottom:6}}>{t.icon}</div>
            <div style={{fontWeight:800,fontSize:14,fontFamily:'Outfit',color:tool===t.key?'var(--primary-light)':'var(--text-primary)',marginBottom:2}}>{t.label}</div>
            <div style={{fontSize:12,color:'var(--text-muted)'}}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* DDx Tool */}
      {tool==='ddx'&&(
        <div style={{maxWidth:900}} className="animate-fadeIn">
          <div className="card" style={{marginBottom:20,background:'linear-gradient(135deg,rgba(108,59,255,0.04),rgba(14,165,233,0.02))'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
              <div style={{width:38,height:38,borderRadius:'var(--radius-md)',background:'linear-gradient(135deg,#6C3BFF,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>ðŸ”</div>
              <div><div style={{fontWeight:700,fontSize:15}}>Differential Diagnosis Builder</div><div style={{fontSize:12,color:'var(--text-muted)'}}>Select a clinical case to generate AI-ranked differentials with reasoning</div></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14}}>
              <div className="form-group" style={{margin:0}}>
                <label className="label">Course</label>
                <select className="input-field" value={course} onChange={e=>{setCourse(e.target.value);setSubject('');setClinCase('');setDdxResult(null);}}>
                  {Object.keys(COURSE_DATA).map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{margin:0}}>
                <label className="label">Subject</label>
                <select className="input-field" value={subject} onChange={e=>{setSubject(e.target.value);setClinCase('');setDdxResult(null);}}>
                  <option value="">— Select —</option>
                  {subjects.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{margin:0}}>
                <label className="label">Clinical Case</label>
                <select className="input-field" value={clinCase} onChange={e=>{setClinCase(e.target.value);setCustomCase('');setDdxResult(null);}} disabled={!subject}>
                  <option value="">— Select Case —</option>
                  {cases.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{marginBottom:16}}>
              <label className="label">Or Add Custom Case / Presentation</label>
              <input className="input-field" value={customCase} onChange={e=>{setCustomCase(e.target.value);setClinCase('');setDdxResult(null);}} placeholder="e.g., 35-year-old with progressive dyspnoea and bilateral leg swellingâ€¦"/>
            </div>
            {activeCase&&<div style={{marginBottom:14,padding:'8px 14px',background:'rgba(108,59,255,0.07)',border:'1px solid rgba(108,59,255,0.18)',borderRadius:'var(--radius-sm)',fontSize:13,color:'var(--primary-light)'}}>ðŸ¥ Generating DDx for: <strong>{activeCase}</strong></div>}
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:14,fontSize:15}} onClick={handleGenDDx} disabled={genDDxLoading||!activeCase}>
                {genDDxLoading?<><span className="spinner" style={{marginRight:8}}/>Generating AI Differentialsâ€¦</>:'🤖 Generate Differential Diagnosis'}
              </button>
              <button className="btn btn-secondary" onClick={()=>setShowDdxLib(v=>!v)}>📚 Library ({ddxLib.length})</button>
            </div>
          </div>

          {/* DDx Results */}
          {ddxResult&&(
            <div className="animate-fadeIn">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
                <div><div style={{fontWeight:800,fontSize:16,fontFamily:'Outfit'}}>📋 DDx for: {activeCase}</div><div style={{fontSize:12,color:'var(--text-muted)'}}>{course} • {subject||'Custom'} • {ddxResult.length} differentials</div></div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  {ddxSaved&&<span style={{fontSize:13,color:'var(--success)',fontWeight:600}}>{ddxSaved}</span>}
                  <button className="btn btn-primary" onClick={handleSaveDDx}>💾 Save to Database</button>
                </div>
              </div>
              {ddxResult.map((d,i)=>{
                const col=PROB_COLOR[d.probability]||'#6C3BFF';
                return(
                  <div key={i} style={{marginBottom:12,borderRadius:'var(--radius-lg)',border:`1px solid ${col}25`,overflow:'hidden',boxShadow:`0 2px 12px ${col}10`}}>
                    <div style={{background:`linear-gradient(135deg,${col}15,${col}06)`,padding:'12px 18px',borderBottom:`2px solid ${col}25`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:`${col}22`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14,color:col}}>{d.rank}</div>
                        <div style={{fontWeight:700,fontSize:14,color:'var(--text-primary)'}}>{d.diagnosis}</div>
                      </div>
                      <span style={{background:`${col}18`,color:col,border:`1px solid ${col}35`,borderRadius:999,padding:'3px 12px',fontSize:12,fontWeight:700}}>{d.probability} Probability</span>
                    </div>
                    <div style={{padding:'14px 18px',background:'var(--bg-card)'}}>
                      <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.8,marginBottom:12}}>{d.reasoning}</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        <div style={{background:'rgba(14,165,233,0.07)',border:'1px solid rgba(14,165,233,0.2)',borderRadius:'var(--radius-sm)',padding:'6px 12px',fontSize:12}}><span style={{color:'#0EA5E9',fontWeight:700}}>🔬 Investigations: </span><span style={{color:'var(--text-secondary)'}}>{d.investigations}</span></div>
                        <div style={{background:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'var(--radius-sm)',padding:'6px 12px',fontSize:12}}><span style={{color:'var(--success)',fontWeight:700}}>💊 Management: </span><span style={{color:'var(--text-secondary)'}}>{d.management}</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button className="btn btn-primary" style={{marginTop:8}} onClick={handleSaveDDx}>💾 Save All to Database</button>
            </div>
          )}

          {/* DDx Library */}
          {showDdxLib&&(
            <div style={{marginTop:24}} className="animate-fadeIn">
              <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>📚 Saved DDx Library ({ddxLib.length})</div>
              {ddxLib.length===0?<div className="card" style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>No saved DDx yet. Generate and save one above.</div>:(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
                  {ddxLib.map((e,i)=>{
                    const cols=['#6C3BFF','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899'];
                    const col=cols[i%cols.length];
                    return(
                      <div key={e.id} style={{background:'var(--bg-card)',borderRadius:'var(--radius-lg)',border:`1px solid ${col}25`,overflow:'hidden',boxShadow:`0 2px 8px ${col}10`}}>
                        <div style={{background:`linear-gradient(135deg,${col}18,${col}06)`,padding:'12px 16px',borderBottom:`2px solid ${col}25`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div style={{fontWeight:800,fontSize:13,color:col}}>ðŸ” {e.case}</div>
                          <button onClick={()=>{const u=ddxLib.filter(x=>x.id!==e.id);save(DB_DDX,u);setDdxLib(u);}} style={{background:'rgba(239,68,68,0.1)',border:'none',color:'var(--danger)',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11}}>âœ•</button>
                        </div>
                        <div style={{padding:'10px 16px'}}>
                          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:6}}>{e.course} • {e.subject}</div>
                          <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:8}}>{e.items.length} differentials generated</div>
                          <div style={{fontSize:11,color:'var(--text-muted)'}}>ðŸ• {e.savedAt}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Drug Tool */}
      {tool==='drug'&&(
        <div style={{maxWidth:900}} className="animate-fadeIn">
          <div className="card" style={{marginBottom:20,background:'linear-gradient(135deg,rgba(16,185,129,0.04),rgba(14,165,233,0.02))'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
              <div style={{width:38,height:38,borderRadius:'var(--radius-md)',background:'linear-gradient(135deg,#10B981,#0EA5E9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>💊</div>
              <div><div style={{fontWeight:700,fontSize:15}}>Drug Learning Assistant</div><div style={{fontSize:12,color:'var(--text-muted)'}}>Type any drug name to generate full pharmacology profile</div></div>
            </div>
            <div className="form-group" style={{marginBottom:16}}>
              <label className="label">Drug Name</label>
              <input className="input-field" style={{fontSize:16}} value={drugName} onChange={e=>{setDrugName(e.target.value);setDrugResult(null);}} placeholder="e.g., Metformin, Amlodipine, Amoxicillin, Atorvastatinâ€¦" onKeyDown={e=>e.key==='Enter'&&handleGenDrug()}/>
              <div style={{marginTop:10,display:'flex',flexWrap:'wrap',gap:6}}>
                {['Metformin','Amlodipine','Atorvastatin','Amoxicillin','Omeprazole','Atenolol','Furosemide','Warfarin','Morphine','Paracetamol'].map(d=>(
                  <button key={d} onClick={()=>{setDrugName(d);setDrugResult(null);}} style={{padding:'4px 12px',borderRadius:999,border:'1px solid var(--border)',background:'var(--bg-surface)',fontSize:12,cursor:'pointer',color:'var(--text-secondary)',transition:'all 0.15s'}}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--primary)',e.currentTarget.style.color='var(--primary-light)')}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)',e.currentTarget.style.color='var(--text-secondary)')}>{d}</button>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:14,fontSize:15}} onClick={handleGenDrug} disabled={drugLoading||!drugName.trim()}>
                {drugLoading?<><span className="spinner" style={{marginRight:8}}/>Generating Drug Profileâ€¦</>:'🤖 Generate Drug Details'}
              </button>
              <button className="btn btn-secondary" onClick={()=>setShowDrugLib(v=>!v)}>📚 Library ({drugLib.length})</button>
            </div>
          </div>

          {drugResult&&(
            <div className="animate-fadeIn">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
                <div>
                  <div style={{fontWeight:800,fontSize:18,fontFamily:'Outfit'}}>💊 {drugName}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>Complete Pharmacology Profile • AI Generated</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  {drugSaved&&<span style={{fontSize:13,color:'var(--success)',fontWeight:600}}>{drugSaved}</span>}
                  <button className="btn btn-primary" onClick={handleSaveDrug}>💾 Save to Database</button>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                {DRUG_SECTIONS.map(sec=>(
                  <div key={sec.key} style={{borderRadius:'var(--radius-lg)',border:`1px solid ${sec.color}25`,overflow:'hidden',boxShadow:`0 2px 12px ${sec.color}08`}}>
                    <div style={{background:`linear-gradient(135deg,${sec.color}15,${sec.color}06)`,padding:'12px 16px',borderBottom:`2px solid ${sec.color}25`,display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:18}}>{sec.icon}</span>
                      <span style={{fontWeight:700,fontSize:13,color:sec.color}}>{sec.label}</span>
                    </div>
                    <div style={{padding:'14px 16px',background:'var(--bg-card)',fontSize:13,color:'var(--text-secondary)',lineHeight:1.85}}>{drugResult[sec.key as keyof typeof drugResult]}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{marginTop:16}} onClick={handleSaveDrug}>💾 Save to Database</button>
            </div>
          )}

          {showDrugLib&&(
            <div style={{marginTop:24}} className="animate-fadeIn">
              <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>📚 Saved Drug Library ({drugLib.length})</div>
              {drugLib.length===0?<div className="card" style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>No saved drugs yet.</div>:(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12}}>
                  {drugLib.map((e,i)=>{
                    const cols=['#10B981','#0EA5E9','#6C3BFF','#F59E0B','#EF4444','#EC4899'];
                    const col=cols[i%cols.length];
                    return(
                      <div key={e.id} style={{background:'var(--bg-card)',borderRadius:'var(--radius-lg)',border:`1px solid ${col}25`,overflow:'hidden'}}>
                        <div style={{background:`linear-gradient(135deg,${col}18,${col}06)`,padding:'12px 16px',borderBottom:`2px solid ${col}25`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div style={{fontWeight:800,fontSize:13,color:col}}>💊 {e.name}</div>
                          <button onClick={()=>{const u=drugLib.filter(x=>x.id!==e.id);save(DB_DRUG,u);setDrugLib(u);}} style={{background:'rgba(239,68,68,0.1)',border:'none',color:'var(--danger)',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11}}>âœ•</button>
                        </div>
                        <div style={{padding:'10px 16px'}}>
                          <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:6}}>6-section pharmacology profile</div>
                          <div style={{fontSize:11,color:'var(--text-muted)'}}>ðŸ• {e.savedAt}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

