// React component
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'superadmin') navigate('/contrl-panl');
      else navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) setError(result.error || 'Invalid credentials.');
  };

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Bg glow */}
      <div style={{ position: 'absolute', width: 500, height: 500, top: '-100px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="animate-fadeIn" style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="UGMentor Logo" width="48" height="48" style={{ objectFit: 'contain', backgroundColor: 'white', padding: '6px', borderRadius: '8px' }} />
            <span style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>UGMentor</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>AI Learning Platform for Medical Students</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '36px'
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, fontFamily: 'Outfit' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Sign in to continue your learning journey</p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px',
              color: 'var(--danger)', fontSize: 14, marginBottom: 20
            }}>âš ï¸ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                id="login-email"
                className="input-field"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="input-field"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16
                  }}
                >{showPwd ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 8 }}
            >
              {submitting ? <><span className="spinner" />Signing in…</> : 'Sign In →'}
            </button>
          </form>


        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Don&apos;t have an account? <Link to="/login" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Contact us to enroll</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          Admin? <Link to="/contrl-panl" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Control Panel</Link>
        </p>
      </div>
    </div>
  );
}




