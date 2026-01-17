'use client';

import { stringToColor } from '../lib/colors';
import type { Repository } from '../types';

interface RepositorySelectorProps {
  repositories: Repository[];
  selectedRepositories: string[];
  onSelectionChange: (selected: string[]) => void;
  isLoading?: boolean;
}

export function RepositorySelector({
  repositories,
  selectedRepositories,
  onSelectionChange,
  isLoading,
}: RepositorySelectorProps) {
  const handleToggleRepository = (fullName: string) => {
    if (selectedRepositories.includes(fullName)) {
      onSelectionChange(selectedRepositories.filter((r) => r !== fullName));
    } else {
      onSelectionChange([...selectedRepositories, fullName]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(repositories.map((r) => r.fullName));
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Repositories</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
        {repositories.map((repo) => (
          <button
            key={repo.id}
            type="button"
            onClick={() => handleToggleRepository(repo.fullName)}
            className={`px-4 py-1.5 text-base font-medium rounded-full border transition-colors ${
              selectedRepositories.includes(repo.fullName) ? 'border-2' : 'border'
            }`}
            style={{
              backgroundColor: selectedRepositories.includes(repo.fullName)
                ? `#${stringToColor(repo.fullName)}`
                : `#${stringToColor(repo.fullName)}20`,
              color: selectedRepositories.includes(repo.fullName)
                ? '#ffffff'
                : `#${stringToColor(repo.fullName)}`,
              borderColor: `#${stringToColor(repo.fullName)}`,
            }}
          >
            {repo.fullName}
            {repo.isPrivate && ' (Private)'}
          </button>
        ))}
      </div>

      {repositories.length === 0 && (
        <div className="text-center py-8 text-gray-500">No repositories found</div>
      )}

      <div className="mt-4 pt-4 border-t">
        <div className="text-sm text-gray-600">
          {selectedRepositories.length} of {repositories.length} selected
        </div>
      </div>
    </div>
  );
}
