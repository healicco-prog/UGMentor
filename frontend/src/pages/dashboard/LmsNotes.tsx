// React component
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronRight, Menu, Sparkles } from 'lucide-react';
import MCQRenderer from '@/components/MCQRenderer';
import FlashcardRenderer from '@/components/FlashcardRenderer';
import QuestionRenderer from '@/components/QuestionRenderer';

// â”€â”€â”€ Course → Subject Mapping (mirroring MedEduAI) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COURSE_DATA: Record<string, { subjects: string[]; versions: string[] }> = {
  MBBS: {
    subjects: [
      'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Microbiology',
      'Pharmacology', 'Forensic Medicine & Toxicology (FMT)',
      'Community Medicine (PSM)', 'Ophthalmology', 'ENT (Otorhinolaryngology)',
      'General Medicine', 'Pediatrics', 'Dermatology', 'Psychiatry',
      'General Surgery', 'Orthopedics', 'Obstetrics & Gynaecology (OBG)',
      'Anesthesia', 'Radiology', 'Emergency Medicine',
    ],
    versions: ['Standard Curriculum', '2026'],
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
    versions: ['Standard Curriculum', '2026'],
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
    versions: ['2026'],
  },
};

const COURSES = Object.keys(COURSE_DATA);

// Sample topics (in a real app these would come from an API based on course/subject/version)
const SAMPLE_TOPICS = [
  { id: '1', title: 'Anatomical positions & planes', completed: true },
  { id: '2', title: 'Terms of movements', completed: true },
  { id: '3', title: 'Types of bones', completed: false },
  { id: '4', title: 'Blood supply of bones', completed: false },
  { id: '5', title: 'Types of joints & movements', completed: false },
  { id: '6', title: 'Epithelium types & modifications', completed: true },
  { id: '7', title: 'Connective tissue', completed: true },
];

const TABS = [
  'Introduction', 'Detailed Notes', 'Summary',
  '10 Marks Q', '5 Marks Q', '3 Marks Reasoning',
  'Case-Based MCQs', '1 Mark MCQs', 'Flashcards', 'Revision Mode',
];

