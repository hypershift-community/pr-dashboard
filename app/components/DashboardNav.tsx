'use client';

import Link from 'next/link';

interface DashboardConfig {
  id: string;
  name: string;
  repos: string;
  filter: string;
}

interface DashboardNavProps {
  dashboards: DashboardConfig[];
  currentDashboardId: string;
}

export function DashboardNav({ dashboards, currentDashboardId }: DashboardNavProps) {
  if (dashboards.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2">
      <span className="text-gray-400">|</span>
      <div className="flex items-center gap-1">
        {dashboards.map((dashboard) => (
          <Link
            key={dashboard.id}
            href={`/${dashboard.id}`}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              dashboard.id === currentDashboardId
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {dashboard.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
