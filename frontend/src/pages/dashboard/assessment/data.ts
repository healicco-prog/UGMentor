export const COURSE_DATA: Record<string, string[]> = {
  MBBS: ['Anatomy','Physiology','Biochemistry','Pathology','Microbiology','Pharmacology',
    'Forensic Medicine & Toxicology','Community Medicine','Ophthalmology','ENT',
    'General Medicine','Pediatrics','Dermatology','Psychiatry','General Surgery',
    'Orthopedics','Obstetrics & Gynaecology','Anaesthesiology','Radiology','Emergency Medicine'],
  BDS: ['General Human Anatomy & Histology','General Physiology','Biochemistry, Nutrition & Dietetics',
    'Dental Anatomy & Oral Histology','General Pathology','Microbiology',
    'Dental Pharmacology & Therapeutics','Dental Materials','Oral Pathology & Oral Microbiology',
    'Oral Medicine and Radiology','Oral & Maxillofacial Surgery','Periodontology',
    'Pediatric & Preventive Dentistry','Conservative Dentistry & Endodontics',
    'Prosthodontics','Orthodontics & Dentofacial Orthopaedics'],
  'BSc Nursing': ['Applied Anatomy','Applied Physiology','Applied Biochemistry',
    'Applied Microbiology & Infection Control','Applied Nutrition & Dietetics',
    'Applied Psychology','Applied Sociology','Genetics',
    'Nursing Foundations I','Nursing Foundations II',
    'Adult Health Nursing I','Adult Health Nursing II',
    'Child Health Nursing','Community Health Nursing',
    'Mental Health Nursing','Midwifery / OBG Nursing',
    'Pathology','Pharmacology','Nursing Research & Statistics'],
  'Allied Health Sciences': ['Physiology','Biochemistry','Anatomy','Pathology',
    'Pharmacology','Microbiology','Community Health','Medical Ethics'],
  Other: [],
};

export const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  Anatomy: ['Brachial Plexus','Femoral Triangle','Inguinal Canal','Blood Supply of Heart','Joints of Upper Limb'],
  Physiology: ['Cardiac Cycle','Renal Physiology','Respiratory Mechanics','Neurotransmitters','Haemostasis'],
  Biochemistry: ['Krebs Cycle','Glycolysis','DNA Replication','Protein Synthesis','Enzyme Kinetics'],
  Pharmacology: ['Beta Blockers','ACE Inhibitors','NSAIDs','Antibiotics','Antiemetics','Anticoagulants'],
  Pathology: ['Inflammation','Neoplasia','Cell Injury','Haemodynamics','Immunopathology'],
  Microbiology: ['Bacteria Classification','Viral Replication','Immunology','Antifungals','Sterilisation'],
  'General Medicine': ['Diabetes Mellitus','Hypertension','Cardiac Failure','Hepatitis','Tuberculosis'],
  'General Surgery': ['Hernia','Appendicitis','Wound Healing','Shock','Burns'],
  Microbiology2: [],
};

export const EXAMINER_PERSONAS = [
  { id: 'friendly', label: '😊 Friendly Examiner', desc: 'Encouraging, supportive tone' },
  { id: 'university', label: '🎓 University Examiner', desc: 'Standard exam style' },
  { id: 'strict', label: '📋 Strict Examiner', desc: 'Expects precise answers' },
  { id: 'clinical', label: '🩺 Clinical Examiner', desc: 'Patient-case oriented' },
];

export const VIVA_MODES = [
  { id: 'standard', label: 'Standard Viva', icon: '🎙️' },
  { id: 'rapid', label: 'Rapid Fire', icon: '⚡' },
  { id: 'case', label: 'Case-Based', icon: '📋' },
  { id: 'competency', label: 'Competency-Based', icon: '🏆' },
];

export interface VivaQuestion {
  question: string;
  modelAnswer: string;
  marks: number;
  bloomLevel: string;
  competency: string;
  probingQuestion: string;
}

export interface QuestionResult {
  question: VivaQuestion;
  userAnswer: string;
  marksAwarded: number;
  aiStrength: string;
  aiImprovement: string;
}

export function generateQuestions(topic: string, subject: string, count: number, totalMarks: number): VivaQuestion[] {
  const marksEach = Math.max(1, Math.floor(totalMarks / count));
  const blooms = ['Remember','Understand','Apply','Analyze','Evaluate','Create'];
  const templates = [
    { q: `Define ${topic} and state its classification.`, a: `${topic} is defined as a condition/concept characterised by [key features]. Classification: Type I [criteria], Type II [criteria], Type III [criteria].`, bloom: 'Remember', probing: `Can you elaborate on the pathophysiological basis of each type?` },
    { q: `Explain the pathophysiology of ${topic}.`, a: `Pathophysiology: 1) Trigger/cause → 2) Cascade of events → 3) End-organ effects → 4) Clinical manifestations.`, bloom: 'Understand', probing: `How does this mechanism lead to the clinical features?` },
    { q: `What are the clinical features of ${topic}?`, a: `Symptoms: [key symptoms]. Signs: [key signs]. Severity grading: mild/moderate/severe.`, bloom: 'Remember', probing: `Which sign is pathognomonic for this condition?` },
    { q: `How would you investigate a patient with suspected ${topic}?`, a: `First-line: Blood tests (CBC, metabolic panel), Urine analysis. Second-line: Imaging (X-ray, USG, CT/MRI). Special: Biopsy, culture, scoring systems.`, bloom: 'Apply', probing: `What is the gold standard investigation and why?` },
    { q: `Outline the management of ${topic}.`, a: `Conservative: rest, diet modification. Medical: First-line drug + dose, Second-line. Surgical: Indications, procedure, complications. Follow-up plan.`, bloom: 'Apply', probing: `What are the indications for surgical intervention?` },
    { q: `What are the complications of ${topic}?`, a: `Early: [list]. Late: [list]. Life-threatening: [list]. Prevention strategies: [list].`, bloom: 'Analyze', probing: `Which complication has the worst prognosis and why?` },
    { q: `Discuss the recent advances in the management of ${topic}.`, a: `Novel therapies: [examples]. New diagnostic tools: [examples]. Ongoing trials: [examples]. Future directions: [examples].`, bloom: 'Evaluate', probing: `How do these advances change the current standard of care?` },
    { q: `A 45-year-old presents with features of ${topic}. How would you approach this case?`, a: `History: chief complaint, duration, risk factors. Examination: vitals, targeted exam. Investigations: tiered approach. Management: immediate + definitive.`, bloom: 'Apply', probing: `What red flag symptoms would change your management?` },
    { q: `Compare and contrast ${topic} with its closest differential diagnosis.`, a: `Feature | ${topic} | Differential. Key distinguishing features: clinical, laboratory, imaging, treatment differences.`, bloom: 'Analyze', probing: `What single investigation would best differentiate these two?` },
    { q: `What is the prognosis of ${topic} and what factors affect it?`, a: `Prognosis: depends on [stage/grade/type]. Good prognostic factors: [list]. Poor factors: [list]. Scoring systems: [list].`, bloom: 'Evaluate', probing: `How would you counsel this patient about their prognosis?` },
  ];
  return Array.from({ length: count }, (_, i) => {
    const t = templates[i % templates.length];
    return {
      question: t.q, modelAnswer: t.a, marks: marksEach,
      bloomLevel: blooms[i % blooms.length],
      competency: `${subject} — ${topic} (Q${i + 1})`,
      probingQuestion: t.probing,
    };
  });
}