export default function LMSNotesPage() {
  const [course, setCourse] = useState('MBBS');
  const [subjects, setSubjects] = useState(COURSE_DATA['MBBS'].subjects);
  const [versions, setVersions] = useState(COURSE_DATA['MBBS'].versions);
  const [subject, setSubject] = useState(COURSE_DATA['MBBS'].subjects[0]);
  const [version, setVersion] = useState(COURSE_DATA['MBBS'].versions[0]);
  const [searchTopic, setSearchTopic] = useState('');
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTopicId, setActiveTopicId] = useState('');
  const [activeTab, setActiveTab] = useState('Introduction');
  const [chatInput, setChatInput] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch topics from Supabase
  useEffect(() => {
    async function fetchTopics() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lms_content')
        .select('*')
        .eq('course', course)
        .eq('subject', subject)
        .eq('version', version);

      if (!error && data) {
        setTopics(data);
        if (data.length > 0) {
          setActiveTopicId(data[0].id);
          // Auto-expand the section of the first topic
          const firstSection = data[0].section || 'General Topics';
          setExpandedSections({ [firstSection]: true });
        } else {
          setActiveTopicId('');
        }
      } else {
        setTopics([]);
        setActiveTopicId('');
      }
      setIsLoading(false);
    }
    fetchTopics();
  }, [course, subject, version]);

  // When course changes → update subjects & versions, reset selections
  useEffect(() => {
    const data = COURSE_DATA[course];
    setSubjects(data.subjects);
    setVersions(data.versions);
    setSubject(data.subjects[0]);
    setVersion(data.versions[0]);
  }, [course]);

  const activeTopic = topics.find(t => t.id === activeTopicId);
  const filteredTopics = topics.filter(t =>
    (t.topic || '').toLowerCase().includes(searchTopic.toLowerCase())
  );
  
  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    const sectionName = topic.section || 'General Topics';
    if (!acc[sectionName]) acc[sectionName] = [];
    acc[sectionName].push(topic);
    return acc;
  }, {} as Record<string, any[]>);

  const progress = Math.round((topics.filter(t => t.completed).length / Math.max(topics.length, 1)) * 100);

  const toggleCompleted = () => {
    setTopics(prev => prev.map(t => t.id === activeTopicId ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div style={{ height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .notes-layout { display: flex; flex: 1; overflow: hidden; position: relative; }

        .notes-left {
          width: 290px; border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          background: var(--bg-surface); flex-shrink: 0;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .notes-left.collapsed { margin-left: -290px; }
        
        .notes-middle {
          flex: 1; display: flex; flex-direction: column;
          background: var(--bg-base); overflow: hidden; min-width: 0;
          position: relative; z-index: 10;
          box-shadow: 0 0 20px rgba(0,0,0,0.02);
        }
        
        .notes-right {
          width: 310px; border-left: 1px solid var(--border);
          background: var(--bg-surface); display: flex; flex-direction: column; flex-shrink: 0;
          transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .notes-right.collapsed { margin-right: -310px; }

        .notes-content-scroll {
          flex: 1; overflow-y: auto; padding: 28px 32px;
        }
        .notes-card {
          padding: 32px;
        }

        .topic-btn { transition: background 0.15s, color 0.15s; }
        .topic-btn:hover { background: var(--bg-elevated) !important; }

        .notes-tab-btn {
          padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
          border: 1px solid var(--border);
          background: var(--bg-surface); color: var(--text-secondary);
          flex-shrink: 0;
        }
        .notes-tab-btn:hover { border-color: var(--primary); color: var(--primary); }
        .notes-tab-btn.active {
          background: var(--primary); color: #fff; border-color: var(--primary);
        }
        .notes-tab-btn.revision {
          background: rgba(108,59,255,0.08); border-color: var(--primary); color: var(--primary);
        }
        .notes-tab-btn.revision.active {
          background: var(--primary); color: #fff;
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 1100px) { .notes-right { width: 270px; } .notes-right.collapsed { margin-right: -270px; } }
        @media (max-width: 960px)  { .notes-right { display: none; } }
        @media (max-width: 768px)  {
          .notes-layout { display: flex; flex-direction: row; }
          .notes-left { 
            position: absolute; top: 0; left: 0; bottom: 0; z-index: 50; 
            width: 290px; box-shadow: 4px 0 24px rgba(0,0,0,0.1); 
          }
          .notes-left.collapsed { margin-left: 0; transform: translateX(-100%); box-shadow: none; }
          .notes-middle { min-height: 100%; overflow: hidden; width: 100%; }
          .notes-content-scroll { padding: 16px 12px; }
          .notes-card { padding: 20px 16px; }
        }
      `}</style>

      <div className="notes-layout">

        {/* â”€â”€ LEFT: Navigation & Topics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className={`notes-left ${!isLeftOpen ? 'collapsed' : ''}`}>
          <div style={{ padding: '16px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid var(--border)' }}>

            {/* Course + Subject row */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'block', letterSpacing: 0.5 }}>Course</label>
                <select
                  className="input-field"
                  style={{ padding: '7px 8px', fontSize: 13 }}
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                >
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'block', letterSpacing: 0.5 }}>Subject</label>
                <select
                  className="input-field"
                  style={{ padding: '7px 8px', fontSize: 13 }}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Curriculum Version */}
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'block', letterSpacing: 0.5 }}>Curriculum Version</label>
              <select
                className="input-field"
                style={{ padding: '7px 8px', fontSize: 13 }}
                value={version}
                onChange={e => setVersion(e.target.value)}
              >
                {versions.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>ðŸ”</span>
              <input
                className="input-field"
                placeholder="Search topic..."
                value={searchTopic}
                onChange={e => setSearchTopic(e.target.value)}
                style={{ padding: '7px 8px 7px 34px', fontSize: 13 }}
              />
            </div>
          </div>

          {/* Topics header */}
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Topics</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, background: 'rgba(108,59,255,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                {filteredTopics.length}
              </span>
              <button onClick={() => setIsLeftOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }} title="Close Sidebar">
                âœ•
              </button>
            </div>
          </div>

          {/* Topics list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {isLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : filteredTopics.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No topics found</div>
            ) : (
              Object.entries(groupedTopics).map(([sectionName, sectionTopics]) => (
                <div key={sectionName} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button
                    onClick={() => toggleSection(sectionName)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', fontWeight: 600, fontSize: 12, color: 'var(--text-primary)',
                      textAlign: 'left'
                    }}
                  >
                    <span>{sectionName}</span>
                    {expandedSections[sectionName] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {expandedSections[sectionName] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 6 }}>
                      {(sectionTopics as any[]).map((topic, idx) => (
                        <button
                          key={topic.id}
                          className="topic-btn"
                          onClick={() => setActiveTopicId(topic.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px',
                            background: activeTopicId === topic.id ? 'rgba(108,59,255,0.08)' : 'transparent',
                            border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            textAlign: 'left', color: activeTopicId === topic.id ? 'var(--primary)' : 'var(--text-secondary)',
                          }}
                        >
                          <span style={{ fontSize: 11, width: 18, textAlign: 'center', opacity: 0.5, fontWeight: 600, flexShrink: 0 }}>{idx + 1}</span>
                          <span style={{ fontSize: 14, flexShrink: 0 }}>{topic.completed ? '✅' : 'â³'}</span>
                          <span style={{ fontSize: 13, fontWeight: activeTopicId === topic.id ? 600 : 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {topic.topic}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Progress footer */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>ðŸ† Progress</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%`, background: '#22c55e' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              {course} â€º {subject.length > 28 ? subject.substring(0, 28) + 'â€¦' : subject}
            </div>
          </div>
        </div>

        {/* â”€â”€ MIDDLE: Note Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="notes-middle">
          {/* Header + breadcrumb + tabs */}
          <div style={{ padding: '16px 24px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              {course} â€º {subject}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                {!isLeftOpen && (
                  <button onClick={() => setIsLeftOpen(true)} className="btn btn-secondary btn-sm" style={{ padding: '6px', border: 'none', background: 'transparent' }} title="Open Sidebar">
                    <Menu size={20} />
                  </button>
                )}
                <h1 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {activeTopic?.topic}
                </h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={toggleCompleted}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 2, padding: '4px 10px', fontSize: 12, borderColor: activeTopic?.completed ? '#22c55e' : undefined, color: activeTopic?.completed ? '#22c55e' : undefined }}
                >
                  {activeTopic?.completed ? '✅ Completed' : 'â˜‘ï¸ Mark Complete'}
                </button>
                {!isRightOpen && (
                  <button onClick={() => setIsRightOpen(true)} className="btn btn-primary btn-sm" style={{ padding: '6px', marginTop: 2 }} title="Open AI Mentor">
                    <Sparkles size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Tab pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingBottom: 12 }}>
              {TABS.map(tab => {
                const isRevision = tab === 'Revision Mode';
                const isActiveTab = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`notes-tab-btn${isRevision ? ' revision' : ''}${isActiveTab ? ' active' : ''}`}
                  >
                    {isRevision && <span style={{ marginRight: 4 }}>⚡</span>}
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note body */}
          <div className="notes-content-scroll">
            <div className="card notes-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(108,59,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  ðŸ“
                </div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{activeTab}</h2>
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8 }}>
                {activeTopic ? (
                  <>
                    <p style={{ marginBottom: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {activeTopic.topic} — {subject}
                    </p>
                    
                    {activeTab === 'Introduction' && (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeTopic.introduction || '*No introduction available.*'}</ReactMarkdown>
                    )}
                    {activeTab === 'Detailed Notes' && (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeTopic.detailed_notes || '*No detailed notes available.*'}</ReactMarkdown>
                    )}
                    {activeTab === 'Summary' && (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeTopic.summary || '*No summary available.*'}</ReactMarkdown>
                    )}
                    {activeTab === '10 Marks Q' && (
                      <QuestionRenderer 
                        text={activeTopic.marks_10_questions || ''} 
                        course={course} subject={subject} section={activeTopic.section || ''} topic={activeTopic.topic || ''} marksType="10 Marks Question"
                      />
                    )}
                    {activeTab === '5 Marks Q' && (
                      <QuestionRenderer 
                        text={activeTopic.marks_5_questions || ''} 
                        course={course} subject={subject} section={activeTopic.section || ''} topic={activeTopic.topic || ''} marksType="5 Marks Question"
                      />
                    )}
                    {activeTab === '3 Marks Reasoning' && (
                      <QuestionRenderer 
                        text={activeTopic.marks_3_reasoning || ''} 
                        course={course} subject={subject} section={activeTopic.section || ''} topic={activeTopic.topic || ''} marksType="3 Marks Reasoning Question"
                      />
                    )}
                    {activeTab === 'Case-Based MCQs' && (
                      <MCQRenderer text={activeTopic.marks_2_case_mcqs || ''} />
                    )}
                    {activeTab === '1 Mark MCQs' && (
                      <MCQRenderer text={activeTopic.marks_1_mcqs || ''} />
                    )}
                    {activeTab === 'Flashcards' && (
                      <FlashcardRenderer text={activeTopic.flashcards} />
                    )}
                    {activeTab === 'Revision Mode' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ padding: '24px', background: 'rgba(108,59,255,0.05)', borderRadius: '12px', border: '1px solid rgba(108,59,255,0.2)' }}>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px', color: 'var(--primary)', fontSize: '18px', fontWeight: 800 }}>
                            <span>⚡</span> Quick Review
                          </h3>
                          <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeTopic.summary || '*No summary available.*'}</ReactMarkdown>
                          </div>
                        </div>
                        
                        <div style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 800 }}>
                            <span>🎯</span> High-Yield Flashcards
                          </h3>
                          <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                            <FlashcardRenderer text={activeTopic.flashcards} />
                          </div>
                        </div>

                        <div style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px', color: '#16a34a', fontSize: '18px', fontWeight: 800 }}>
                            <span>🧠</span> Self-Assessment
                          </h3>
                          <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Ready to test your knowledge on <strong>{activeTopic.topic}</strong>? Try the interactive MCQs to reinforce your memory.
                          </p>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setActiveTab('1 Mark MCQs')} className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>Practice MCQs</button>
                            <button onClick={() => setActiveTab('Case-Based MCQs')} className="btn btn-secondary btn-sm" style={{ padding: '8px 16px' }}>Clinical Cases</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p>Select a topic to view content.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ RIGHT: AI Mentor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className={`notes-right ${!isRightOpen ? 'collapsed' : ''}`}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>âœ¨</span>
              <span style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>UGMentor AI</span>
            </div>
            <button onClick={() => setIsRightOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Close AI Mentor">
              âœ•
            </button>
          </div>

          <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', overflowY: 'auto' }}>
            <div style={{ fontSize: 56 }}>🤖</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Hi Student! Need help understanding <br/>
              <strong style={{ color: 'var(--text-primary)' }}>{activeTopic?.topic}</strong>?
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: 999, border: '1px solid var(--border)' }}>
              {course} Â· {subject.length > 22 ? subject.substring(0, 22) + 'â€¦' : subject}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 8 }}>
              {['Explain in simple terms', 'Create a mnemonic for this', 'Generate 5 practice MCQs', 'Summarize key points'].map(action => (
                <button key={action} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px', fontSize: 13 }}>
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 11, fontWeight: 700 }}>
              <span style={{ color: 'var(--danger)' }}>0 AI TOKENS</span>
              <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>ðŸ† Upgrade</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                placeholder="Ask anything..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                style={{ width: '100%', padding: '11px 44px 11px 16px', borderRadius: 24 }}
              />
              <button style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>
                â†‘
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

