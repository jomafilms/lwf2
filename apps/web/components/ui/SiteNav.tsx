'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Flame, MessageSquare, Map, ListChecks, X, Maximize2, Search } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { ChatPanel } from '@/components/agent/ChatPanel';
import { PlantSlideOut } from '@/components/plants/PlantSlideOut';

export function SiteNav() {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  // Sync query when URL search param changes
  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('search', query.trim());
      } else {
        params.delete('search');
      }
      params.delete('page');
      // Always navigate to /plants with search
      if (!params.has('showAll')) {
        params.set('showAll', 'true');
      }
      router.push(`/plants?${params.toString()}`);
    },
    [query, router, searchParams]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('page');
    router.push(`/plants?${params.toString()}`);
  }, [router, searchParams]);

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
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 shrink-0">
          <Flame className="h-5 w-5 text-orange-500" />
          LWF
        </Link>

        {/* Search input */}
        <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plants..."
              className="w-full pl-8 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/plants" className="text-gray-600 hover:text-gray-900 transition-colors">
            Plants
          </Link>
          <Link href="/lists" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
            <ListChecks className="h-4 w-4" />
            Lists
          </Link>
          <Link href="/map" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
            <Map className="h-4 w-4" />
            Map
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
                <ChatPanel className="flex-1 min-h-0" onPlantClick={(id) => setSelectedPlantId(id)} />
              </div>
            )}
          </div>
          <UserMenu />
        </div>
      </div>
      <PlantSlideOut plantId={selectedPlantId} onClose={() => setSelectedPlantId(null)} />
    </nav>
  );
}
