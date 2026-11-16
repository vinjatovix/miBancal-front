import type { Range } from '../../../types/Range';

export function formatRange(range: Range, unit?: string): string {
  if (range.min === range.max) {
    return `${range.min}${unit ?? ''}`;
  }

  return `${range.min}-${range.max}${unit ?? ''}`;
}
