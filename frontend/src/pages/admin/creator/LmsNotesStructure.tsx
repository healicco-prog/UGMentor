import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  course: string;
}

export default function LmsNotesStructure({ course }: Props) {
  // Default values
  const [config, setConfig] = useState({
    introduction: { desc: 'Exam-oriented bullet points', words: '300', type: 'Text Format' },
    detailed: { desc: 'Essay format', words: '1500', type: 'Text Format' },
    summary: { desc: 'Concise revision or image summary', words: '500', type: 'Text Format' },
    q10: { count: '2', type: 'Quantity / Number count' },
    q5: { count: '3', type: 'Quantity / Number count' },
    q3: { count: '3', type: 'Quantity / Number count' },
    q2: { count: '3', type: 'Quantity / Number count' },
    q1: { count: '5', type: 'Quantity / Number count' },
    flashcards: { count: '10', type: 'Quantity / Number count' },
  });

  useEffect(() => {
    const saved = localStorage.getItem(`lms_template_${course}`);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved config');
      }
    }
  }, [course]);

  const handleUpdate = (field: keyof typeof config, key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: { ...prev[field], [key]: value }
    }));
  };

  const handleConfirm = () => {
    localStorage.setItem(`lms_template_${course}`, JSON.stringify(config));
    toast.success(`${course} Structure Confirmed & Saved!`);
  };

  const FieldRow = ({ num, title, subtitle, field, isText }: { num: number, title: string, subtitle: string, field: keyof typeof config, isText: boolean }) => (
    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, border: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      {/* Left icon & labels */}
      <div style={{ display: 'flex', gap: 16, width: 300, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {num}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#0f172a', marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{subtitle}</div>
        </div>
      </div>

      {/* Right inputs */}
      <div style={{ flex: '1 1 300px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isText ? (
            <>
              <input 
                type="text" 
                value={(config[field] as any).desc} 
                onChange={(e) => handleUpdate(field, 'desc', e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, background: '#f8fafc', color: '#334155', fontWeight: 500 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>WORDS</span>
                <input 
                  type="text" 
                  placeholder="e.g. 500" 
                  value={(config[field] as any).words} 
                  onChange={(e) => handleUpdate(field, 'words', e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: '1px dashed #cbd5e1', outline: 'none', fontSize: 14, background: 'transparent', color: '#334155' }}
                />
              </div>
            </>
          ) : (
            <input 
              type="number" 
              value={(config[field] as any).count} 
              onChange={(e) => handleUpdate(field, 'count', e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, background: '#f8fafc', color: '#334155', fontWeight: 500 }}
            />
          )}
        </div>
        <select 
          value={(config[field] as any).type}
          disabled
          style={{ width: 220, padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, background: '#fff', color: '#0f172a', fontWeight: 600, cursor: 'not-allowed', appearance: 'none' }}
        >
          <option>{(config[field] as any).type}</option>
        </select>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', borderRadius: 24, padding: 40, border: '1px solid #e2e8f0' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>LMS Notes Structure</h2>
        <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>Configure the output generation template for {course}</p>
      </div>

      <FieldRow num={1} title="Introduction" subtitle="Mention how it has to be" field="introduction" isText={true} />
      <FieldRow num={2} title="Detailed Notes" subtitle="Mention how it has to be / approx words" field="detailed" isText={true} />
      <FieldRow num={3} title="Summary" subtitle="Mention how it has to be" field="summary" isText={true} />
      
      <FieldRow num={4} title="10 Marks Question" subtitle="Select No" field="q10" isText={false} />
      <FieldRow num={5} title="5 Marks Question" subtitle="Select No" field="q5" isText={false} />
      <FieldRow num={6} title="3 Marks Reasoning Question" subtitle="Select No" field="q3" isText={false} />
      <FieldRow num={7} title="2 Marks Case-based MCQs" subtitle="Select No" field="q2" isText={false} />
      <FieldRow num={8} title="1 Mark MCQs Question" subtitle="Select No" field="q1" isText={false} />
      <FieldRow num={9} title="Flashcards" subtitle="Number of flashcards" field="flashcards" isText={false} />

      <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={handleConfirm}
          style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 999, padding: '16px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)', transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Confirm Structure
        </button>
      </div>
    </div>
  );
}
