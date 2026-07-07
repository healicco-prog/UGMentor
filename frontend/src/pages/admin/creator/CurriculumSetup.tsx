import React, { useState, useEffect, useCallback } from 'react';
import { supabase, fetchAllRows } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const s: Record<string, React.CSSProperties> = {
  card: { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  label: { fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  select: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#0f172a', fontWeight: 500, fontSize: 14, marginBottom: 10, background: '#fafafa' },
  row: { display: 'flex', gap: 8 },
  input: { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, minWidth: 0 },
  btnDark: { background: '#0f172a', color: '#fff', width: 40, borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 18, cursor: 'pointer', flexShrink: 0 },
  btnBlue: { background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
  topicRow: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 },
  badge: (done: boolean): React.CSSProperties => ({ width: 30, height: 30, borderRadius: '50%', background: done ? '#22c55e' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#fff' : '#64748b', fontWeight: 700, fontSize: 13, flexShrink: 0 }),
  btnGreen: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  btnRed: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
};

interface Topic { id: string; topic: string; section: string; last_generated_at?: string; }

interface Props {
  course: string; setCourse: (v: string) => void;
  subject: string; setSubject: (v: string) => void;
  section: string; setSection: (v: string) => void;
  courses: string[]; setCourses: (v: string[]) => void;
  subjects: string[]; setSubjects: (v: string[]) => void;
  sections: string[]; setSections: (v: string[]) => void;
}

export default function CurriculumSetup({ course, setCourse, subject, setSubject, section, setSection, courses, setCourses, subjects, setSubjects, sections, setSections }: Props) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newSection, setNewSection] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [showBulkSubject, setShowBulkSubject] = useState(false);
  const [bulkSection, setBulkSection] = useState('');
  const [showBulkSection, setShowBulkSection] = useState(false);

  // Fetch courses once
  useEffect(() => {
    supabase.from('lms_content').select('course').neq('course', 'Blog').then(({ data }) => {
      if (data) {
        const u = [...new Set(data.map((d: any) => d.course).filter(Boolean))] as string[];
        setCourses(prev => [...new Set([...prev, ...u])].sort());
      }
    });
  }, []);

  // Fetch subjects when course changes
  useEffect(() => {
    if (!course) return;
    supabase.from('lms_content').select('subject').eq('course', course).then(({ data }) => {
      if (data) {
        const u = [...new Set(data.map((d: any) => d.subject).filter(Boolean))] as string[];
        setSubjects(prev => {
          const merged = [...new Set([...prev, ...u])].sort();
          if (merged.length && !merged.includes(subject)) setSubject(merged[0]);
          return merged;
        });
      }
    });
  }, [course]);

  // Fetch sections when subject changes
  useEffect(() => {
    if (!course || !subject) return;
    supabase.from('lms_content').select('section').eq('course', course).eq('subject', subject).then(({ data }) => {
      if (data) {
        const u = [...new Set(data.map((d: any) => d.section).filter(Boolean))].sort() as string[];
        setSections(u);
        if (u.length && !u.includes(section)) setSection(u[0]);
      }
    });
  }, [course, subject]);

  const fetchTopics = useCallback(async () => {
    if (!course || !subject || !section) { setTopics([]); return; }
    setLoading(true);
    const buildQuery = () => {
      let query = supabase.from('lms_content').select('id, topic, section, last_generated_at');
      if (course !== 'All Courses') query = query.eq('course', course);
      if (subject !== 'All Subjects') query = query.eq('subject', subject);
      if (section !== 'All Sections') query = query.eq('section', section);
      return query;
    };
    
    try {
      const data = await fetchAllRows(buildQuery, 20000);
      setTopics((data || []).map((t: any) => ({ ...t })));
    } catch (error) {
      toast.error('Failed to load topics');
    }
    setLoading(false);
  }, [course, subject, section]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  // Helper for UUID generation in case crypto.randomUUID is unavailable in older browsers
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const executeLmsQuery = async (action: string, payload?: any, id?: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const res = await fetch(`${apiUrl}/api/admin/lms/execute-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ action, payload, id })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'API Error');
    return json;
  };

  const addTopic = async () => {
    if (!newTopic.trim() || !section) return;
    try {
      await executeLmsQuery('insert', { 
        course, subject, version: '2026', section, topic: newTopic.trim(), 
        last_generated_at: null,
        topic_id: generateUUID(),
        author_name: 'Dr. Narayana K (Super Admin)',
        author_bio: 'Generated by Content Creator Intelligence'
      });
      toast.success('Topic added'); 
      setNewTopic(''); 
      fetchTopics();
    } catch (e) {
      toast.error('Failed to add topic');
    }
  };

  const saveTopic = async () => {
    if (!editVal.trim() || !editId) return;
    try {
      await executeLmsQuery('update', { topic: editVal.trim() }, editId);
      toast.success('Saved'); 
      setEditId(null); 
      fetchTopics();
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const deleteTopic = async (id: string) => {
    if (!window.confirm('Delete this topic?')) return;
    try {
      await executeLmsQuery('delete', null, id);
      toast.success('Deleted'); 
      fetchTopics();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const bulkAddSubjects = async () => {
    const lines = bulkSubject.split('\n').map(l => l.trim()).filter(Boolean);
    try {
      const payload = lines.map(s => ({ 
        course, subject: s, version: '2026', section: 'General Topics', topic: `Introduction to ${s}`, 
        last_generated_at: null,
        topic_id: generateUUID(),
        author_name: 'Dr. Narayana K (Super Admin)',
        author_bio: 'Generated by Content Creator Intelligence'
      }));
      await executeLmsQuery('insert', payload);
      toast.success(`Added ${lines.length} subjects`);
      setBulkSubject(''); setShowBulkSubject(false);
      // Refresh subjects
      supabase.from('lms_content').select('subject').eq('course', course).then(({ data }) => {
        if (data) { const u = [...new Set(data.map((d: any) => d.subject).filter(Boolean))].sort() as string[]; setSubjects(u); }
      });
    } catch (e) {
      toast.error('Bulk add failed');
    }
  };

  const bulkAddSections = async () => {
    const lines = bulkSection.split('\n').map(l => l.trim()).filter(Boolean);
    try {
      const payload = lines.map(sec => ({ 
        course, subject, version: '2026', section: sec, topic: `Introduction to ${sec}`, 
        last_generated_at: null,
        topic_id: generateUUID(),
        author_name: 'Dr. Narayana K (Super Admin)',
        author_bio: 'Generated by Content Creator Intelligence'
      }));
      await executeLmsQuery('insert', payload);
      toast.success(`Added ${lines.length} sections`);
      setBulkSection(''); setShowBulkSection(false);
      supabase.from('lms_content').select('section').eq('course', course).eq('subject', subject).then(({ data }) => {
        if (data) { const u = [...new Set(data.map((d: any) => d.section).filter(Boolean))].sort() as string[]; setSections(u); }
      });
    } catch (e) {
      toast.error('Bulk add failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      {/* LEFT PANEL */}
      <div style={{ flex: '1 1 250px', minWidth: 250, maxWidth: 350, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Course */}
        <div style={s.card}>
          <div style={s.label}><span>📖 Context: Course</span></div>
          <select value={course} onChange={e => setCourse(e.target.value)} style={s.select}>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={s.row}>
            <input placeholder="Add new course..." value={newCourse} onChange={e => setNewCourse(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newCourse.trim()) { const c = newCourse.trim(); setCourses([...courses, c].sort()); setCourse(c); setNewCourse(''); }}}
              style={s.input} />
            <button style={s.btnDark} onClick={() => { if (!newCourse.trim()) return; const c = newCourse.trim(); setCourses([...courses, c].sort()); setCourse(c); setNewCourse(''); }}>+</button>
          </div>
        </div>

        {/* Subject */}
        <div style={s.card}>
          <div style={s.label}>
            <span>📚 Context: Subject</span>
            <button style={s.btnBlue} onClick={() => setShowBulkSubject(!showBulkSubject)}>↑ Bulk Upload</button>
          </div>
          <select value={subject} onChange={e => setSubject(e.target.value)} style={s.select}>
            {subjects.length === 0 && <option value="">No subjects</option>}
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {showBulkSubject && (
            <div style={{ marginBottom: 8 }}>
              <textarea value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} placeholder="One subject per line..." rows={4} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none', fontSize: 13, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ ...s.btnGreen, flex: 1 }} onClick={bulkAddSubjects}>Upload</button>
                <button style={{ ...s.btnRed, flex: 1 }} onClick={() => setShowBulkSubject(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div style={s.row}>
            <input placeholder="Add new subject..." value={newSubject} onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newSubject.trim()) { const sv = newSubject.trim(); setSubjects([...subjects, sv].sort()); setSubject(sv); setNewSubject(''); }}}
              style={s.input} />
            <button style={s.btnDark} onClick={() => { if (!newSubject.trim()) return; const sv = newSubject.trim(); setSubjects([...subjects, sv].sort()); setSubject(sv); setNewSubject(''); }}>+</button>
          </div>
        </div>

        {/* Section */}
        <div style={s.card}>
          <div style={s.label}>
            <span>🗂️ Context: Section</span>
            <button style={s.btnBlue} onClick={() => setShowBulkSection(!showBulkSection)}>↑ Bulk Upload</button>
          </div>
          <select value={section} onChange={e => setSection(e.target.value)} style={s.select}>
            {sections.length === 0 && <option value="">No sections</option>}
            {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
          </select>
          {showBulkSection && (
            <div style={{ marginBottom: 8 }}>
              <textarea value={bulkSection} onChange={e => setBulkSection(e.target.value)} placeholder="One section per line..." rows={4} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none', fontSize: 13, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ ...s.btnGreen, flex: 1 }} onClick={bulkAddSections}>Upload</button>
                <button style={{ ...s.btnRed, flex: 1 }} onClick={() => setShowBulkSection(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div style={s.row}>
            <input placeholder="Add new section..." value={newSection} onChange={e => setNewSection(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newSection.trim()) { const sv = newSection.trim(); setSections([...sections, sv].sort()); setSection(sv); setNewSection(''); }}}
              style={s.input} />
            <button style={s.btnDark} onClick={() => { if (!newSection.trim()) return; const sv = newSection.trim(); setSections([...sections, sv].sort()); setSection(sv); setNewSection(''); }}>+</button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Topics */}
      <div style={{ flex: '2 1 400px', minWidth: 300, ...s.card }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 4 }}>{section || 'No section selected'}</h2>
            <div style={{ color: '#64748b', fontSize: 13 }}>{subject} • {course}</div>
          </div>
          <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{topics.filter(t => t.last_generated_at).length}/{topics.length} generated</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input value={newTopic} onChange={e => setNewTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTopic()}
            placeholder="Manually add a specific topic..." disabled={!section || section === 'All Sections'}
            style={{ flex: 1, padding: '14px 18px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14 }} />
          <button onClick={addTopic} disabled={!section || section === 'All Sections'}
            style={{ background: section && section !== 'All Sections' ? '#22c55e' : '#cbd5e1', color: '#fff', padding: '0 20px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: section && section !== 'All Sections' ? 'pointer' : 'not-allowed' }}>
            + Add
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Loading topics...</div>
        ) : topics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>No topics found. Add one above.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topics.map((t, i) => (
              <div key={t.id} style={s.topicRow}>
                <div style={s.badge(!!t.last_generated_at)}>{t.last_generated_at ? '✓' : i + 1}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  {editId === t.id ? (
                    <input value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveTopic()} autoFocus
                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none', fontSize: 14 }} />
                  ) : (
                    <div style={{ fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>{t.topic}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {editId === t.id ? (
                    <>
                      <button onClick={saveTopic} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✓</button>
                      <button onClick={() => setEditId(null)} style={{ background: '#94a3b8', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(t.id); setEditVal(t.topic); }} style={s.btnGreen}>Edit</button>
                      <button onClick={() => deleteTopic(t.id)} style={s.btnRed}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
