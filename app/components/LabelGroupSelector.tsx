'use client';

import { useMemo } from 'react';
import type { Label } from '../types';

interface LabelGroupSelectorProps {
  availableLabels: Label[];
  selectedLabels: string[];
  onSelectionChange: (labels: string[]) => void;
}

export function LabelGroupSelector({
  availableLabels,
  selectedLabels,
  onSelectionChange,
}: LabelGroupSelectorProps) {
  // Create grouping options: include both full labels and prefixes (before colon)
  const groupingOptions = useMemo(() => {
    const options = new Map<
      string,
      { name: string; color: string; id: string; isPrefix: boolean }
    >();

    for (const label of availableLabels) {
      // Add the full label
      options.set(label.name, {
        name: label.name,
        color: label.color,
        id: String(label.id),
        isPrefix: false,
      });

      // If label has a colon, also add the prefix as an option
      const colonIndex = label.name.indexOf(':');
      if (colonIndex > 0) {
        const prefix = label.name.substring(0, colonIndex);
        if (!options.has(prefix)) {
          options.set(prefix, {
            name: prefix,
            color: label.color, // Use the same color as the first label with this prefix
            id: `prefix-${prefix}`,
            isPrefix: true,
          });
        }
      }
    }

    // Sort: prefixes first, then full labels alphabetically
    return Array.from(options.values()).sort((a, b) => {
      if (a.isPrefix !== b.isPrefix) {
        return a.isPrefix ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [availableLabels]);

  const toggleLabel = (labelName: string) => {
    if (selectedLabels.includes(labelName)) {
      onSelectionChange(selectedLabels.filter((l) => l !== labelName));
    } else {
      onSelectionChange([...selectedLabels, labelName]);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  if (availableLabels.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Group by Labels</h3>
        {selectedLabels.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear ({selectedLabels.length})
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {groupingOptions.map((option) => (
          <label
            key={option.id}
            className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedLabels.includes(option.name)}
              onChange={() => toggleLabel(option.name)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span
              className="ml-3 px-3 py-1 text-sm font-semibold rounded-full"
              style={{
                backgroundColor: `#${option.color}20`,
                color: `#${option.color}`,
              }}
            >
              {option.name}
              {option.isPrefix && <span className="ml-1 text-xs opacity-70">(prefix)</span>}
            </span>
          </label>
        ))}
      </div>

      {selectedLabels.length === 0 && (
        <p className="mt-4 text-xs text-gray-500">
          Select labels to group pull requests into collapsible sections
        </p>
      )}
    </div>
  );
}
