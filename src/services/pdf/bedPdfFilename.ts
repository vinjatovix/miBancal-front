const DEFAULT_SLUG = 'ubicacion';
const DIACRITICS_PATTERN = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC_PATTERN = /[^a-z0-9]+/g;
const EDGE_HYPHEN_PATTERN = /^-+|-+$/g;

function slugify(value: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '')
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_PATTERN, '-')
    .replace(EDGE_HYPHEN_PATTERN, '');
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
