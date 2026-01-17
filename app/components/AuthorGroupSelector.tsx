'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AuthorGroupSelectorProps {
  availableAuthors: { login: string; avatarUrl: string }[];
  selectedAuthors: string[];
  onSelectionChange: (authors: string[]) => void;
}

export function AuthorGroupSelector({
  availableAuthors,
  selectedAuthors,
  onSelectionChange,
}: AuthorGroupSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAuthors = availableAuthors.filter((author) =>
    author.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAuthor = (authorLogin: string) => {
    if (selectedAuthors.includes(authorLogin)) {
      onSelectionChange(selectedAuthors.filter((a) => a !== authorLogin));
    } else {
      onSelectionChange([...selectedAuthors, authorLogin]);
    }
  };

  const allSelected =
    availableAuthors.length > 0 && selectedAuthors.length === availableAuthors.length;

  const handleToggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(availableAuthors.map((a) => a.login));
    }
  };

  if (availableAuthors.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Group by Authors</h3>
        <button
          type="button"
          onClick={handleToggleAll}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <input
        type="text"
        placeholder="Search authors..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredAuthors.map((author) => (
          <label
            key={author.login}
            className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedAuthors.includes(author.login)}
              onChange={() => toggleAuthor(author.login)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Image
              src={author.avatarUrl}
              alt={author.login}
              width={20}
              height={20}
              className="ml-3 rounded-full"
            />
            <span className="ml-2 text-sm font-medium text-gray-900">{author.login}</span>
          </label>
        ))}
      </div>

      {selectedAuthors.length === 0 && (
        <p className="mt-4 text-xs text-gray-500">
          Select authors to group pull requests into collapsible sections
        </p>
      )}
    </div>
  );
}
