import React from 'react';

export default function AdminHome() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', color: '#0f172a' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Dashboard Overview</h1>
        <p style={{ color: '#64748b', fontSize: 16 }}>Welcome to the Super Admin Control Panel</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
        {/* Metric 1 */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              👥
            </div>
            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>+12%</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>12,450</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Total Users</div>
        </div>

        {/* Metric 2 */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              ⚡
            </div>
            <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>+5%</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>8,234</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Generations Today</div>
        </div>

        {/* Metric 3 */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🪙
            </div>
            <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>-2%</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>45.2M</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Active Tokens</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#22c55e' }}></div>
            <span style={{ border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>All Systems Go</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>99.9%</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>System Health</div>
        </div>
      </div>
    </div>
  );
}
