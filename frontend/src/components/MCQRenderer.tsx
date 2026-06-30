// React component
import React, { useState } from 'react';

function parseMCQText(text: string) {
  if (!text) return [];
  // Split by "1. ", "2. ", "**1. ", etc.
  const blocks = text.split(/(?=(?:^|\n)\s*\*?\*?\b\d+\.[\s*]+)/).map(t => t.trim()).filter(Boolean);

  return blocks.map(block => {
    // Extract everything up to "a)" or "A." or "a." or "* a)"
    const questionMatch = block.match(/^([\s\S]*?)(?=(?:^|\n)\s*[-*]?\s*\(?[aA][).\s])/i);
    let question = questionMatch ? questionMatch[1].trim() : block;
    question = question.replace(/^[\s*]*\d+\.[\s*]+/, '');

    const getOption = (letter: string, nextLetter: string) => {
      // Matches a), A., * a), (a), etc.
      const regexStr = '(?:^|\n)\s*[-*]?\s*\(?' + letter + '[).]\s+([\s\S]*?)(?=(?:^|\n)\s*[-*]?\s*\(?' + nextLetter + '[).\s]|(?:^|\n)\s*\*?\*?Answer:|$)';
      const regex = new RegExp(regexStr, 'i');
      return block.match(regex)?.[1]?.trim() || '';
    };

    const optA = getOption('a', 'b');
    const optB = getOption('b', 'c');
    const optC = getOption('c', 'd');
    const optD = getOption('d', 'Answer:');

    // Answer: C or Answer: c) or **Answer:** C
    const answerMatch = block.match(/(?:^|\n)\s*\*?\*?Answer:\s*\*?\*?\s*([a-d])/i);
    const correctLetter = answerMatch?.[1]?.toLowerCase() || '';

    const reasonMatch = block.match(/(?:^|\n)\s*\*?\*?Reason:\s*\*?\*?\s*([\s\S]*)/i);
    const reason = reasonMatch?.[1]?.trim() || '';

    return { 
      question, 
      options: { a: optA, b: optB, c: optC, d: optD }, 
      correctLetter, 
      answerText: '', 
      reason 
    };
  }).filter(q => q.options.a && q.options.b); // Ensure it's a valid parsed question
}

export default function MCQRenderer({ text }: { text: string }) {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  
  if (!text) return <p>No MCQs available.</p>;

  const questions = parseMCQText(text);

  if (questions.length === 0) {
    // If no valid questions were parsed, fallback to markdown rendering or plain text
    return <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{text}</div>;
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

