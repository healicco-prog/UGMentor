// React component

import React, { useState } from 'react';

// Define the Record types
interface LogEntry {
  id: string;
  type: 'clinical-logbook' | 'case-presentations' | 'seminars' | 'journal-club' | 'teaching' | 'assessments' | 'reflections' | 'documents';
  date: string;
  subject: string;
  status: 'Pending' | 'Approved';
  supervisor: string;
  
  // Clinical Logbook
  posting?: string;
  procedureName?: string;
  role?: string;
  times?: number;
  remarks?: string;
  learningPoints?: string;

  // Case Presentations
  department?: string;
  caseTitle?: string;
  diagnosis?: string;
  caseType?: string;
  caseSummary?: string;

  // Seminars
  seminarTitle?: string;
  topic?: string;
  keyLearningPoints?: string;
  references?: string;

  // Journal Club
  journalName?: string;
  articleTitle?: string;
  studyDesign?: string;
  keyFindings?: string;
  criticalAppraisal?: string;

  // Teaching Activities
  audience?: string;
  duration?: string;
  feedback?: string;

  // Assessments
  assessmentType?: string;
  marks?: string;
  feedbackRemarks?: string;

  // Reflections
  title?: string;
  context?: string;
  whatHappened?: string;
  learningGained?: string;
  futurePlan?: string;

  // Documents
  documentTitle?: string;
  category?: string;
}

const INITIAL_RECORDS: LogEntry[] = [
  {
    id: '1',
    type: 'clinical-logbook',
    date: '2026-06-15',
    subject: 'Medicine',
    posting: 'General Medicine Ward',
    procedureName: 'Venipuncture & IV Cannulation',
    role: 'Performed Independently',
    times: 3,
    remarks: 'Successfully inserted IV line on first attempt.',
    learningPoints: 'Patience and feeling the vein is better than rushing.',
    status: 'Approved',
    supervisor: 'Dr. Ramesh Kumar'
  },
  {
    id: '2',
    type: 'case-presentations',
    date: '2026-06-18',
    subject: 'Medicine',
    department: 'Cardiology',
    caseTitle: 'Acute Myocardial Infarction',
    diagnosis: 'STEMI anterior wall',
    caseType: 'Typical Case',
    caseSummary: 'A 55-year-old male presented with substernal chest pain radiating to left arm...',
    learningPoints: 'Learned the importance of ECG interpretation within 10 minutes.',
    status: 'Approved',
    supervisor: 'Dr. Narayana K'
  },
  {
    id: '3',
    type: 'seminars',
    date: '2026-06-10',
    subject: 'Pharmacology',
    department: 'Pharmacology',
    seminarTitle: 'Updates in antimicrobial therapy',
    topic: 'Antimicrobial Resistance',
    keyLearningPoints: 'Understood mechanisms of resistance and stewardship.',
    references: 'Katzung Pharmacology 15th Ed',
    status: 'Approved',
    supervisor: 'Dr. Anita Desai'
  },
  {
    id: '4',
    type: 'journal-club',
    date: '2026-06-12',
    subject: 'Community Medicine',
    journalName: 'Lancet Global Health',
    articleTitle: 'Efficacy of malaria vaccine in children',
    studyDesign: 'RCT',
    keyFindings: 'Significant reduction in severe cases.',
    criticalAppraisal: 'High follow-up rate, low attrition bias.',
    status: 'Pending',
    supervisor: 'Dr. Suresh Babu'
  },
  {
    id: '5',
    type: 'teaching',
    date: '2026-06-14',
    subject: 'Anatomy',
    topic: 'Brachial Plexus branches',
    audience: '1st Year MBBS Students',
    duration: '45 mins',
    role: 'Peer Tutor',
    feedback: 'Students appreciated the hand-drawn diagrams.',
    status: 'Approved',
    supervisor: 'Dr. Rajesh Patel'
  },
  {
    id: '6',
    type: 'assessments',
    date: '2026-06-16',
    subject: 'Surgery',
    assessmentType: 'Essay Question Grader',
    marks: '85/100',
    feedbackRemarks: 'Excellent description of appendicitis pathophysiology, could improve on management details.',
    status: 'Approved',
    supervisor: 'AI Grader (UGMentor)'
  },
  {
    id: '7',
    type: 'reflections',
    date: '2026-06-17',
    subject: 'Pediatrics',
    title: 'Communicating with parents of a sick child',
    context: 'Pediatric Emergency Room',
    whatHappened: 'Encountered an anxious parent of a child with febrile seizures...',
    learningGained: 'Learned to empathize first and explain the pathology simply.',
    futurePlan: 'Will practice active listening under stressful situations.',
    status: 'Approved',
    supervisor: 'Dr. Preeti Sharma'
  }
];

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

