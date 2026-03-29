'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart/store';
import { TreePine, Flame } from 'lucide-react';
import { UserMenu } from './UserMenu';

export function SiteNav() {
  const { count } = useCart();

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <Flame className="h-5 w-5 text-orange-500" />
          FireScape
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/plants" className="text-gray-600 hover:text-gray-900 transition-colors">
            Plants
          </Link>
          <Link href="/map" className="text-gray-600 hover:text-gray-900 transition-colors">
            Map
          </Link>
          <Link
            href="/my-plants"
            className="relative inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <TreePine className="h-4 w-4" />
            My Plants
            {count > 0 && (
              <span className="absolute -top-1.5 -right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
