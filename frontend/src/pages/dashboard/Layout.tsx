// React component
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { canAccess, SubscriptionTier } from '@/lib/auth';
import { LogOut } from 'lucide-react';
import styles from './layout.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  module?: string;
  children?: { id: string; label: string; icon: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard', module: 'dashboard' },
  { id: 'lms_notes', label: 'LMS Notes', icon: '📚', href: '/dashboard/lms-notes', module: 'lms_notes' },
  { id: 'ai_mentor', label: 'AI MentorPro', icon: '🤖', href: '/dashboard/learning/ai-mentor', module: 'learning_ms' },
  {
    id: 'learning_ms', label: 'Learning Hub', icon: '🧠', module: 'learning_ms',
    children: [
      { id: 'notes_creator', label: 'Notes Creator', icon: '📝', href: '/dashboard/learning/notes-creator' },
      { id: 'vocabulary', label: 'Vocabulary', icon: '📖', href: '/dashboard/learning/vocabulary' },
      { id: 'mnemonic_gen', label: 'Mnemonic Generator', icon: '🧠', href: '/dashboard/learning/mnemonic-generator' },
      { id: 'essay_gen', label: 'Essay Qs Generator', icon: '✍️', href: '/dashboard/learning/essay-generator' },
      { id: 'mcq_gen', label: 'MCQs Generator', icon: '🎯', href: '/dashboard/learning/mcq-generator' },
    ]
  },
  {
    id: 'clinmaster_hub', label: 'ClinMaster Hub', icon: '🩺', module: 'clinmaster_hub',
    children: [
      { id: 'case_simulator', label: 'Clinical Case Simulator', icon: '🏥', href: '/dashboard/clinmaster/case-simulator' },
      { id: 'bedside_companion', label: 'Bedside Learning Companion', icon: '📋', href: '/dashboard/clinmaster/bedside-companion' },
      { id: 'clinical_reasoning', label: 'Clinical Reasoning Tools', icon: '🧩', href: '/dashboard/clinmaster/clinical-reasoning' },
      { id: 'interpretation_lab', label: 'Interpretation Lab', icon: '🔬', href: '/dashboard/clinmaster/interpretation-lab' },
      { id: 'drug_calculations', label: 'Drug Calculations', icon: '💊', href: '/dashboard/clinmaster/drug-calculations' },
      { id: 'patient_education', label: 'Patient Education', icon: '👨‍⚕️', href: '/dashboard/clinmaster/patient-education' },
    ]
  },
  {
    id: 'proskill_hub', label: 'ProSkill Hub', icon: '⚡', module: 'proskill_hub',
    children: [
      { id: 'comm_trainer', label: 'Communication Trainer', icon: '🗣️', href: '/dashboard/proskill/communication-trainer' },
      { id: 'aetcom_skills', label: 'AETCOM Skills', icon: '🤝', href: '/dashboard/proskill/aetcom-skills' },
    ]
  },
  {
    id: 'assignment_ms', label: 'Task Builder', icon: '📋', module: 'assignment_ms',
    children: [
      { id: 'reflection', label: 'Reflection Generator', icon: '💭', href: '/dashboard/assignment/reflection' },
      { id: 'seminar', label: 'Seminar Builder', icon: '🎤', href: '/dashboard/assignment/seminar' },
      { id: 'case_pres', label: 'Case Presentations', icon: '🏥', href: '/dashboard/assignment/case-presentations' },
      { id: 'lit_review', label: 'Literature Review', icon: '📰', href: '/dashboard/assignment/literature-review' },
      { id: 'topic_summary', label: 'Topic Summary', icon: '📑', href: '/dashboard/assignment/topic-summary' },
    ]
  },
  {
    id: 'research_hub', label: 'Research Hub', icon: '🔬', module: 'research_hub',
    children: [
      { id: 'research_assistant', label: 'Research Assistant', icon: '🔎', href: '/dashboard/research/research-assistant' },
      { id: 'statistics_assistant', label: 'Statistics Assistant', icon: '📈', href: '/dashboard/research/statistics-assistant' },
      { id: 'scientific_writing', label: 'Scientific Writing', icon: '✍️', href: '/dashboard/research/scientific-writing' },
    ]
  },
  {
    id: 'assessment_ms', label: 'Assessment Center', icon: '🎓', module: 'assessment_ms',
    children: [
      { id: 'essay_q', label: 'Essay Question', icon: '📄', href: '/dashboard/assessment/essay-question' },
      { id: 'mcq_q', label: 'MCQ Question', icon: '✅', href: '/dashboard/assessment/mcq-question' },
      { id: 'viva_sim', label: 'Viva Simulator', icon: '🎙️', href: '/dashboard/assessment/viva-simulator' },
    ]
  },
  { id: 'portfolio', label: 'Portfolio (E-Portfolio)', icon: '🗂️', href: '/dashboard/portfolio', module: 'portfolio' },
];

