'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  'All',
  'Competency Passport',
  'Clinical Skills Passport',
  'Case Presentations',
  'SDL Portfolio',
  'Reflective Learning',
  'AETCOM Portfolio',
  'Family Adoption Programme',
  'Community Activities',
  'Research & Publications',
  'Seminars & Journal Clubs',
  'Procedure Logbook',
  'Assessments & Analytics',
  'AI Tutor Portfolio',
  'Career Readiness',
  'Mentorship & Wellness',
  'Achievements & Badges',
  'E-Portfolio Report'
];

const POSTS = [
  {
    id: 1,
    title: 'The Future of AI in Medical Education',
    category: 'AI Tutor Portfolio',
    date: 'Jun 18, 2026',
    excerpt: 'Exploring how artificial intelligence is reshaping the way medical students learn and practice clinical reasoning.',
    readTime: '5 min read'
  },
  {
    id: 2,
    title: 'Navigating Ethics in Clinical Practice',
    category: 'AETCOM Portfolio',
    date: 'Jun 15, 2026',
    excerpt: 'A deep dive into the ethical considerations and communication skills necessary for modern clinical training.',
    readTime: '7 min read'
  },
  {
    id: 3,
    title: 'Taking Charge of Your Learning Journey',
    category: 'SDL Portfolio',
    date: 'Jun 10, 2026',
    excerpt: 'How self-directed learning modules are helping students adapt to the vast syllabus and retain key concepts.',
    readTime: '6 min read'
  },
  {
    id: 4,
    title: 'From Classroom to Clinic: Bridging the Gap',
    category: 'Career Readiness',
    date: 'Jun 5, 2026',
    excerpt: 'Strategies for seamlessly transitioning from preclinical years straight into an active clinical setting.',
    readTime: '4 min read'
  }
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = activeCategory === 'All' 
    ? POSTS 
    : POSTS.filter(p => p.category === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Header / Home Button */}
      <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Link href="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 16px',
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border)',
          borderRadius: '30px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
        >
          <span style={{ fontSize: '16px' }}>🏠</span> Return to Home
        </Link>
      </div>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
          fontWeight: 900, 
          fontFamily: 'var(--font-outfit)', 
          color: '#5EEAD4', 
          textShadow: '0 0 40px rgba(94, 234, 212, 0.4)',
          marginBottom: '24px',
          lineHeight: 1.1,
          letterSpacing: '-1px'
        }}>
          The Pulse of UGMentor
        </h1>
        <p style={{ 
          fontSize: '1.15rem', 
          color: 'var(--text-secondary)', 
          lineHeight: 1.6,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Dive into the architecture of modern medical learning. Exploring AI, cognitive science, and the future of healthcare education.
        </p>
      </div>

      {/* Categories */}
      <div style={{ padding: '0 20px', marginBottom: '60px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1.5px', marginRight: '8px' }}>
            CATEGORY:
          </span>
          {CATEGORIES.map(c => (
            <button 
              key={c}
              onClick={() => setActiveCategory(c)}
              style={{
                padding: '10px 20px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: 600,
                background: activeCategory === c ? 'rgba(94, 234, 212, 0.15)' : 'transparent',
                color: activeCategory === c ? '#5EEAD4' : 'var(--text-secondary)',
                border: `1px solid ${activeCategory === c ? 'rgba(94, 234, 212, 0.4)' : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== c) {
                  e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.3)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== c) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div style={{ 
        flex: 1, 
        padding: '0 40px 80px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {filteredPosts.map(post => (
          <div key={post.id} className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
            e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
          >
            <div style={{ marginBottom: '20px' }}>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#5EEAD4', 
                background: 'rgba(94, 234, 212, 0.1)', 
                padding: '6px 12px', 
                borderRadius: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {post.category}
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {post.title}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, marginBottom: '24px' }}>
              {post.excerpt}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>No posts found in this category</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Check back later for new content.</div>
          </div>
        )}
      </div>
    </div>
  );
}
