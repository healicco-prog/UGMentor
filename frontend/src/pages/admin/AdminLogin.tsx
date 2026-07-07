import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const { login, isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  // If already logged in as superadmin, let the SuperAdminRoute handle rendering the children.
  // We don't need a Navigate here because SuperAdminRoute will render children if user is superadmin.
  // But just in case:
  if (user && user.role === 'superadmin') {
    // This shouldn't be reached if SuperAdminRoute works correctly, but safe fallback.
    return null;
  }
  
  if (user && user.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) setError(result.error || 'Invalid credentials.');
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', width: 600, height: 600, top: '-150px', left: '50%', transform: 'translateX(-50%)', background: '#16a34a', opacity: 0.05, filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="animate-fadeIn" style={{ width: '100%', maxWidth: 420, zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/logo.png" alt="UGMentor Logo" style={{ width: 48, height: 48, backgroundColor: 'transparent' }} />
            <span style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Control Panel</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Secure Super Admin Access Portal</p>
        </div>

        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 16, padding: '36px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'
        }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '12px 16px',
              color: '#FCA5A5', fontSize: 14, marginBottom: 24
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Admin Email</label>
              <input
                type="email"
                placeholder="admin@ugmentor.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', background: '#f8fafc',
                  border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a',
                  fontSize: 15, outline: 'none', transition: 'all 0.2s'
                }}
                autoComplete="email"
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Password</label>
              <input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', background: '#f8fafc',
                  border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a',
                  fontSize: 15, outline: 'none', transition: 'all 0.2s'
                }}
                autoComplete="current-password"
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '14px', background: '#16a34a', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Authenticating…' : 'Secure Login →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
