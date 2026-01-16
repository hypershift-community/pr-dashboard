'use client';

import { useEffect, useState } from 'react';

interface RefreshIndicatorProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function RefreshIndicator({ lastUpdated, isLoading, onRefresh }: RefreshIndicatorProps) {
  const [now, setNow] = useState(Date.now());

  // Update "now" every 30s to keep relative time fresh
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const ageMs = lastUpdated ? now - lastUpdated.getTime() : 0;
  const ageMin = Math.floor(ageMs / 60000);

  // Determine freshness color
  const getAgeColor = () => {
    if (isLoading) return 'text-blue-500';
    if (ageMin < 2) return 'text-gray-400';
    if (ageMin < 5) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const formatAge = () => {
    if (!lastUpdated || ageMin < 1) return null;
    if (ageMin < 60) return `${ageMin}m ago`;
    return `${Math.floor(ageMin / 60)}h ago`;
  };

  const ageText = formatAge();

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className={`hover:text-blue-600 disabled:opacity-50 transition-colors ${getAgeColor()}`}
        title={lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}. Click to refresh.` : 'Click to refresh'}
      >
        <svg
          className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
      {ageText && (
        <span className={`${getAgeColor()} transition-colors`}>
          · {ageText}
        </span>
      )}
    </div>
  );
}
