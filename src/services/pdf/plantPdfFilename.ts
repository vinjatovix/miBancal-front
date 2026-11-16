import type { Plant } from '../../types/Plants/Plant';
import { slugify } from './utils/slugify';

const DEFAULT_SLUG = 'planta';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPlantPdfFilename(
  plant: Plant,
  date: Date = new Date()
): string {
  const base = plant.slug ?? plant.identity.name.primary;
  return `${slugify(base, DEFAULT_SLUG)}-${formatDate(date)}.pdf`;
}
