import React, { useState, useEffect, useCallback } from 'react';
import { supabase, fetchAllRows } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Topic { id: string; topic: string; section: string; last_generated_at?: string; }

interface Props {
  course: string; setCourse: (c: string) => void;
  subject: string; setSubject: (s: string) => void;
  section: string; setSection: (s: string) => void; sections: string[];
  courses: string[]; subjects: string[];
  version: string; setVersion: (v: string) => void; versions: string[];
  setActiveTab?: (tab: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
  introduction: 'Introduction', detailed_notes: 'Detailed Notes', summary: 'Summary',
  marks_10_questions: '10-Mark Questions', marks_5_questions: '5-Mark Questions',
  marks_3_reasoning: '3-Mark Reasoning', marks_2_case_mcqs: 'Case MCQs', marks_1_mcqs: '1-Mark MCQs', flashcards: 'Flashcards',
};
const ALL_FIELDS = Object.keys(FIELD_LABELS);

export default function GenerationEngine({ course, setCourse, subject, setSubject, section, setSection, sections, courses, subjects, version, setVersion, versions, setActiveTab }: Props) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState(section);
  const [queue, setQueue] = useState<{ id: string; topic: string; last_generated_at?: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [pendingSave, setPendingSave] = useState<Record<string, any>>({});
  const [batchResults, setBatchResults] = useState<Record<string, any>>({});
  
  // Edit Modal State
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingData, setEditingData] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [activeStructure, setActiveStructure] = useState<any>(null);

  useEffect(() => { setActiveSection(section); }, [section]);

  useEffect(() => {
    const saved = localStorage.getItem(`lms_template_${course}`);
    if (saved) {
      try {
        setActiveStructure(JSON.parse(saved));
      } catch (e) {}
    } else {
      setActiveStructure(null);
    }
  }, [course]);

