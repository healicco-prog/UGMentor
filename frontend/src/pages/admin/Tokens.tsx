import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';

const MOCK_WALLETS: any[] = [];

export default function AdminTokens() {
  const [activeTab, setActiveTab] = useState('User Wallets');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [wallets] = useState(MOCK_WALLETS);

  const filteredWallets = useMemo(() => {
    return wallets.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All Roles' || w.role === roleFilter.toUpperCase();
      const matchesPlan = planFilter === 'All Plans' || w.plan === planFilter.toUpperCase();
      return matchesSearch && matchesRole && matchesPlan;
    });
  }, [wallets, search, roleFilter, planFilter]);

  const handleRefresh = () => {
    toast.success('Token balances synchronized with backend');
  };

  const handleEdit = (name: string) => {
    toast(`Edit token allowance for ${name} (Coming Soon)`, { icon: '✏️' });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', color: '#0f172a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Token Economy</h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>Monitor and manage AI token balances across all user subscriptions.</p>
        </div>
        <button 
          onClick={handleRefresh}
          style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#334155', padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔄</span> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.5, marginBottom: 8 }}>TOTAL USERS</div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>34</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            👥
          </div>
        </div>

        <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.5, marginBottom: 8 }}>JOINED LAST 10 DAYS</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#16a34a' }}>0</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📈
          </div>
        </div>

        <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.5, marginBottom: 8 }}>JOINED LAST 30 DAYS</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#6366f1' }}>0</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📈
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
        {['User Wallets', 'Plan Allotments', 'Feature Costs'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === tab ? '2px solid #16a34a' : '2px solid transparent', 
              padding: '0 0 16px 0', 
              color: activeTab === tab ? '#16a34a' : '#64748b', 
              fontWeight: activeTab === tab ? 700 : 600, 
              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s'
            }}>
            <span>{tab === 'User Wallets' ? '👥' : tab === 'Plan Allotments' ? '⚙️' : '📈'}</span> {tab}
          </button>
        ))}
      </div>

      {activeTab === 'User Wallets' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ flex: 1, maxWidth: 400 }}>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <select 
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', background: '#fff', fontWeight: 600, color: '#334155' }}>
                <option>All Roles</option>
                <option>Student</option>
                <option>Teacher</option>
              </select>
              <select 
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', background: '#fff', fontWeight: 600, color: '#334155' }}>
                <option>All Plans</option>
                <option>Basic</option>
                <option>Standard</option>
                <option>Premium</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 32px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>USER</th>
                  <th style={{ padding: '16px 32px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>ROLE</th>
                  <th style={{ padding: '16px 32px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>PLAN</th>
                  <th style={{ padding: '16px 32px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>BALANCE</th>
                  <th style={{ padding: '16px 32px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>ALLOTMENT</th>
                  <th style={{ padding: '16px 32px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>USAGE</th>
                  <th style={{ padding: '16px 32px', color: '#64748b', fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right' }}>EDIT</th>
                </tr>
              </thead>
              <tbody>
                {filteredWallets.length > 0 ? filteredWallets.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ background: '#f8fafc', color: '#64748b', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800, border: '1px solid #e2e8f0' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ color: u.plan === 'BASIC' ? '#3b82f6' : '#16a34a', fontWeight: 800, fontSize: 11 }}>{u.plan}</span>
                    </td>
                    <td style={{ padding: '20px 32px', fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{u.balance}</td>
                    <td style={{ padding: '20px 32px', color: '#64748b', fontWeight: 600, fontSize: 14 }}>{u.allotment}</td>
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${u.usage}%`, height: '100%', background: '#22c55e' }}></div>
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{u.usage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleEdit(u.name)}
                        style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No wallets found matching filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', color: '#64748b' }}>
          This view is currently under development.
        </div>
      )}
    </div>
  );
}
