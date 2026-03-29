/**
 * Source Citation Component
 * 
 * Displays inline citation markers (footnote-style) for plant data sources.
 * Shows source details on hover/click with tooltip or expandable panel.
 */

'use client';

import { useState } from 'react';
import type { Source } from '@lwf/types';

export interface SourceCitationProps {
  sourceId: string | null;
  sourceValue?: string | null;
  sourceNumber?: number;
  sources?: Source[];
  variant?: 'inline' | 'detailed';
}

export function SourceCitation({
  sourceId,
  sourceValue,
  sourceNumber,
  sources = [],
  variant = 'inline',
}: SourceCitationProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Find the source by ID
  const source = sourceId ? sources.find(s => s.id === sourceId) : null;
  
  // Don't render if no source
  if (!sourceId || !source) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <span className="relative inline-block">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          onMouseEnter={() => setShowDetails(true)}
          onMouseLeave={() => setShowDetails(false)}
          className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
          title={source.name}
        >
          {sourceNumber || '?'}
        </button>
        
        {/* Tooltip */}
        {showDetails && (
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3">
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900" />
            
            <div className="font-medium text-blue-200 mb-1">
              {source.name}
            </div>
            
            {source.description && (
              <div className="text-gray-300 mb-2 leading-relaxed">
                {source.description}
              </div>
            )}
            
            {source.region && (
              <div className="text-blue-300 mb-1">
                Region: {source.region}
              </div>
            )}
            
            {sourceValue && (
              <div className="text-yellow-300 mb-2">
                Source Value: {sourceValue}
              </div>
            )}
            
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 underline"
              >
                View Source
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}
      </span>
    );
  }

  // Detailed variant for expandable sections
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          Source: {source.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showDetails && (
        <div className="px-3 pb-3 border-t border-gray-100">
          {source.description && (
            <p className="text-sm text-gray-600 mt-2 mb-3 leading-relaxed">
              {source.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            {source.region && (
              <div>
                <span className="font-medium text-gray-500">Region:</span>
                <span className="text-gray-700 ml-1">{source.region}</span>
              </div>
            )}
            
            {sourceValue && (
              <div>
                <span className="font-medium text-gray-500">Source Value:</span>
                <span className="text-gray-700 ml-1">{sourceValue}</span>
              </div>
            )}
          </div>
          
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline mt-3"
            >
              View Original Source
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Helper component for displaying multiple source citations in a compact way
 */
export interface SourceCitationListProps {
  sources: Array<{
    sourceId: string | null;
    sourceValue?: string | null;
  }>;
  allSources?: Source[];
}

export function SourceCitationList({ sources: sourceCitations, allSources = [] }: SourceCitationListProps) {
  // Filter out null/empty sources and deduplicate
  const validSources = sourceCitations
    .filter(s => s.sourceId)
    .reduce((acc, current) => {
      const existing = acc.find(s => s.sourceId === current.sourceId);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, [] as typeof sourceCitations);

  if (validSources.length === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1 ml-2">
      {validSources.map((source, index) => (
        <SourceCitation
          key={source.sourceId}
          sourceId={source.sourceId}
          sourceValue={source.sourceValue}
          sourceNumber={index + 1}
          sources={allSources}
          variant="inline"
        />
      ))}
    </div>
  );
}