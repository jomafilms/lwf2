'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/store';
import { TreePine, Flame, MessageSquare, X, Maximize2 } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { ChatPanel } from '@/components/agent/ChatPanel';

export function SiteNav() {
  const { count } = useCart();
  const [chatOpen, setChatOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setChatOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [chatOpen]);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <Flame className="h-5 w-5 text-orange-500" />
          LWF
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/plants" className="text-gray-600 hover:text-gray-900 transition-colors">
            Plants
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
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setChatOpen((v) => !v)}
              className={`transition-colors ${chatOpen ? 'text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
              title="Plant Advisor"
            >
              <MessageSquare className="h-5 w-5" />
            </button>

            {chatOpen && (
              <div className="absolute right-0 top-full mt-2 w-[380px] h-[480px] rounded-xl border border-gray-200 bg-white shadow-xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-700">Plant Advisor</span>
                  <div className="flex items-center gap-1">
                    <Link
                      href="/dashboard/chat"
                      onClick={() => setChatOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Open full page"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => setChatOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <ChatPanel className="flex-1 min-h-0" />
              </div>
            )}
          </div>
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
