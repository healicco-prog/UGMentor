// React component
import React, { useState } from 'react';

export default function ResearchAssistantPage() {
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [taskType, setTaskType] = useState('Research Question Generator');
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState('');

  const handleGenerate = async () => {
    if (!topic) return;
    setGenerating(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/generate-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'research_assistant', topic, details, taskType }),
      });
      const data = await response.json();
      if (data.error) alert('Error: ' + data.error);
      else setOutput(data.output);
    } catch (err) {
      alert('Failed to connect to the generation server.');
    } finally {
      setGenerating(false);
    }
  };

  const formatMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      let html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--primary); font-weight: 800;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<strong style="color: var(--primary); font-weight: 600;">$1</strong>')
        .replace(/^#### (.*)/g, '<h5 style="margin-top: 16px; margin-bottom: 8px; color: var(--primary); font-size: 15px; font-weight: 800;">$1</h5>')
        .replace(/^### (.*)/g, '<h4 style="margin-top: 20px; margin-bottom: 12px; color: var(--primary); font-size: 16px; font-weight: 800;">$1</h4>')
        .replace(/^## (.*)/g, '<h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--primary); font-size: 18px; border-bottom: 2px solid var(--border); padding-bottom: 8px;">$1</h3>')
        .replace(/^# (.*)/g, '<h2 style="margin-top: 16px; margin-bottom: 24px; color: var(--text-primary); font-size: 22px; font-weight: 800;">$1</h2>')
        .replace(/^---/g, '<hr style="margin: 24px 0; border: none; border-top: 1px solid #E2E8F0;" />');

      if (line.match(/^[-*]\s/)) {
        let listHtml = line.replace(/^[-*]\s(.*)/, '<li style="margin-left: 20px; margin-bottom: 6px; line-height: 1.6; padding-left: 4px;">$1</li>');
        listHtml = listHtml.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--primary); font-weight: 700;">$1</strong>');
        return <div key={i} dangerouslySetInnerHTML={{ __html: listHtml }} style={{ color: '#334155', fontSize: '15px' }} />;
      }
      
      if (line.trim() === '' || line.trim() === '#') return <div key={i} style={{ height: 12 }} />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: html }} style={{ lineHeight: 1.6, color: '#334155', fontSize: '15px' }} />;
    });
  };

  return (
    <div className="page-container" style={{ padding: 'clamp(16px, 3vw, 32px)', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 className="page-title font-outfit" style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: 'var(--primary)', fontWeight: 800 }}>🔎 Research Assistant</h1>
        <p className="page-desc" style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#64748B' }}>Generate novel research questions and build detailed protocols automatically.</p>
      </div>

      <div className="card" style={{ marginBottom: 32, width: '100%', padding: 'clamp(20px, 4vw, 32px)', borderRadius: 16, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="label" style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Task Type</label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Research Question Generator', 'Protocol Builder'].map(type => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: taskType === type ? '2px solid var(--primary)' : '1px solid #E2E8F0', borderRadius: 8, background: taskType === type ? '#F0F9FF' : '#fff', cursor: 'pointer', flex: '1 1 200px' }}>
                <input type="radio" name="taskType" value={type} checked={taskType === type} onChange={e => setTaskType(e.target.value)} style={{ accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: 14, fontWeight: taskType === type ? 700 : 500, color: taskType === type ? 'var(--primary)' : '#475569' }}>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="label">Research Topic</label>
          <input 
            className="input-field" 
            placeholder="e.g., Efficacy of Beta-Blockers in Heart Failure" 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
          />
        </div>

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="label">Specific Details (Optional)</label>
          <textarea 
            className="input-field" 
            placeholder="Provide context, target population, or specific focus areas..." 
            value={details} 
            onChange={e => setDetails(e.target.value)}
            style={{ minHeight: 100, resize: 'vertical' }}
          />
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }} 
          onClick={handleGenerate} 
          disabled={generating || !topic}
        >
          {generating ? <><span className="spinner" style={{ marginRight: 8 }} />Generating...</> : 'âœ¨ Generate Content'}
        </button>
      </div>

      {output && (
        <div className="card animate-fadeIn" style={{ borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
          <div className="print-hide" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit', margin: 0 }}>📋 Generated {taskType}</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }} onClick={() => navigator.clipboard.writeText(output)}>
                📋 Copy Text
              </button>
              <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }} onClick={() => window.print()}>
                ðŸ“¥ Save as PDF
              </button>
            </div>
          </div>
          <div style={{ padding: 'clamp(20px, 4vw, 40px)', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', overflowX: 'hidden' }}>
            <div className="print-only-title" style={{ display: 'none', marginBottom: 24, fontSize: 24, fontWeight: 800, color: '#0F172A', borderBottom: '2px solid var(--primary)', paddingBottom: 12 }}>{taskType}: {topic}</div>
            {formatMarkdown(output)}
          </div>
        </div>
      )}
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .card, .card * { visibility: visible; }
          .card { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; margin: 0; padding: 0; }
          .print-hide { display: none !important; }
          .print-only-title { display: block !important; }
        }
      `}</style>
    </div>
  );
}