  const fetchTopics = useCallback(async () => {
    if (!course || !subject || !activeSection || !version) { setTopics([]); return; }
    setLoadingTopics(true);
    const buildQuery = () => {
      let q = supabase.from('lms_content').select('id, topic, section, last_generated_at, course, subject');
      if (course !== 'All Courses') q = q.eq('course', course);
      if (subject !== 'All Subjects') q = q.eq('subject', subject);
      if (activeSection !== 'All Sections') q = q.eq('section', activeSection);
      if (version !== 'All Versions') q = q.eq('version', version);
      return q;
    };
    
    // Fetch all topics, paginating past the 1000 limit, up to a max of 20,000 for browser safety
    const data = await fetchAllRows(buildQuery, 20000);
    setTopics(data || []);
    setLoadingTopics(false);
  }, [course, subject, activeSection, version]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const selectAll = () => setSelectedTopics(new Set(topics.map(t => t.id)));
  const clearAll = () => setSelectedTopics(new Set());

  const buildPrompt = (topic: string, courseName: string) => {
    let structure = `Return a JSON object EXACTLY like this (no markdown fences):\n{\n`;
    try {
      const saved = localStorage.getItem(`lms_template_${courseName}`);
      if (saved) {
        const config = JSON.parse(saved);
        structure += `  "introduction": "Format: ${config.introduction.desc}, Words: ~${config.introduction.words}",\n`;
        structure += `  "detailed_notes": "Format: ${config.detailed.desc}, Words: ~${config.detailed.words}",\n`;
        structure += `  "summary": "Format: ${config.summary.desc}, Words: ~${config.summary.words}",\n`;
        structure += `  "marks_10_questions": "Generate ${config.q10.count} questions",\n`;
        structure += `  "marks_5_questions": "Generate ${config.q5.count} questions",\n`;
        structure += `  "marks_3_reasoning": "Generate ${config.q3.count} questions",\n`;
        structure += `  "marks_2_case_mcqs": "Generate ${config.q2.count} case-based MCQs",\n`;
        structure += `  "marks_1_mcqs": "Generate ${config.q1.count} MCQs",\n`;
        structure += `  "flashcards": "Generate ${config.flashcards.count} flashcards"\n}`;
      } else {
        throw new Error('No config');
      }
    } catch {
      // Fallback
      structure += `  "introduction": "...",\n  "detailed_notes": "...",\n  "summary": "...",\n  "marks_10_questions": "...",\n  "marks_5_questions": "...",\n  "marks_3_reasoning": "...",\n  "marks_2_case_mcqs": "...",\n  "marks_1_mcqs": "...",\n  "flashcards": "..."\n}`;
    }

    return `You are an expert medical professor. Generate comprehensive study notes for:
Course: ${course}, Subject: ${subject}, Topic: ${topic}

${structure}

Each field should be medically accurate, exam-oriented, well-structured markdown text.`;
  };

  const generateSingle = async (topicObj: Topic): Promise<any> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${apiUrl}/api/generate-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ course, subject, topic: topicObj.topic, noteType: 'comprehensive', structured: true, customPrompt: buildPrompt(topicObj.topic, course) }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      // Try to parse JSON from content
      let parsed: any = {};
      try {
        const raw = (json.content || '').trim();
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch (_) { parsed = { detailed_notes: json.content || '' }; }
      return { ...parsed, last_generated_at: new Date().toISOString() };
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const queueJobs = () => {
    const sel = topics.filter(t => selectedTopics.has(t.id));
    if (!sel.length) { toast.error('Select at least one topic'); return; }
    setQueue(sel.map(t => ({ id: t.id, topic: t.topic, last_generated_at: t.last_generated_at })));
    toast.success(`${sel.length} topics queued`);
  };

  const startGeneration = async (topicsToProcess: { id: string; topic: string; last_generated_at?: string }[]) => {
    if (!topicsToProcess.length) { toast.error('No topics selected'); return; }
    
    // Check if any have already been generated
    const alreadyGenerated = topicsToProcess.filter(t => t.last_generated_at);
    if (alreadyGenerated.length > 0) {
      const confirmRewrite = window.confirm(`${alreadyGenerated.length} of the selected topics already have notes. Do you want to rewrite them?`);
      if (!confirmRewrite) return;
    }
    
    setProcessing(true);
    setProcessedCount(0);
    const results: Record<string, any> = { ...batchResults };
    for (let i = 0; i < topicsToProcess.length; i++) {
      const item = topicsToProcess[i];
      toast(`Generating: ${item.topic.slice(0, 40)}...`, { icon: '⚡' });
      try {
        const data = await generateSingle({ id: item.id, topic: item.topic, section: activeSection });
        results[item.id] = data;
        setBatchResults({ ...results });
        setPendingSave(prev => ({ ...prev, [item.id]: data }));
      } catch (e: any) {
        toast.error(`Failed: ${item.topic.slice(0, 30)} - ${e.message}`);
      }
      setProcessedCount(i + 1);
    }
    setProcessing(false);
    toast.success(`Generation complete! Click "Save to DB" to finalize.`);
  };

  const runBatch = async () => {
    if (!queue.length) { toast.error('Queue is empty. Click "Queue Jobs" first.'); return; }
    await startGeneration(queue);
  };

  const runQuickMode = async () => {
    const sel = topics.filter(t => selectedTopics.has(t.id));
    await startGeneration(sel);
  };

  const saveToDB = async () => {
    const entries = Object.entries(pendingSave);
    if (!entries.length) { toast.error('Nothing to save'); return; }
    let saved = 0;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    for (const [id, payload] of entries) {
      try {
        const res = await fetch(`${apiUrl}/api/admin/lms/save-notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ id, payload })
        });
        if (res.ok) {
          saved++;
          // Remove from batch results once saved successfully so hourglass icon goes away
          setBatchResults(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      } catch (err) {
        console.error('Failed to save to DB via API:', err);
      }
    }
    toast.success(`Saved ${saved} notes to database!`);
    setPendingSave({});
    fetchTopics();
  };

  const saveEditedTopic = async () => {
    if (!editingTopic || !editingData) return;
    setIsSavingEdit(true);
    try {
      let parsed = JSON.parse(editingData);
      parsed.last_generated_at = new Date().toISOString();
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${apiUrl}/api/admin/lms/save-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id: editingTopic.id, payload: parsed })
      });
      
      if (!res.ok) {
        throw new Error('API failed to save');
      }

      toast.success('Saved edited payload to DB');
      
      // Update local state - clear from both batchResults and pendingSave so hourglass icon goes away
      setBatchResults(prev => {
        const next = { ...prev };
        delete next[editingTopic.id];
        return next;
      });
      setPendingSave(prev => {
        const next = { ...prev };
        delete next[editingTopic.id];
        return next;
      });
      setEditingTopic(null);
      fetchTopics();
    } catch (e: any) {
      toast.error('Invalid JSON or save failed: ' + e.message);
    }
    setIsSavingEdit(false);
  };

  const allSections = sections.length ? sections : activeSection ? [activeSection] : [];
  const pendingCount = Object.keys(pendingSave).length;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      {/* LEFT: Controls */}
      <div style={{ flex: '1 1 250px', minWidth: 250, maxWidth: 350, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Context: Course</div>
          <select value={course} onChange={e => setCourse(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Context: Paper / Subject</div>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Version</div>
          <select value={version} onChange={e => setVersion(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
            {versions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Context: Section</div>
          <select value={activeSection} onChange={e => { setActiveSection(e.target.value); setSection(e.target.value); }}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', outline: 'none', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Batch controls */}
        <div style={{ background: '#fff', borderRadius: 12, border: '2px solid #8b5cf6', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🚀</span>
            <span style={{ fontWeight: 700, color: '#7c3aed', fontSize: 13 }}>BACKGROUND BATCH MODE</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
            No token expiry · Close browser safely
          </div>
          <button onClick={queueJobs}
            style={{ width: '100%', background: processing ? '#e9d5ff' : '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 8 }}>
            {processing ? `⏳ Processing ${processedCount}/${queue.length}` : `▶ Queue ${selectedTopics.size} Jobs`}
          </button>
          <button onClick={runBatch} disabled={processing || queue.length === 0}
            style={{ width: '100%', background: processing || queue.length === 0 ? '#f5f3ff' : '#ede9fe', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 8, padding: '8px 0', fontWeight: 600, fontSize: 13, cursor: processing || queue.length === 0 ? 'not-allowed' : 'pointer' }}>
            Resume
          </button>
        </div>

        {/* Quick mode */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>OR QUICK MODE</div>
          <button onClick={runQuickMode} disabled={processing || selectedTopics.size === 0}
          style={{ background: processing || selectedTopics.size === 0 ? '#94a3b8' : '#1e293b', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: processing || selectedTopics.size === 0 ? 'not-allowed' : 'pointer' }}>
          ▶ Generate {selectedTopics.size} Notes
        </button>
        {pendingCount > 0 && (
          <button onClick={saveToDB}
            style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            💾 Save {pendingCount} Notes to DB
          </button>
        )}
      </div>

      {/* RIGHT: Two columns (Active Structure & Topics) */}
      <div style={{ flex: '2 1 600px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        
        {/* MIDDLE: Active LMS Structure */}
        <div style={{ flex: '1 1 280px', minWidth: 280, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', letterSpacing: 1, textTransform: 'uppercase' }}>ACTIVE LMS STRUCTURE</div>
            <button onClick={() => setActiveTab && setActiveTab('LMS Notes Structure')} style={{ background: 'none', border: 'none', color: '#4338ca', fontSize: 13, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>Edit</button>
          </div>
          
          {activeStructure ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Introduction', val: activeStructure.introduction?.desc },
                { label: 'Detailed Notes', val: activeStructure.detailed?.desc },
                { label: 'Summary', val: activeStructure.summary?.desc },
                { label: '10 Marks Question', val: `${activeStructure.q10?.count} items` },
                { label: '5 Marks Question', val: `${activeStructure.q5?.count} items` },
                { label: '3 Marks Reasoning Question', val: `${activeStructure.q3?.count} items` },
                { label: '2 Marks Case-based MCQs', val: `${activeStructure.q2?.count} items` },
                { label: '1 Mark MCQs Question', val: `${activeStructure.q1?.count} items` },
                { label: 'Flashcards', val: `${activeStructure.flashcards?.count} items` },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 8 ? '1px solid #f1f5f9' : 'none', paddingBottom: idx < 8 ? 10 : 0 }}>
                  <div style={{ fontWeight: 700, color: '#334155', fontSize: 13 }}>{item.label}</div>
                  <div style={{ background: '#fff', border: '1px solid #c7d2fe', color: '#4338ca', fontWeight: 600, fontSize: 12, padding: '4px 8px', borderRadius: 6, maxWidth: '50%', textAlign: 'right', wordBreak: 'break-word', lineHeight: 1.3 }}>
                    {item.val || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: 14, fontStyle: 'italic' }}>No active structure for this course. Please configure it first.</div>
          )}
        </div>

        {/* RIGHT: Topic List */}
        <div style={{ flex: '1.5 1 320px', minWidth: 300, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>SELECT TOPICS TO GENERATE</div>
            <button onClick={selectAll} style={{ background: 'none', border: 'none', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>select all</button>
          </div>
          
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px', marginBottom: 16 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
               <div style={{ fontSize: 15, fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>NOTES PROGRESS</div>
               <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{topics.filter(t => t.last_generated_at).length}/{topics.length} created</div>
             </div>
             <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
               <div style={{ height: '100%', background: '#22c55e', width: `${topics.length ? (topics.filter(t => t.last_generated_at).length / topics.length) * 100 : 0}%` }}></div>
             </div>
             <div style={{ display: 'flex', gap: 16 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#22c55e' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></div> {topics.filter(t => t.last_generated_at).length} Created</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#f59e0b' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></div> {topics.length - topics.filter(t => t.last_generated_at).length} Pending</div>
             </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <input type="checkbox" checked={selectedTopics.size === topics.length && topics.length > 0} onChange={(e) => e.target.checked ? selectAll() : clearAll()} style={{ width: 20, height: 20, cursor: 'pointer', marginRight: 16, accentColor: '#4338ca' }} />
              <div style={{ flex: 1, fontWeight: 700, fontSize: 16, color: '#475569' }}>(All topics)</div>
              <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 14 }}>{topics.length} total</div>
            </div>
            
            {loadingTopics ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading topics...</div>
            ) : topics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No topics found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {topics.map(t => {
                  const isSelected = selectedTopics.has(t.id);
                  const isGenerated = !!t.last_generated_at;
                  const hasPending = !!batchResults[t.id];
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleTopic(t.id)} style={{ width: 20, height: 20, cursor: 'pointer', marginRight: 16, accentColor: '#4338ca' }} />
                      <div style={{ flex: 1, fontWeight: 700, color: '#1e293b', fontSize: 16 }}>{t.topic}</div>
                      
                      {hasPending ? (
                         <button onClick={() => openEditor(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                           <span style={{ width: 24, height: 24, background: '#f59e0b', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>⏳</span>
                         </button>
                      ) : isGenerated ? (
                         <button onClick={() => openEditor(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Click to view/edit payload">
                           <span style={{ width: 24, height: 24, background: 'transparent', border: '2px solid #22c55e', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', fontSize: 14, fontWeight: 'bold' }}>✓</span>
                         </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {editingTopic && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Edit Payload</h3>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{editingTopic.topic}</div>
              </div>
              <button onClick={() => setEditingTopic(null)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>JSON Payload</div>
              <textarea 
                value={editingData} 
                onChange={e => setEditingData(e.target.value)}
                style={{ width: '100%', height: 400, padding: 16, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontFamily: 'monospace', fontSize: 13, resize: 'vertical', outline: 'none' }}
                spellCheck={false}
              />
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f8fafc', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
              <button onClick={() => setEditingTopic(null)} style={{ padding: '10px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveEditedTopic} disabled={isSavingEdit} style={{ padding: '10px 24px', background: '#10b981', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 14, cursor: isSavingEdit ? 'not-allowed' : 'pointer' }}>
                {isSavingEdit ? 'Saving...' : 'Save to Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
