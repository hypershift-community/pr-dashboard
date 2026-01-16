'use client';

type PRState = 'open' | 'closed' | 'merged';

interface StateSelectorProps {
  value: PRState;
  onChange: (state: PRState) => void;
  counts?: { open?: number; closed?: number; merged?: number };
  isLoading?: boolean;
}

const states: { id: PRState; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'closed', label: 'Closed' },
  { id: 'merged', label: 'Merged' },
];

export function StateSelector({ value, onChange, counts, isLoading }: StateSelectorProps) {
  return (
    <div className="flex border-b border-gray-200">
      {states.map((state) => (
        <button
          key={state.id}
          type="button"
          onClick={() => onChange(state.id)}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            value === state.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {state.label}
          {counts?.[state.id] !== undefined && (
            <span className="ml-1.5 text-xs text-gray-400">
              ({isLoading && value === state.id ? '...' : counts[state.id]})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
