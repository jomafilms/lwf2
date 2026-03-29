import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import {
  Home,
  TreePine,
  ListChecks,
  Settings,
  Shield,
} from 'lucide-react';

const roleBadgeColors: Record<string, string> = {
  homeowner: 'bg-green-100 text-green-800',
  landscaper: 'bg-blue-100 text-blue-800',
  nursery_admin: 'bg-purple-100 text-purple-800',
  city_admin: 'bg-amber-100 text-amber-800',
  platform_admin: 'bg-red-100 text-red-800',
};

const roleLabels: Record<string, string> = {
  homeowner: 'Homeowner',
  landscaper: 'Landscaper',
  nursery_admin: 'Nursery Admin',
  city_admin: 'City Admin',
  platform_admin: 'Platform Admin',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  // Default role — will come from user_profiles in a future iteration
  const role = 'homeowner';
  const badgeColor = roleBadgeColors[role] || roleBadgeColors.homeowner;
  const roleLabel = roleLabels[role] || 'Homeowner';

  const sections = [
    {
      href: '/dashboard',
      label: 'My Properties',
      description: 'Manage your properties and fire zones',
      icon: Home,
    },
    {
      href: '/my-plants',
      label: 'My Plants',
      description: 'Your saved plants and lists',
      icon: TreePine,
    },
    {
      href: '/dashboard',
      label: 'My Lists',
      description: 'Custom plant lists and shopping lists',
      icon: ListChecks,
    },
    {
      href: '/dashboard',
      label: 'Preferences',
      description: 'Notification and display settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to FireScape
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile header */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || ''}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
                {(user.name?.[0] || user.email[0]).toUpperCase()}
              </span>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span
                className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}
              >
                <Shield className="h-3 w-3" />
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.label}
              href={section.href}
              className="group rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <section.icon className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {section.label}
                </h2>
              </div>
              <p className="mt-1.5 text-sm text-gray-500">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
