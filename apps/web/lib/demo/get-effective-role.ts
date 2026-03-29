import { getCurrentUserRole } from '@/lib/user-role';
import { getDemoRole, type DemoRole } from './get-demo-role';

/**
 * Get the effective role for the current user, considering demo mode overrides
 */
export async function getEffectiveRole(): Promise<string> {
  // Check for demo role override first
  const demoRole = await getDemoRole();
  if (demoRole) {
    return demoRole;
  }

  // Fall back to actual user role
  const userRole = await getCurrentUserRole();
  return userRole || 'homeowner';
}