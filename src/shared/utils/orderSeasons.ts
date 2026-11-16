const SEASON_ORDER: readonly string[] = [
  'spring',
  'summer',
  'autumn',
  'winter'
];

function seasonRank(season: string): number {
  const index = SEASON_ORDER.indexOf(season);
  return index === -1 ? SEASON_ORDER.length : index;
}

export function orderSeasons(seasons: readonly string[] | undefined): string[] {
  const unique = [...new Set(seasons ?? [])];
  return unique.sort((a, b) => seasonRank(a) - seasonRank(b));
}