export default function PortfolioPage() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<string>('MBBS');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [records, setRecords] = useState<LogEntry[]>(INITIAL_RECORDS);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [formDate, setFormDate] = useState('');
  const [formCourse, setFormCourse] = useState('MBBS');
  const [formSubject, setFormSubject] = useState('');
  const [formPosting, setFormPosting] = useState('');
  const [formProcedureName, setFormProcedureName] = useState('');
  const [formRole, setFormRole] = useState('Observed');
  const [formTimes, setFormTimes] = useState(1);
  const [formRemarks, setFormRemarks] = useState('');
  const [formLearningPoints, setFormLearningPoints] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formCaseTitle, setFormCaseTitle] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formCaseType, setFormCaseType] = useState('Standard/Typical Case');
  const [formCaseSummary, setFormCaseSummary] = useState('');
  const [formSeminarTitle, setFormSeminarTitle] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formReferences, setFormReferences] = useState('');
  const [formJournalName, setFormJournalName] = useState('');
  const [formArticleTitle, setFormArticleTitle] = useState('');
  const [formStudyDesign, setFormStudyDesign] = useState('RCT');
  const [formKeyFindings, setFormKeyFindings] = useState('');
  const [formCriticalAppraisal, setFormCriticalAppraisal] = useState('');
  const [formAudience, setFormAudience] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formFeedback, setFormFeedback] = useState('');
  const [formAssessmentType, setFormAssessmentType] = useState('IA');
  const [formMarks, setFormMarks] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formContext, setFormContext] = useState('');
  const [formWhatHappened, setFormWhatHappened] = useState('');
  const [formFuturePlan, setFormFuturePlan] = useState('');
  const [formDocTitle, setFormDocTitle] = useState('');
  const [formDocCategory, setFormDocCategory] = useState('Case Report');
  const [formSupervisor, setFormSupervisor] = useState('');

  const filteredRecords = records.filter(r => {
    const matchesTab = currentTab === 'dashboard' || r.type === currentTab;
    const matchesSubject = selectedSubject === 'all' || r.subject === selectedSubject;
    const searchString = `${r.procedureName || ''} ${r.caseTitle || ''} ${r.seminarTitle || ''} ${r.topic || ''} ${r.articleTitle || ''} ${r.title || ''} ${r.subject || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesTab && matchesSubject && matchesSearch;
  });

  const getCount = (type: LogEntry['type']) => records.filter(r => r.type === type && (selectedSubject === 'all' || r.subject === selectedSubject)).length;

  const getOverallProgress = () => {
    const totalPossible = 20; 
    const approvedCount = records.filter(r => r.status === 'Approved').length;
    return Math.min(Math.round((approvedCount / totalPossible) * 100), 100);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: LogEntry = {
      id: Date.now().toString(),
      type: currentTab as LogEntry['type'],
      date: formDate || new Date().toISOString().split('T')[0],
      subject: formSubject,
      status: 'Pending',
      supervisor: formSupervisor || 'Dr. Narayana K',
      posting: formPosting,
      procedureName: formProcedureName,
      role: formRole,
      times: formTimes,
      remarks: formRemarks,
      learningPoints: formLearningPoints,
      department: formDepartment,
      caseTitle: formCaseTitle,
      diagnosis: formDiagnosis,
      caseType: formCaseType,
      caseSummary: formCaseSummary,
      seminarTitle: formSeminarTitle,
      topic: formTopic,
      keyLearningPoints: formLearningPoints,
      references: formReferences,
      journalName: formJournalName,
      articleTitle: formArticleTitle,
      studyDesign: formStudyDesign,
      keyFindings: formKeyFindings,
      criticalAppraisal: formCriticalAppraisal,
      audience: formAudience,
      duration: formDuration,
      feedback: formFeedback,
      assessmentType: formAssessmentType,
      marks: formMarks,
      feedbackRemarks: formRemarks,
      title: formTitle,
      context: formContext,
      whatHappened: formWhatHappened,
      learningGained: formLearningPoints,
      futurePlan: formFuturePlan,
      documentTitle: formDocTitle,
      category: formDocCategory,
    };

    setRecords([newRecord, ...records]);
    setIsModalOpen(false);

    setFormPosting(''); setFormProcedureName(''); setFormRemarks(''); setFormLearningPoints(''); setFormDepartment(''); setFormCaseTitle(''); setFormDiagnosis(''); setFormCaseSummary(''); setFormSeminarTitle(''); setFormTopic(''); setFormReferences(''); setFormJournalName(''); setFormArticleTitle(''); setFormKeyFindings(''); setFormCriticalAppraisal(''); setFormAudience(''); setFormDuration(''); setFormFeedback(''); setFormMarks(''); setFormTitle(''); setFormContext(''); setFormWhatHappened(''); setFormFuturePlan(''); setFormDocTitle(''); setFormSupervisor('');
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard': return '📊 Dashboard';
      case 'student-profile': return 'ðŸ‘¤ Student Profile';
      case 'clinical-logbook': return 'ðŸ¥ Clinical Logbook';
      case 'case-presentations': return 'ðŸ“‚ Case Presentations';
      case 'seminars': return '🎤 Seminars';
      case 'journal-club': return '📖 Journal Club';
      case 'teaching': return 'ðŸ‘¨â€ðŸ« Teaching Activities';
      case 'assessments': return 'ðŸ“ Assessments';
      case 'reflections': return '💭­ Reflections';
      case 'documents': return 'ðŸ“Ž Documents';
      default: return 'Portfolio';
    }
  };

  const exportPDF = () => alert('Exporting e-Portfolio logbook as PDF...');
  const generateCV = () => alert('Generating Academic CV based on portfolio log...');

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%' }}>
      {/* Header section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 className="page-title font-outfit">ðŸ—‚ï¸ Academic Portfolio & Logbook</h1>
          <p className="page-desc">Track your multi-subject CBME competencies, assessments, and clinical activities.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select 
            value={currentTab} 
            onChange={e => setCurrentTab(e.target.value)}
            className="input-field" 
            style={{ width: 'auto', padding: '10px 16px', minWidth: 200, cursor: 'pointer' }}
          >
            {['dashboard', 'student-profile', 'clinical-logbook', 'case-presentations', 'seminars', 'journal-club', 'teaching', 'assessments', 'reflections', 'documents'].map(tab => (
               <option key={tab} value={tab}>{getTabLabel(tab)}</option>
            ))}
          </select>
          
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedSubject('all');
            }}
            className="input-field"
            style={{ width: 'auto', padding: '10px 16px', minWidth: 160, cursor: 'pointer' }}
          >
            {COURSES.map((course) => (
               <option key={course} value={course}>{course}</option>
            ))}
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '10px 16px', minWidth: 160, cursor: 'pointer' }}
          >
            <option value="all">📚 All Subjects</option>
            {(COURSE_DATA[selectedCourse] || []).map((sub) => (
               <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {currentTab === 'dashboard' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Welcome and progress banner */}
          <div className="card glass" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Welcome back, Student</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Premium Tier Student • Academic Year 2026-27</p>
            </div>
            <div style={{ flex: 1, minWidth: 250, maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Overall Portfolio Progress</span>
                <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{getOverallProgress()}% Complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${getOverallProgress()}%` }}></div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid-4">
            {[
              { id: 'clinical-logbook', label: 'Clinical Procedures', count: getCount('clinical-logbook'), emoji: 'ðŸ¥' },
              { id: 'case-presentations', label: 'Case Presentations', count: getCount('case-presentations'), emoji: 'ðŸ“‚' },
              { id: 'seminars', label: 'Seminars', count: getCount('seminars'), emoji: '🎤' },
              { id: 'journal-club', label: 'Journal Clubs', count: getCount('journal-club'), emoji: '📖' },
              { id: 'teaching', label: 'Teaching Activities', count: getCount('teaching'), emoji: 'ðŸ‘¨â€ðŸ«' },
              { id: 'assessments', label: 'Assessments', count: getCount('assessments'), emoji: 'ðŸ“' },
              { id: 'reflections', label: 'Reflections', count: getCount('reflections'), emoji: '💭­' },
              { id: 'documents', label: 'Documents Logged', count: getCount('documents'), emoji: 'ðŸ“Ž' },
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setCurrentTab(metric.id)}
                className="stat-card"
                style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 120, justifyContent: 'space-between', color: 'inherit' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <span style={{ fontSize: 28 }}>{metric.emoji}</span>
                  <span style={{ fontSize: 12, color: 'var(--primary-light)' }}>View →</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{metric.count}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{metric.label}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Actions Panel */}
          <div style={{ marginTop: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
            <div className="grid-4">
              <button onClick={() => setCurrentTab('student-profile')} className="card" style={{ cursor: 'pointer', textAlign: 'left', color: 'inherit' }}>
                <span style={{ fontSize: 24 }}>ðŸ‘¤</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginTop: 12, color: 'var(--text-primary)' }}>Update Profile</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Update your academic and personal details.</p>
              </button>

              <button onClick={() => { setCurrentTab('clinical-logbook'); setIsModalOpen(true); }} className="card" style={{ cursor: 'pointer', textAlign: 'left', color: 'inherit' }}>
                <span style={{ fontSize: 24 }}>ðŸ¥</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginTop: 12, color: 'var(--text-primary)' }}>Log Procedure</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Quickly log a new clinical procedure or ward duty entry.</p>
              </button>

              <button onClick={() => { setCurrentTab('case-presentations'); setIsModalOpen(true); }} className="card" style={{ cursor: 'pointer', textAlign: 'left', color: 'inherit' }}>
                <span style={{ fontSize: 24 }}>ðŸ“‚</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginTop: 12, color: 'var(--text-primary)' }}>Add Case Presentation</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Log a case presented in ward rounds or CPC.</p>
              </button>

              <button onClick={exportPDF} className="card" style={{ cursor: 'pointer', textAlign: 'left', color: 'inherit' }}>
                <span style={{ fontSize: 24 }}>â¬‡ï¸</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginTop: 12, color: 'var(--text-primary)' }}>Export Logbook PDF</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Download your official CBME logbook in PDF format.</p>
              </button>

              <button onClick={generateCV} className="card" style={{ cursor: 'pointer', textAlign: 'left', color: 'inherit' }}>
                <span style={{ fontSize: 24 }}>🎓</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginTop: 12, color: 'var(--text-primary)' }}>Generate Academic CV</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Auto-compile your achievements into a professional CV.</p>
              </button>
            </div>
          </div>
        </div>
      ) : currentTab === 'student-profile' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card glass">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Update Student Profile</h2>
            <form onSubmit={e => { e.preventDefault(); alert('Profile updated successfully!'); }}>
              <div className="grid-2">
                <div className="form-group"><label className="label">Full Name</label><input type="text" className="input-field" defaultValue="Kavitha Rao" /></div>
                <div className="form-group"><label className="label">Email Address</label><input type="email" className="input-field" defaultValue="premium@ugmentor.in" readOnly /></div>
              </div>
              <div className="grid-3" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="label">Course</label>
                  <select className="input-field" defaultValue="MBBS">
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="label">Registration / Roll No.</label><input type="text" className="input-field" defaultValue="REG-2023-0045" /></div>
                <div className="form-group"><label className="label">Admission Year</label><input type="number" className="input-field" defaultValue="2023" /></div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group"><label className="label">College / Institution</label><input type="text" className="input-field" defaultValue="Narayana Medical College" /></div>
                <div className="form-group"><label className="label">Photo (Passport)</label><input type="file" accept="image/*" className="input-field" style={{ padding: '8px' }} /></div>
              </div>
              <div className="form-group"><label className="label">Short Bio / Interests</label><textarea className="input-field" rows={3} placeholder="Tell us about your medical interests..."></textarea></div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>💾 Save Profile</button>
            </form>
          </div>
          <button onClick={() => setCurrentTab('dashboard')} className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>â† Back to Portfolio Dashboard</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Active section header */}
          <div className="card glass" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 24px' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
                {getTabLabel(currentTab)}
                <span className="badge badge-primary">{filteredRecords.length} record(s)</span>
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Showing logs of selected category{selectedSubject !== 'all' ? ` for ${selectedSubject}` : ''}.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ðŸ” Search entries..."
                className="input-field"
                style={{ width: 220, padding: '8px 16px' }}
              />
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                + Add New Entry
              </button>
            </div>
          </div>

          {/* Records Table / View */}
          {filteredRecords.length === 0 ? (
            <div className="empty-state card glass">
              <div className="empty-state-icon">ðŸ“­</div>
              <h3 className="empty-state-title">No records found</h3>
              <p className="empty-state-desc">
                {searchQuery ? 'Try clearing your search query.' : `No ${getTabLabel(currentTab).substring(3).toLowerCase()} entries logged yet.`}
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead style={{ background: 'var(--bg-elevated)' }}>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      {currentTab === 'clinical-logbook' && (<><th>Procedure</th><th>Role</th><th>Times</th></>)}
                      {currentTab === 'case-presentations' && (<><th>Case Title</th><th>Type</th><th>Diagnosis</th></>)}
                      {currentTab === 'seminars' && (<><th>Seminar Title</th><th>Topic</th></>)}
                      {currentTab === 'journal-club' && (<><th>Article Title</th><th>Journal</th><th>Design</th></>)}
                      {currentTab === 'teaching' && (<><th>Topic</th><th>Audience</th><th>Duration</th></>)}
                      {currentTab === 'assessments' && (<><th>Assessment</th><th>Marks/Grade</th></>)}
                      {currentTab === 'reflections' && (<><th>Reflection Title</th><th>Context</th></>)}
                      {currentTab === 'documents' && (<><th>Document Title</th><th>Category</th></>)}
                      <th>Supervisor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontSize: 12 }}>{r.date}</td>
                        <td><span className="badge badge-secondary">{r.subject}</span></td>
                        
                        {currentTab === 'clinical-logbook' && (
                          <><td style={{ fontWeight: 600 }}>{r.procedureName}</td><td style={{ fontSize: 12 }}>{r.role}</td><td style={{ fontWeight: 700 }}>{r.times}</td></>
                        )}
                        {currentTab === 'case-presentations' && (
                          <><td style={{ fontWeight: 600 }}>{r.caseTitle}</td><td style={{ fontSize: 12 }}>{r.caseType}</td><td style={{ fontSize: 12, fontStyle: 'italic' }}>{r.diagnosis}</td></>
                        )}
                        {currentTab === 'seminars' && (
                          <><td style={{ fontWeight: 600 }}>{r.seminarTitle}</td><td style={{ fontSize: 12 }}>{r.topic}</td></>
                        )}
                        {currentTab === 'journal-club' && (
                          <><td style={{ fontWeight: 600 }}>{r.articleTitle}</td><td style={{ fontSize: 12 }}>{r.journalName}</td><td style={{ fontSize: 12, color: 'var(--warning)' }}>{r.studyDesign}</td></>
                        )}
                        {currentTab === 'teaching' && (
                          <><td style={{ fontWeight: 600 }}>{r.topic}</td><td style={{ fontSize: 12 }}>{r.audience}</td><td style={{ fontSize: 12 }}>{r.duration}</td></>
                        )}
                        {currentTab === 'assessments' && (
                          <><td style={{ fontWeight: 600 }}>{r.assessmentType}</td><td style={{ fontWeight: 700, color: 'var(--success)' }}>{r.marks}</td></>
                        )}
                        {currentTab === 'reflections' && (
                          <><td style={{ fontWeight: 600 }}>{r.title}</td><td style={{ fontSize: 12 }}>{r.context}</td></>
                        )}
                        {currentTab === 'documents' && (
                          <><td style={{ fontWeight: 600 }}>{r.documentTitle}</td><td style={{ fontSize: 12 }}>{r.category}</td></>
                        )}
                        
                        <td style={{ fontSize: 12 }}>{r.supervisor}</td>
                        <td>
                          <span className={`badge ${r.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                            {r.status === 'Approved' ? '✅ Approved' : 'â³ Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button onClick={() => setCurrentTab('dashboard')} className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
            â† Back to Portfolio Dashboard
          </button>
        </div>
      )}

      {/* Add New Entry Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New {getTabLabel(currentTab).substring(3)} Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>âœ•</button>
            </div>

            <form onSubmit={handleAddRecord}>
              <div className="grid-3" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="label">Date *</label>
                  <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} className="input-field" />
                </div>
                <div className="form-group">
                  <label className="label">Course *</label>
                  <select value={formCourse} onChange={(e) => { setFormCourse(e.target.value); setFormSubject(''); }} className="input-field">
                    <option value="">Select Course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Subject *</label>
                  <select value={formSubject} onChange={(e) => setFormSubject(e.target.value)} className="input-field" disabled={!formCourse}>
                    <option value="">{formCourse ? 'Select Subject' : 'Select Course'}</option>
                    {(COURSE_DATA[formCourse] || []).map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              {currentTab === 'clinical-logbook' && (
                <>
                  <div className="form-group">
                    <label className="label">Procedure Name *</label>
                    <input type="text" required placeholder="e.g. Lumbar puncture, IV Line Insertion" value={formProcedureName} onChange={(e) => setFormProcedureName(e.target.value)} className="input-field" />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="label">Posting/Rotation</label>
                      <input type="text" placeholder="e.g. General Surgery" value={formPosting} onChange={(e) => setFormPosting(e.target.value)} className="input-field" />
                    </div>
                    <div className="form-group">
                      <label className="label">Role *</label>
                      <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="input-field">
                        <option>Observed</option><option>Assisted</option><option>Performed under supervision</option><option>Performed Independently</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">No. of Times</label>
                    <input type="number" min={1} value={formTimes} onChange={(e) => setFormTimes(parseInt(e.target.value) || 1)} className="input-field" />
                  </div>
                </>
              )}

              {currentTab === 'case-presentations' && (
                <>
                  <div className="form-group"><label className="label">Case Title *</label><input type="text" required placeholder="e.g. Acute liver failure" value={formCaseTitle} onChange={e => setFormCaseTitle(e.target.value)} className="input-field" /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="label">Department/Posting</label><input type="text" placeholder="e.g. Pediatrics" value={formDepartment} onChange={e => setFormDepartment(e.target.value)} className="input-field" /></div>
                    <div className="form-group"><label className="label">Case Type *</label><select value={formCaseType} onChange={e => setFormCaseType(e.target.value)} className="input-field"><option>Interesting Case</option><option>Rare Case</option><option>Standard/Typical Case</option><option>Complicated Case</option></select></div>
                  </div>
                  <div className="form-group"><label className="label">Diagnosis</label><input type="text" placeholder="e.g. Hypertrophic pyloric stenosis" value={formDiagnosis} onChange={e => setFormDiagnosis(e.target.value)} className="input-field" /></div>
                  <div className="form-group"><label className="label">Case Summary</label><textarea rows={3} placeholder="Enter brief presentation details..." value={formCaseSummary} onChange={e => setFormCaseSummary(e.target.value)} className="input-field"></textarea></div>
                </>
              )}

              {currentTab === 'seminars' && (
                <>
                  <div className="form-group"><label className="label">Seminar Title *</label><input type="text" required placeholder="e.g. Mechanism of action of diuretics" value={formSeminarTitle} onChange={e => setFormSeminarTitle(e.target.value)} className="input-field" /></div>
                  <div className="form-group"><label className="label">Topic / Scope</label><input type="text" placeholder="e.g. Loop diuretics and thiazides" value={formTopic} onChange={e => setFormTopic(e.target.value)} className="input-field" /></div>
                  <div className="form-group"><label className="label">References</label><input type="text" placeholder="e.g. Harrison's Textbook" value={formReferences} onChange={e => setFormReferences(e.target.value)} className="input-field" /></div>
                </>
              )}

              {currentTab === 'journal-club' && (
                <>
                  <div className="form-group"><label className="label">Article Title *</label><input type="text" required placeholder="Article title..." value={formArticleTitle} onChange={e => setFormArticleTitle(e.target.value)} className="input-field" /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="label">Journal Name *</label><input type="text" required placeholder="e.g. NEJM, Lancet" value={formJournalName} onChange={e => setFormJournalName(e.target.value)} className="input-field" /></div>
                    <div className="form-group"><label className="label">Study Design *</label><select value={formStudyDesign} onChange={e => setFormStudyDesign(e.target.value)} className="input-field"><option>RCT</option><option>Meta-analysis</option><option>Cohort Study</option><option>Case-Control</option><option>Cross-sectional</option></select></div>
                  </div>
                  <div className="form-group"><label className="label">Key Findings</label><textarea rows={2} placeholder="Summarize findings..." value={formKeyFindings} onChange={e => setFormKeyFindings(e.target.value)} className="input-field"></textarea></div>
                  <div className="form-group"><label className="label">Critical Appraisal</label><textarea rows={2} placeholder="Write appraisal, limitations, bias..." value={formCriticalAppraisal} onChange={e => setFormCriticalAppraisal(e.target.value)} className="input-field"></textarea></div>
                </>
              )}

              {currentTab === 'teaching' && (
                <>
                  <div className="form-group"><label className="label">Topic *</label><input type="text" required placeholder="e.g. Histology of skeletal muscle" value={formTopic} onChange={e => setFormTopic(e.target.value)} className="input-field" /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="label">Audience / Group *</label><input type="text" required placeholder="e.g. 1st Yr Nursing" value={formAudience} onChange={e => setFormAudience(e.target.value)} className="input-field" /></div>
                    <div className="form-group"><label className="label">Duration *</label><input type="text" required placeholder="e.g. 30 mins" value={formDuration} onChange={e => setFormDuration(e.target.value)} className="input-field" /></div>
                  </div>
                  <div className="form-group"><label className="label">Feedback/Self-Reflection</label><textarea rows={2} placeholder="Enter how teaching went..." value={formFeedback} onChange={e => setFormFeedback(e.target.value)} className="input-field"></textarea></div>
                </>
              )}

              {currentTab === 'assessments' && (
                <div className="grid-2">
                  <div className="form-group"><label className="label">Assessment Type *</label><select value={formAssessmentType} onChange={e => setFormAssessmentType(e.target.value)} className="input-field"><option>Term Exam</option><option>Internal Assessment</option><option>MCQ Test</option><option>OSPE/OSCE</option><option>Viva Voce</option><option>Essay Question Grader</option></select></div>
                  <div className="form-group"><label className="label">Marks/Grade *</label><input type="text" required placeholder="e.g. 85/100, Grade A" value={formMarks} onChange={e => setFormMarks(e.target.value)} className="input-field" /></div>
                </div>
              )}

              {currentTab === 'reflections' && (
                <>
                  <div className="form-group"><label className="label">Reflection Title *</label><input type="text" required placeholder="e.g. Learning from error" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="input-field" /></div>
                  <div className="form-group"><label className="label">Context</label><input type="text" placeholder="e.g. Pediatrics ward ER" value={formContext} onChange={e => setFormContext(e.target.value)} className="input-field" /></div>
                  <div className="form-group"><label className="label">What Happened?</label><textarea rows={2} placeholder="Describe the situation..." value={formWhatHappened} onChange={e => setFormWhatHappened(e.target.value)} className="input-field"></textarea></div>
                  <div className="form-group"><label className="label">Future Action Plan</label><textarea rows={2} placeholder="What will you do differently?" value={formFuturePlan} onChange={e => setFormFuturePlan(e.target.value)} className="input-field"></textarea></div>
                </>
              )}

              {currentTab === 'documents' && (
                <>
                  <div className="grid-2">
                    <div className="form-group"><label className="label">Document Title *</label><input type="text" required placeholder="e.g. Certificate" value={formDocTitle} onChange={e => setFormDocTitle(e.target.value)} className="input-field" /></div>
                    <div className="form-group"><label className="label">Category *</label><select value={formDocCategory} onChange={e => setFormDocCategory(e.target.value)} className="input-field"><option>Case Report</option><option>Presentation Slides</option><option>Certificate</option><option>Logbook Scan</option></select></div>
                  </div>
                  <div className="form-group"><label className="label">Upload File (Optional)</label><input type="file" className="input-field" style={{ padding: '8px' }} /></div>
                </>
              )}

              <div className="form-group">
                <label className="label">{currentTab === 'assessments' ? 'Examiner Name *' : 'Supervisor / Faculty *'}</label>
                <input type="text" required placeholder="e.g. Dr. Narayana K" value={formSupervisor} onChange={(e) => setFormSupervisor(e.target.value)} className="input-field" />
              </div>

              <div className="form-group">
                <label className="label">Key Learning Points / Remarks</label>
                <textarea rows={2} placeholder="Main take-away..." value={formLearningPoints} onChange={(e) => setFormLearningPoints(e.target.value)} className="input-field"></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

