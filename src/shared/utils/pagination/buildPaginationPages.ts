export function buildPaginationPages(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  const add = (value: number | '...') => {
    pages.push(value);
  };

  const addRange = (start: number, end: number) => {
    for (let i = start; i <= end; i++) {
      add(i);
    }
  };

  addRange(1, 2);

  if (current > 4) {
    add('...');
  }

  const start = Math.max(3, current - 1);
  const end = Math.min(total - 2, current + 1);

  addRange(start, end);

  if (current < total - 3) {
    add('...');
  }

  addRange(total - 1, total);

  const cleaned: (number | '...')[] = [];
  for (const p of pages) {
    if (cleaned.at(-1) !== p) {
      cleaned.push(p);
    }
  }

  return cleaned;
}
