'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DEMO_USERS, TIER_PRICES } from '@/lib/auth';

type CPTab = 'dashboard' | 'users' | 'subscriptions' | 'content' | 'settings';

const StatCard = ({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color: string }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20,
    position: 'relative', overflow: 'hidden', transition: 'var(--transition)'
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
  </div>
);

export default function ControlPanel() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<CPTab>('dashboard');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'superadmin')) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  const tabs: { id: CPTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '💳' },
    { id: 'content', label: 'Content Management', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', position: 'fixed', top: 0, bottom: 0, left: 0, display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 8 }}>
            <img src="/logo.png" alt="UGMentor Logo" width="36" height="36" style={{ objectFit: 'contain', backgroundColor: 'white', padding: '4px', borderRadius: '6px' }} />
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>UGMentor</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Control Panel</div>
            </div>
          </Link>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: 11, color: 'var(--danger)', fontWeight: 700, textAlign: 'center' }}>
            🔴 SUPER ADMIN
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              border: 'none', background: tab === t.id ? 'rgba(108,59,255,0.15)' : 'transparent',
              cursor: 'pointer', color: tab === t.id ? 'var(--primary-light)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: tab === t.id ? 700 : 500, textAlign: 'left', transition: 'var(--transition)'
            }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--danger), #FF6B6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>SA</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. Narayana K</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Super Admin</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center' }}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        <header style={{ height: 64, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{tabs.find(t => t.id === tab)?.label}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              System Online
            </div>
            <Link href="/" className="btn btn-ghost btn-sm">← Main Site</Link>
          </div>
        </header>

        <div className="page-container" style={{ maxWidth: '100%' }}>
          {tab === 'dashboard' && (
            <div className="animate-fadeIn">
              <div style={{ marginBottom: 24 }}>
                <h2 className="font-outfit" style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Welcome, Dr. Narayana K 👋</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>UGMentor — Super Admin Control Panel • www.ugmentor.in/contrl-panl</p>
              </div>
              <div className="grid-4" style={{ marginBottom: 24 }}>
                <StatCard icon="👥" label="Total Users" value="1,247" sub="+23 this month" color="#6C3BFF" />
                <StatCard icon="💳" label="Active Subscriptions" value="892" sub="Basic: 312 | Std: 380 | Prem: 200" color="#0EA5E9" />
                <StatCard icon="💰" label="Monthly Revenue" value="₹2.4L" sub="+15% vs last month" color="#10B981" />
                <StatCard icon="📚" label="Notes Generated" value="18,430" sub="All time" color="#F59E0B" />
              </div>

              {/* Revenue breakdown */}
              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                  <div className="section-title" style={{ marginBottom: 20 }}>Subscription Distribution</div>
                  {([
                    { tier: 'Basic', count: 312, color: '#0EA5E9', pct: 35 },
                    { tier: 'Standard', count: 380, color: '#6C3BFF', pct: 43 },
                    { tier: 'Premium', count: 200, color: '#F59E0B', pct: 22 },
                  ]).map(item => (
                    <div key={item.tier} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{item.tier} — ₹{TIER_PRICES[item.tier.toLowerCase() as 'basic' | 'standard' | 'premium']}/mo</span>
                        <span style={{ color: item.color, fontWeight: 700 }}>{item.count} users ({item.pct}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div className="section-title" style={{ marginBottom: 20 }}>Recent User Signups</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { name: 'Ananya Sharma', tier: 'Standard', date: 'Today', email: 'ananya@email.com' },
                      { name: 'Rohan Verma', tier: 'Premium', date: 'Yesterday', email: 'rohan@email.com' },
                      { name: 'Kavitha Rao', tier: 'Basic', date: 'Jun 16', email: 'kavitha@email.com' },
                      { name: 'Suresh Menon', tier: 'Standard', date: 'Jun 15', email: 'suresh@email.com' },
                    ].map((u, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge badge-${u.tier === 'Premium' ? 'warning' : u.tier === 'Standard' ? 'primary' : 'secondary'}`} style={{ fontSize: 10 }}>{u.tier}</span>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{u.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input className="input-field" placeholder="🔍 Search users…" style={{ flex: 1 }} />
                <select className="input-field" style={{ width: 160 }}>
                  <option>All Tiers</option>
                  <option>Basic</option>
                  <option>Standard</option>
                  <option>Premium</option>
                </select>
                <button className="btn btn-primary">+ Add User</button>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th><th>Email</th><th>Role</th><th>Tier</th><th>Joined</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Dr. Narayana K', email: 'drnarayanak@gmail.com', role: 'Super Admin', tier: 'Premium', joined: '2026-01-01' },
                        ...DEMO_USERS.map(u => ({ name: u.name, email: u.email, role: 'Student', tier: u.tier.charAt(0).toUpperCase() + u.tier.slice(1), joined: u.createdAt })),
                        { name: 'Priya Nair', email: 'priya@email.com', role: 'Student', tier: 'Standard', joined: '2026-03-10' },
                        { name: 'Suresh Menon', email: 'suresh@email.com', role: 'Student', tier: 'Basic', joined: '2026-04-05' },
                      ].map((u, i) => (
                        <tr key={i}>
                          <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                              {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                          </div></td>
                          <td>{u.email}</td>
                          <td><span className={`badge ${u.role === 'Super Admin' ? 'badge-danger' : 'badge-secondary'}`} style={{ fontSize: 11 }}>{u.role}</span></td>
                          <td><span className={`badge ${u.tier === 'Premium' ? 'badge-warning' : u.tier === 'Standard' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: 11 }}>{u.tier}</span></td>
                          <td style={{ fontSize: 12 }}>{u.joined}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm">Edit</button>
                              {u.role !== 'Super Admin' && <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }}>Remove</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'subscriptions' && (
            <div className="animate-fadeIn">
              <div className="grid-3" style={{ marginBottom: 24 }}>
                {[
                  { tier: 'Basic', price: 100, users: 312, revenue: 31200, color: '#0EA5E9', features: ['Dashboard', 'LMS Notes'] },
                  { tier: 'Standard', price: 300, users: 380, revenue: 114000, color: '#6C3BFF', features: ['Basic + Learning Hub', 'Task Builder'] },
                  { tier: 'Premium', price: 500, users: 200, revenue: 100000, color: '#F59E0B', features: ['Standard + Assessment Center', 'E-Portfolio'] },
                ].map(plan => (
                  <div key={plan.tier} className="card" style={{ borderTop: `3px solid ${plan.color}` }}>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Outfit', color: plan.color, marginBottom: 4 }}>{plan.tier}</div>
                    <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Outfit', marginBottom: 16 }}>₹{plan.price}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/mo</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Active Users</span>
                      <strong>{plan.users}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Monthly Revenue</span>
                      <strong style={{ color: 'var(--success)' }}>₹{plan.revenue.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="divider" />
                    {plan.features.map(f => <div key={f} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0' }}>✓ {f}</div>)}
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>Edit Plan</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'content' && (
            <div className="animate-fadeIn">
              <div className="grid-2">
                {[
                  { icon: '📚', title: 'LMS Database', desc: 'Manage all study notes and LMS content', count: '2,340 notes', action: 'Manage' },
                  { icon: '🤖', title: 'AI Models Config', desc: 'Configure AI generation settings and models', count: 'Gemini 1.5', action: 'Configure' },
                  { icon: '📝', title: 'Question Bank', desc: 'Essay and MCQ question management', count: '850 questions', action: 'Manage' },
                  { icon: '📰', title: 'Blog Publications', desc: 'Publish medical education articles', count: '42 posts', action: 'Add Post' },
                ].map((item, i) => (
                  <div key={i} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                      <div style={{ fontSize: 32 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.count}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>{item.desc}</p>
                    <button className="btn btn-secondary btn-sm">{item.action}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="animate-fadeIn" style={{ maxWidth: 640 }}>
              <div className="card">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Platform Settings</h2>
                <div className="form-group">
                  <label className="label">Platform Name</label>
                  <input className="input-field" defaultValue="UGMentor" />
                </div>
                <div className="form-group">
                  <label className="label">Website URL</label>
                  <input className="input-field" defaultValue="www.ugmentor.in" />
                </div>
                <div className="form-group">
                  <label className="label">Control Panel URL</label>
                  <input className="input-field" defaultValue="www.ugmentor.in/contrl-panl" disabled />
                </div>
                <div className="form-group">
                  <label className="label">Support Email</label>
                  <input className="input-field" defaultValue="support@ugmentor.in" />
                </div>
                <div className="form-group">
                  <label className="label">Gemini API Key</label>
                  <input className="input-field" type="password" defaultValue="AIza••••••••••••••" />
                </div>
                <div className="divider" />
                <div className="form-group">
                  <label className="label">Super Admin Email</label>
                  <input className="input-field" defaultValue="drnarayanak@gmail.com" />
                </div>
                <button className="btn btn-primary">💾 Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
