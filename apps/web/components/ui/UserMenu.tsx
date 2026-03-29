'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { useDemoRole } from '@/lib/demo/use-demo-role';
import {
  User,
  LayoutDashboard,
  TreePine,
  Home,
  Settings,
  LogOut,
  ChevronDown,
  Users,
  MessageCircle,
} from 'lucide-react';

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const { demoRole, isDemoMode } = useDemoRole();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isPending) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const user = session.user;
  const initial = (user.name?.[0] || user.email[0]).toUpperCase();

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  // Note: We can't fetch user role here since this is a client component
  // The menu will show all options and the server will handle authorization
  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/landscaper', label: 'Landscaper Tools', icon: Users },
    { href: '/dashboard/chat', label: 'Chat Assistant', icon: MessageCircle },
    { href: '/dashboard/conversations', label: 'Chat History', icon: MessageCircle },
    { href: '/my-plants', label: 'My Plants', icon: TreePine },
    { href: '/dashboard', label: 'My Properties', icon: Home },
    { href: '/dashboard', label: 'Settings', icon: Settings },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || ''}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-medium text-white">
            {initial}
          </span>
        )}
        {isDemoMode && demoRole && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-400 border border-white" />
        )}
        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {isDemoMode && demoRole && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                🎭 Demo: {demoRole.replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="h-4 w-4 text-gray-400" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
