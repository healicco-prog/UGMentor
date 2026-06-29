// React component
import React, { useState } from 'react';

function parseMCQText(text: string) {
  if (!text) return [];
  // Split by "1. ", "2. " at the start of a block
  const blocks = text.split(/(?=\b\d+\.\s+)/).map(t => t.trim()).filter(Boolean);

  return blocks.map(block => {
    // Extract everything up to "a)"
    const questionMatch = block.match(/^([\s\S]*?)(?=a\))/i);
    let question = questionMatch ? questionMatch[1].trim() : block;
    question = question.replace(/^\d+\.\s+/, '');

    // Options
    const optA = block.match(/a\)\s*([\s\S]*?)(?=b\))/i)?.[1]?.trim() || '';
    const optB = block.match(/b\)\s*([\s\S]*?)(?=c\))/i)?.[1]?.trim() || '';
    const optC = block.match(/c\)\s*([\s\S]*?)(?=d\))/i)?.[1]?.trim() || '';
    const optD = block.match(/d\)\s*([\s\S]*?)(?=Answer:|$)/i)?.[1]?.trim() || '';

    // Answer and Reason
    const answerMatch = block.match(/Answer:\s*([a-d])\)?\s*([\s\S]*?)(?=Reason:|$)/i);
    const correctLetter = answerMatch?.[1]?.toLowerCase() || '';
    const answerText = answerMatch?.[2]?.trim() || '';

    const reasonMatch = block.match(/Reason:\s*([\s\S]*)/i);
    const reason = reasonMatch?.[1]?.trim() || '';

    return { 
      question, 
      options: { a: optA, b: optB, c: optC, d: optD }, 
      correctLetter, 
      answerText, 
      reason 
    };
  });
}

export default function MCQRenderer({ text }: { text: string }) {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  
  if (!text) return <p>No MCQs available.</p>;

  const questions = parseMCQText(text);

  if (questions.length === 0 || !questions[0].options.a) {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
  }

  const handleSelect = (qIndex: number, letter: string) => {
    if (selectedOptions[qIndex]) return; // prevent re-answering
    setSelectedOptions(prev => ({ ...prev, [qIndex]: letter }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {questions.map((q, idx) => {
        const selected = selectedOptions[idx];
        const isAnswered = !!selected;
        
        return (
          <div key={idx} style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.6 }}>
              {idx + 1}. {q.question}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(['a', 'b', 'c', 'd'] as const).map(letter => {
                if (!q.options[letter]) return null;
                
                const isSelected = selected === letter;
                const isCorrect = q.correctLetter === letter;
                
                let bgColor = 'var(--bg-base)';
                let borderColor = 'var(--border)';
                let color = 'var(--text-secondary)';
                
                if (isAnswered) {
                  if (isCorrect) {
                    bgColor = 'rgba(34, 197, 94, 0.1)';
                    borderColor = '#22c55e';
                    color = '#16a34a';
                  } else if (isSelected && !isCorrect) {
                    bgColor = 'rgba(239, 68, 68, 0.1)';
                    borderColor = '#ef4444';
                    color = '#dc2626';
                  }
                }

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelect(idx, letter)}
                    disabled={isAnswered}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      width: '100%', padding: '12px 16px', textAlign: 'left',
                      background: bgColor, border: `1px solid ${borderColor}`,
                      borderRadius: '8px', cursor: isAnswered ? 'default' : 'pointer',
                      transition: 'all 0.2s ease', color, fontSize: '14px'
                    }}
                  >
                    <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{letter}.</span>
                    <span>{q.options[letter]}</span>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Correct Answer: <span style={{ color: '#22c55e', textTransform: 'uppercase' }}>{q.correctLetter}</span>
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong>Reason:</strong> {q.reason}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

