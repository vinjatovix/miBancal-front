export function mapMonth(month: number, hemisphere: 'north' | 'south') {
  if (hemisphere === 'north') {
    return month;
  }

  return ((month + 5) % 12) + 1;
}
