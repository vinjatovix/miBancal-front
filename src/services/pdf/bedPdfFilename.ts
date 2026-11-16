import { slugify } from './utils/slugify';

const DEFAULT_SLUG = 'ubicacion';

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
  return `${slugify(locationName, DEFAULT_SLUG)}-${formatDate(date)}.pdf`;
}
