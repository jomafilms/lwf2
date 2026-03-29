'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemoRole } from '@/lib/demo/use-demo-role';
import {
  Home,
  ListChecks,
  Star,
  MessageSquare,
  Settings,
  Package,
  Users,
  FileText,
  Send,
  TreePine,
  BarChart3,
  Download,
  ShieldCheck,
  Mail,
  ChevronLeft,
  Menu,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles: string[];
}

const navItems: NavItem[] = [
  // All users
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['all'] },
  { href: '/dashboard/lists', label: 'My Lists', icon: ListChecks, roles: ['all'] },
  { href: '/dashboard/starred', label: 'Starred Lists', icon: Star, roles: ['all'] },
  { href: '/dashboard/chat', label: 'Chat Assistant', icon: MessageSquare, roles: ['all'] },
  { href: '/dashboard/preferences', label: 'My Preferences', icon: Settings, roles: ['all'] },
  { href: '/dashboard/orders', label: 'My Orders', icon: Package, roles: ['all'] },
  
  // Landscaper
  { href: '/dashboard/landscaper', label: 'Clients', icon: Users, roles: ['landscaper'] },
  { href: '/dashboard/plans', label: 'Plans', icon: FileText, roles: ['landscaper'] },
  { href: '/dashboard/submissions', label: 'Submissions', icon: Send, roles: ['landscaper'] },
  
  // Nursery Admin
  { href: '/dashboard/nursery', label: 'Inventory', icon: TreePine, roles: ['nursery_admin'] },
  { href: '/dashboard/nursery/demand', label: 'Demand Signals', icon: BarChart3, roles: ['nursery_admin'] },
  { href: '/dashboard/nursery/profile', label: 'Profile', icon: Settings, roles: ['nursery_admin'] },
  
  // HOA Admin
  { href: '/dashboard/hoa', label: 'Members', icon: Users, roles: ['hoa_admin'] },
  { href: '/dashboard/hoa/readiness', label: 'Fire Readiness', icon: ShieldCheck, roles: ['hoa_admin'] },
  { href: '/dashboard/hoa/invites', label: 'Invites', icon: Mail, roles: ['hoa_admin'] },
  
  // City Admin
  { href: '/dashboard/city', label: 'Analytics', icon: BarChart3, roles: ['city_admin'] },
  { href: '/dashboard/city/export', label: 'Export Data', icon: Download, roles: ['city_admin'] },
];

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { demoRole } = useDemoRole();
  
  // Determine effective role (demo role or fallback to homeowner)
  const effectiveRole = demoRole || 'homeowner';
  
  // Filter nav items based on role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(effectiveRole)
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`h-5 w-5 text-gray-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${active 
                  ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role indicator at bottom */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Current role: <span className="font-medium">{effectiveRole.replace('_', ' ')}</span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`
        lg:hidden fixed top-0 left-0 z-50 h-full bg-white shadow-xl transform transition-transform
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="w-64 h-full flex flex-col">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`
        hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <SidebarContent />
      </div>
    </>
  );
}