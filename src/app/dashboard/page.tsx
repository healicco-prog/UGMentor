'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const StatCard = ({ icon, label, value, change, color }: { icon: string; label: string; value: string; change?: string; color: string }) => (
  <div className="stat-card" style={{ '--gradient': `linear-gradient(90deg, ${color}, ${color}88)` } as React.CSSProperties}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <div className="icon-wrap" style={{ background: `${color}20` }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      {change && <span className="badge badge-success" style={{ fontSize: 11 }}>{change}</span>}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
  </div>
);

const ProgressItem = ({ label, percent, color }: { label: string; percent: number; color: string }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 700, color }}>{percent}%</span>
    </div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
    </div>
  </div>
);

const recentActivities = [
  { icon: '📝', text: 'Completed Notes Creator – Pharmacology Chapter 3', time: '2h ago', type: 'notes' },
  { icon: '🎯', text: 'Practiced 20 MCQs on Anatomy', time: '4h ago', type: 'mcq' },
  { icon: '✍️', text: 'Essay generated: "Role of Kidney in Homeostasis"', time: '1d ago', type: 'essay' },
  { icon: '📖', text: '5 new vocabulary words learned in Biochemistry', time: '1d ago', type: 'vocab' },
  { icon: '📊', text: 'Assessment submitted: Physiology Essay Q', time: '2d ago', type: 'assessment' },
];

const upcomingTasks = [
  { icon: '📋', label: 'Complete Seminar on Cardiac Physiology', due: 'Tomorrow', priority: 'high' },
  { icon: '📄', label: 'Essay Question: Diabetes Pathophysiology', due: 'Jun 22', priority: 'medium' },
  { icon: '🔬', label: 'Case Presentation: Hepatitis B Patient', due: 'Jun 25', priority: 'low' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const tier = user?.tier || 'basic';

  const tierColors: Record<string, string> = { basic: '#0EA5E9', standard: '#6C3BFF', premium: '#F59E0B' };
  const tc = tierColors[tier];

  return (
    <div className="page-container">
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,59,255,0.12), rgba(14,165,233,0.08))',
        border: '1px solid rgba(108,59,255,0.2)', borderRadius: 'var(--radius-xl)',
        padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h1 className="font-outfit" style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            Good day, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Track your learning progress, explore your modules, and keep growing every day.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: tc, fontFamily: 'Outfit' }}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
            </div>
          </div>
          {tier !== 'premium' && (
            <Link href="/dashboard/upgrade" className="btn btn-primary btn-sm">Upgrade ✨</Link>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="📚" label="Notes Created" value="24" change="+3 this week" color="#6C3BFF" />
        <StatCard icon="📖" label="Words Learned" value="142" change="+12 today" color="#0EA5E9" />
        <StatCard icon="✍️" label="Essays Assessed" value="8" change="+1 new" color="#10B981" />
        <StatCard icon="🎯" label="MCQs Practiced" value="380" change="+45 today" color="#F59E0B" />
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Learning Progress */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Learning Progress</div>
              <div className="section-subtitle">Your performance across modules</div>
            </div>
          </div>
          <ProgressItem label="LMS Notes Completion" percent={72} color="#6C3BFF" />
          <ProgressItem label="Notes Creator Progress" percent={58} color="#0EA5E9" />
          <ProgressItem label="Vocabulary Mastery" percent={45} color="#10B981" />
          <ProgressItem label="Essay Assessment Score" percent={83} color="#F59E0B" />
          <ProgressItem label="MCQ Accuracy" percent={67} color="#EF4444" />
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Recent Activity</div>
              <div className="section-subtitle">Your last 5 actions</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivities.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recentActivities.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Upcoming Tasks */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Upcoming Tasks</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingTasks.map((t, i) => {
              const colors: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due: {t.due}</div>
                  </div>
                  <span className="badge" style={{ background: `${colors[t.priority]}20`, color: colors[t.priority], border: `1px solid ${colors[t.priority]}40`, fontSize: 10 }}>
                    {t.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Quick Access</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { icon: '📚', label: 'LMS Notes', href: '/dashboard/lms-notes', color: '#0EA5E9' },
              { icon: '🤖', label: 'AI MentorPro', href: '/dashboard/learning/ai-mentor', color: '#6C3BFF' },
              { icon: '✍️', label: 'Essay Generator', href: '/dashboard/learning/essay-generator', color: '#10B981' },
              { icon: '🎯', label: 'MCQ Practice', href: '/dashboard/learning/mcq-generator', color: '#F59E0B' },
              { icon: '📄', label: 'Essay Grader', href: '/dashboard/assessment/essay-question', color: '#EF4444' },
              { icon: '🗂️', label: 'Portfolio', href: '/dashboard/portfolio', color: '#8B5CF6' },
            ].map((item, i) => (
              <Link key={i} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                textDecoration: 'none', transition: 'var(--transition)'
              }}
                className="quick-link"
              >
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
