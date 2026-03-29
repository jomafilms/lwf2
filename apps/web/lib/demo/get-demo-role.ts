import { cookies } from 'next/headers';

export type DemoRole = 'homeowner' | 'landscaper' | 'nursery_admin' | 'hoa_admin' | 'city_admin' | 'not_signed_in';

export async function getDemoRole(): Promise<DemoRole | null> {
  // Only work in demo mode
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return null;
  }

  const cookieStore = await cookies();
  const demoRole = cookieStore.get('demo-role');
  
  if (demoRole && isValidDemoRole(demoRole.value)) {
    return demoRole.value as DemoRole;
  }

  return null;
}

function isValidDemoRole(role: string): boolean {
  const validRoles: DemoRole[] = [
    'homeowner',
    'landscaper', 
    'nursery_admin',
    'hoa_admin',
    'city_admin',
    'not_signed_in'
  ];
  return validRoles.includes(role as DemoRole);
}