export default function DashboardLayout() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate('/login', { replace: true });
    if (!isLoading && user?.role === 'superadmin') navigate('/contrl-panl', { replace: true });
  }, [user, isLoading, navigate]);

  useEffect(() => {
    NAV_ITEMS.forEach(item => {
      if (item.children?.some(c => pathname.startsWith(c.href))) {
        setExpanded(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
      }
    });
  }, [pathname]);

  const toggleExpand = (id: string) => setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const isActive = (href?: string) => href && pathname === href;
  const isChildActive = (item: NavItem) => item.children?.some(c => pathname.startsWith(c.href));
  const tier = user?.tier as SubscriptionTier;
  const hasAccess = (module?: string) => !module || !user || user.role === 'superadmin' || canAccess(tier, module);

  if (isLoading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const tierColors: Record<SubscriptionTier, string> = { basic: '#0EA5E9', standard: '#6C3BFF', premium: '#F59E0B' };

  return (
    <div className={styles.layout}>
      {mobileOpen && <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />}

      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${mobileOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="UGMentor Logo" width="36" height="36" style={{ objectFit: 'contain', flexShrink: 0, backgroundColor: 'white', padding: '4px', borderRadius: '6px' }} />
            {!collapsed && (
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>UGMentor</div>
            )}
          </Link>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {!collapsed && (
          <div className={styles.tierBadge} style={{ borderColor: tierColors[tier] || '#6C3BFF', color: tierColors[tier] || '#6C3BFF' }}>
            ⚡ {tier?.charAt(0).toUpperCase() + tier?.slice(1)} Plan
          </div>
        )}

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => {
            const accessible = hasAccess(item.module);
            const active = isActive(item.href) || isChildActive(item);
            const isExpanded = expanded.includes(item.id);
            return (
              <div key={item.id} className={styles.navGroup}>
                {item.children ? (
                  <button
                    className={`${styles.navItem} ${active ? styles.navItemActive : ''} ${!accessible ? styles.navItemLocked : ''}`}
                    onClick={() => accessible ? toggleExpand(item.id) : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={styles.navIcon}>{accessible ? item.icon : '🔒'}</span>
                    {!collapsed && (
                      <>
                        <span className={styles.navLabel}>{item.label}</span>
                        <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>›</span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to={accessible ? (item.href || '#') : '#'}
                    className={`${styles.navItem} ${active ? styles.navItemActive : ''} ${!accessible ? styles.navItemLocked : ''}`}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className={styles.navIcon}>{accessible ? item.icon : '🔒'}</span>
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  </Link>
                )}
                {item.children && !collapsed && isExpanded && accessible && (
                  <div className={styles.navChildren}>
                    {item.children.map(child => (
                      <Link
                        key={child.id}
                        to={child.href}
                        className={`${styles.navChild} ${isActive(child.href) ? styles.navChildActive : ''}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span>{child.icon}</span>
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {!accessible && !collapsed && <div className={styles.lockedHint}>Upgrade to unlock</div>}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
              </div>
            )}
          </div>
          <button onClick={logout} className={styles.logoutBtn} title="Sign Out"><LogOut size={18} /></button>
        </div>
      </aside>

      <div className={`${styles.main} ${collapsed ? styles.mainExpanded : ''}`}>
        <header className={styles.header}>
          <button className={styles.mobileMenuBtn} onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
          <div className={styles.headerTitle}>
            {NAV_ITEMS.flatMap(i => [i, ...(i.children || [])]).find(i => i.href && (pathname === i.href || pathname.startsWith(i.href + '/')))?.label || 'Dashboard'}
          </div>
          <div className={styles.headerRight}>
            <Link to="/dashboard" className={styles.headerLink}>Back to Dashboard</Link>
            <div className={styles.headerDivider}>|</div>
            <Link to="/" className={styles.headerLink}>Back to Home</Link>
            <div className={styles.headerDivider}>|</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>www.ugmentor.in</div>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
