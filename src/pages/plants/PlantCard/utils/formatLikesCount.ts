const formatter = new Intl.NumberFormat('es-ES', {
  useGrouping: 'always'
});

export function formatLikesCount(count: number): string {
  return formatter.format(count);
}
