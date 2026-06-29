'use client';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function parseQuestions(text: string) {
  if (!text) return [];
  // Split by numbers like "1. ", "2. " at the start of lines or globally
  const blocks = text.split(/(?=(?:^|\n)\s*\d+\.\s+)/).map(t => t.trim()).filter(Boolean);
  
  if (blocks.length <= 1 && !text.match(/^\s*\d+\./)) {
    // If there's no numbering, just treat each paragraph as a question
    return text.split('\n\n').filter(Boolean);
  }
  
  return blocks.map(block => block.replace(/^\d+\.\s+/, '').trim());
}

interface QuestionRendererProps {
  text: string;
  course: string;
  subject: string;
  section: string;
  topic: string;
  marksType: string;
}

export default function QuestionRenderer({ text, course, subject, section, topic, marksType }: QuestionRendererProps) {
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [answerMap, setAnswerMap] = useState<Record<number, string>>({});

  if (!text) return <p style={{ color: 'var(--text-muted)' }}>No questions available.</p>;

  const questions = parseQuestions(text);

  if (questions.length === 0) {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
  }

  const handleGenerateAnswer = async (qIndex: number, questionText: string) => {
    setLoadingMap(prev => ({ ...prev, [qIndex]: true }));
    try {
      const res = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course,
          subject,
          section,
          topic,
          marksType,
          question: questionText
        })
      });
      const data = await res.json();
      if (data.answer) {
        setAnswerMap(prev => ({ ...prev, [qIndex]: data.answer }));
      } else {
        alert('Failed to generate answer: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error(error);
      alert('Error generating answer.');
    } finally {
      setLoadingMap(prev => ({ ...prev, [qIndex]: false }));
    }
  };

  const handlePrintPDF = (qIndex: number, questionText: string) => {
    const answer = answerMap[qIndex];
    if (!answer) return;

    // Open a new window and write printable HTML
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <html>
        <head>
          <title>${topic} - ${marksType}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1a1a1a; font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 24px; }
            .meta { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
            h2 { font-size: 18px; color: #4b5563; margin-top: 30px; }
            .answer { background: #f9fafb; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 20px; }
            .answer h1, .answer h2, .answer h3 { color: #1f2937; border: none; padding: 0; }
            .branding { margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .answer { border: none; background: transparent; padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${topic}</h1>
          <div class="meta">
            <strong>Course:</strong> ${course} <br/>
            <strong>Subject:</strong> ${subject} <br/>
            <strong>Category:</strong> ${marksType}
          </div>
          
          <h2>Question:</h2>
          <p style="font-size: 18px; font-weight: 600; color: #111;">${questionText}</p>
          
          <div class="answer">
            <div id="md-content"></div>
          </div>
          
          <div class="branding">Generated via UGMentor Learning Management System</div>
          
          <!-- Import marked to convert markdown to html in the print window -->
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <script>
            document.getElementById('md-content').innerHTML = marked.parse(${JSON.stringify(answer)});
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {questions.map((q, idx) => {
        const isLoading = loadingMap[idx];
        const answer = answerMap[idx];

        return (
          <div key={idx} style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <style>{`
              .md-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
              .md-th { border: 1px solid var(--border); padding: 10px 14px; background: var(--bg-surface); font-weight: 600; color: var(--text-primary); white-space: nowrap; }
              .md-td { border: 1px solid var(--border); padding: 10px 14px; vertical-align: top; min-width: 140px; }
              .md-pre { overflow-x: auto; -webkit-overflow-scrolling: touch; background: var(--bg-elevated); padding: 16px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px; line-height: 1.5; white-space: pre; margin-bottom: 16px; color: var(--text-primary); }
              @media (max-width: 768px) {
                .md-table { font-size: 12px; }
                .md-th, .md-td { padding: 8px 10px; min-width: 100px; }
                .md-pre { font-size: 11px; padding: 12px; }
              }
            `}</style>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ background: 'rgba(108,59,255,0.1)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>Q{idx + 1}</span>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
                {q}
              </p>
            </div>
            
            {!answer && (
              <button 
                onClick={() => handleGenerateAnswer(idx, q)}
                disabled={isLoading}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '8px', opacity: isLoading ? 0.7 : 1, transition: 'all 0.2s' }}
              >
                {isLoading ? '⏳ Generating AI Answer...' : '✨ Generate Answer'}
              </button>
            )}

            {answer && (
              <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s ease-in-out' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap' }}>AI Generated Answer</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button 
                      onClick={() => handleGenerateAnswer(idx, q)}
                      disabled={isLoading}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                    >
                      {isLoading ? 'Regenerating...' : '🔄 Regenerate'}
                    </button>
                    <button 
                      onClick={() => handlePrintPDF(idx, q)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '4px 12px', fontSize: '12px', background: '#000', borderColor: '#000', color: '#fff' }}
                    >
                      📄 Save PDF / Share
                    </button>
                  </div>
                </div>
                
                <div className="markdown-body" style={{ background: 'rgba(108,59,255,0.03)', padding: '20px', borderRadius: '8px', fontSize: '15px', color: 'var(--text-secondary)' }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => <div style={{ overflowX: 'auto', width: '100%', marginBottom: '16px' }}><table className="md-table" {...props} /></div>,
                      th: ({node, ...props}) => <th className="md-th" {...props} />,
                      td: ({node, ...props}) => <td className="md-td" {...props} />,
                      pre: ({node, ...props}) => <pre className="md-pre" {...props} />,
                      code: ({node, className, children, ...props}: any) => {
                        const isBlock = /language-(\w+)/.test(className || '') || String(children).includes('\n');
                        return isBlock ? (
                          <code style={{ fontFamily: 'monospace', background: 'transparent', padding: 0, color: 'inherit' }} {...props}>{children}</code>
                        ) : (
                          <code style={{ background: 'rgba(108,59,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px', color: 'var(--primary)' }} {...props}>{children}</code>
                        );
                      }
                    }}
                  >
                    {answer.replace(/<br\s*\/?>/gi, ' ')}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
