export function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;

  const trimmed = value.trim();
  const n = Number(trimmed);

  if (!Number.isFinite(n)) return fallback;
  if (!Number.isInteger(n)) return fallback;
  if (n <= 0) return fallback;

  return n;
}
