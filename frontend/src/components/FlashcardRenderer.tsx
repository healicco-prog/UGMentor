// React component
import React, { useState } from 'react';

function parseFlashcards(text: string) {
  if (!text) return [];
  // Split by "1. Front:" or just "1. " if "Front:" is right after
  const blocks = text.split(/(?=\b\d+\.\s+Front:)/i).map(t => t.trim()).filter(Boolean);
  
  if (blocks.length <= 1 && !text.includes('Front:')) {
    return [];
  }

  return blocks.map(block => {
    const cleanBlock = block.replace(/^\d+\.\s+/, '');
    const frontMatch = cleanBlock.match(/Front:\s*([\s\S]*?)(?=Back:|$)/i);
    const backMatch = cleanBlock.match(/Back:\s*([\s\S]*)/i);
    
    return {
      front: frontMatch ? frontMatch[1].trim() : cleanBlock,
      back: backMatch ? backMatch[1].trim() : ''
    };
  }).filter(card => card.front && card.back);
}

const Flashcard = ({ front, back, index }: { front: string; back: string; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div 
      style={{ perspective: '1000px', width: '100%', height: '240px', cursor: 'pointer' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)', transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        {/* Front */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
          background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-elevated))',
          border: '1px solid var(--border)', borderRadius: '16px', padding: '24px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Card {index + 1}
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
            {front}
          </p>
          <div style={{ position: 'absolute', bottom: 12, fontSize: 11, color: 'var(--primary)', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Click to flip â†º
          </div>
        </div>
        
        {/* Back */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
          background: 'linear-gradient(145deg, rgba(108,59,255,0.03), rgba(108,59,255,0.08))',
          border: '1px solid rgba(108,59,255,0.2)', borderRadius: '16px', padding: '24px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', transform: 'rotateY(180deg)', boxShadow: '0 8px 24px rgba(108,59,255,0.08)'
        }}>
          <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Answer
          </div>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
            {back}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function FlashcardRenderer({ text }: { text: string }) {
  if (!text) return <p style={{ color: 'var(--text-muted)' }}>No flashcards available.</p>;

  let parsedCards: any[] = [];
  
  // First try JSON parse
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      parsedCards = parsed.map(c => ({ front: c.front || c.q || '', back: c.back || c.a || '' }));
    }
  } catch (e) {
    // If not JSON, use regex parsing
    parsedCards = parseFlashcards(text);
  }

  // If parsing failed to find cards, just render text
  if (parsedCards.length === 0) {
    return <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--text-secondary)' }}>{text}</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
      {parsedCards.map((card, idx) => (
        <Flashcard key={idx} front={card.front} back={card.back} index={idx} />
      ))}
    </div>
  );
}

