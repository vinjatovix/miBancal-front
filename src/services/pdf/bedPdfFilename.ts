const DEFAULT_SLUG = 'ubicacion';
const DIACRITICS_PATTERN = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC_PATTERN = /[^a-z0-9]+/g;

function slugify(value: string): string {
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

  return normalized || DEFAULT_SLUG;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPdfFilename(
  locationName: string,
  date: Date = new Date()
): string {
  return `${slugify(locationName)}-${formatDate(date)}.pdf`;
}
