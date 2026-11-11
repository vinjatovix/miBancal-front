export function slugify(text: string): string {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  let start = 0;
  while (start < normalized.length && normalized[start] === '-') {
    start++;
  }
  let end = normalized.length;
  while (end > start && normalized[end - 1] === '-') {
    end--;
  }
  return start > 0 || end < normalized.length
    ? normalized.slice(start, end)
    : normalized;
}
