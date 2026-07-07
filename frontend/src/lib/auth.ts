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

