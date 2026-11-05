// Stable key for a spoken line. Shared by the app and scripts/voice so recorded clips match text.
export function normalizeLine(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function lineKey(text: string): string {
  const s = normalizeLine(text);
  let h = 0x811c9dc5; // FNV-1a, 32-bit
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
