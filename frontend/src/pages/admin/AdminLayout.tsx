import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './admin-layout.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'lms_creator', label: 'LMS Auto-Gen', icon: '⚙️', href: '/contrl-panl/creator' },
  { id: 'blog_pubs', label: 'Blog Publications', icon: '📄', href: '/contrl-panl/blog' },
  { id: 'user_mgmt', label: 'User Management', icon: '👥', href: '/contrl-panl/users' },
  { id: 'token_econ', label: 'Token Economy', icon: '⚙️', href: '/contrl-panl/tokens' },
];

export default function AdminLayout() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isLoading || !user || user.role !== 'superadmin') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className={styles.layout}>
      {isSidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <img src="/logo.png" alt="UGMentor Logo" style={{ backgroundColor: 'transparent' }} />
          <span>UGMentor</span>
        </div>

        <div className={styles.userCard}>
          <div className={styles.userCardName}>{user.name} (Super)</div>
          <div className={styles.userCardEmail}>{user.email}</div>
          <div className={styles.badges}>
            <span className={styles.badgeSuper}>SUPER ADMIN</span>
            <span className={styles.badgeTier}>PREMIUM</span>
          </div>
        </div>


        <Link to="/" className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : ''}`} style={{ margin: '0 20px 24px' }}>
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navLabel}>Home Page</span>
        </Link>

        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>SUPER ADMIN</div>
          <nav className={styles.nav}>
            {NAV_ITEMS.map(item => (
              <Link
                key={item.id}
                to={item.href}
                className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <button onClick={logout} className={styles.logoutBtn}>
            <span style={{ fontSize: 18 }}>↪</span> Logout
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.mobileMenuBtn} onClick={() => setIsSidebarOpen(true)}>
              ☰
            </button>
            <div className={styles.headerTitleBlock}>
              <div className={styles.headerTitle}>
                Super Admin Dashboard
                <span className={styles.controlPanelBadge}>🛡️ Control Panel</span>
              </div>
              <div className={styles.headerSubtitle}>Platform running in superadmin mode</div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerUserInfo}>
              <div className={styles.headerUserName}>{user.name} (Super)</div>
              <div className={styles.headerUserEmail}>{user.email}</div>
              <div className={styles.badges} style={{ justifyContent: 'flex-end', marginTop: 4 }}>
                <span className={styles.badgeSuper}>SUPER ADMIN</span>
                <span className={styles.badgeTier}>PREMIUM</span>
              </div>
            </div>
            <div className={styles.headerUserIcon}>
              👥
            </div>
          </div>
        </header>
        
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
