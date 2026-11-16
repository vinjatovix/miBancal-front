const DIACRITICS_PATTERN = /[̀-ͯ]/g;
const NON_ALPHANUMERIC_PATTERN = /[^a-z0-9]+/g;

export function slugify(value: string, fallback: string): string {
  let normalized = value
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '')
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_PATTERN, '-');

  let start = 0;
  while (start < normalized.length && normalized[start] === '-') {
    start++;
  }
  let end = normalized.length;
  while (end > start && normalized[end - 1] === '-') {
    end--;
  }
  normalized =
    start > 0 || end < normalized.length
      ? normalized.slice(start, end)
      : normalized;

  return normalized || fallback;
}
