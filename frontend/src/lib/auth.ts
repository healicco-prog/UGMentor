// Re-export auth types and helpers for frontend use
export type SubscriptionTier = 'basic' | 'standard' | 'premium';
export type UserRole = 'superadmin' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: SubscriptionTier;
  avatar?: string;
  createdAt: string;
}

export const SUPER_ADMIN = {
  email: 'drnarayanak@gmail.com',
  password: 'Tata@#viDhya#2026',
  user: {
    id: 'superadmin-001',
    email: 'drnarayanak@gmail.com',
    name: 'Dr. Narayana K',
    role: 'superadmin' as UserRole,
    tier: 'premium' as SubscriptionTier,
    avatar: '',
    createdAt: '2026-01-01',
  }
};

export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  basic: ['Dashboard (Learning)', 'LMS Notes'],
  standard: ['Dashboard (Learning)', 'LMS Notes', 'Learning Hub', 'Task Builder'],
  premium: ['Dashboard (Learning)', 'LMS Notes', 'Learning Hub', 'Task Builder', 'Assessment Center', 'Portfolio (E-Portfolio)'],
};

export function canAccess(tier: SubscriptionTier, module: string): boolean {
  const access: Record<string, SubscriptionTier[]> = {
    dashboard: ['basic', 'standard', 'premium'],
    lms_notes: ['basic', 'standard', 'premium'],
    learning_ms: ['standard', 'premium'],
    clinmaster_hub: ['standard', 'premium'],
    proskill_hub: ['standard', 'premium'],
    assignment_ms: ['standard', 'premium'],
    research_hub: ['premium'],
    assessment_ms: ['premium'],
    portfolio: ['premium'],
  };
  return access[module]?.includes(tier) ?? false;
}

const USER_KEY = 'ugmentor_user';
export const saveUser = (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const loadUser = (): User | null => { try { const r = localStorage.getItem(USER_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
export const clearUser = () => localStorage.removeItem(USER_KEY);

export const DEMO_USERS = [
  { password: 'ugmentor123', user: { id: 'user-basic-001', email: 'basic@ugmentor.in', name: 'Ananya Sharma', role: 'student' as UserRole, tier: 'basic' as SubscriptionTier, createdAt: '2026-03-01' } },
  { password: 'ugmentor123', user: { id: 'user-std-001', email: 'standard@ugmentor.in', name: 'Rohan Verma', role: 'student' as UserRole, tier: 'standard' as SubscriptionTier, createdAt: '2026-02-15' } },
  { password: 'ugmentor123', user: { id: 'user-prem-001', email: 'premium@ugmentor.in', name: 'Kavitha Rao', role: 'student' as UserRole, tier: 'premium' as SubscriptionTier, createdAt: '2026-01-20' } },
  { password: 'User@2025', user: { id: 'user-test-basic', email: 'narayanakdr@yahoo.co.in', name: 'Narayana KDR', role: 'student' as UserRole, tier: 'basic' as SubscriptionTier, createdAt: '2026-06-30' } },
  { password: 'User@2026', user: { id: 'user-test-std', email: 'aimsrcpharmac@gmail.com', name: 'AIMSRC Pharmac', role: 'student' as UserRole, tier: 'standard' as SubscriptionTier, createdAt: '2026-06-30' } },
  { password: 'User@2026', user: { id: 'user-test-prem', email: 'drnarayanabjp@gmail.com', name: 'Dr. Narayana BJP', role: 'student' as UserRole, tier: 'premium' as SubscriptionTier, createdAt: '2026-06-30' } }
];
