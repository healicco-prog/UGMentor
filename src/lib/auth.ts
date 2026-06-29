// Auth types and utilities for UGMentor

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

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Hardcoded Super Admin credentials
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

export const TIER_PRICES = {
  basic: 100,
  standard: 300,
  premium: 500,
};

export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  basic: ['Dashboard (Learning)', 'LMS Notes'],
  standard: ['Dashboard (Learning)', 'LMS Notes', 'Learning Hub', 'Task Builder'],
  premium: ['Dashboard (Learning)', 'LMS Notes', 'Learning Hub', 'Task Builder', 'Assessment Center', 'Portfolio (E-Portfolio)'],
};

// Module access control
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

// Local storage helpers
const USER_KEY = 'ugmentor_user';

export function saveUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function loadUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
}

// Demo users for testing different tiers
export const DEMO_USERS: User[] = [
  { id: 'user-basic-001', email: 'basic@ugmentor.in', name: 'Ananya Sharma', role: 'student', tier: 'basic', createdAt: '2026-03-01' },
  { id: 'user-std-001', email: 'standard@ugmentor.in', name: 'Rohan Verma', role: 'student', tier: 'standard', createdAt: '2026-02-15' },
  { id: 'user-prem-001', email: 'premium@ugmentor.in', name: 'Kavitha Rao', role: 'student', tier: 'premium', createdAt: '2026-01-20' },
];
