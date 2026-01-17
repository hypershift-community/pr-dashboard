/**
 * Generate a consistent color from a string using a hash function.
 * The same string will always produce the same color.
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Use a set of distinguishable colors
  const colors = [
    '3b82f6', // blue
    '10b981', // green
    'f59e0b', // amber
    'ef4444', // red
    '8b5cf6', // violet
    'ec4899', // pink
    '06b6d4', // cyan
    'f97316', // orange
  ];
  return colors[Math.abs(hash) % colors.length];
}
