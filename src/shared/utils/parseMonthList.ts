const MONTH = /^(1[0-2]|[1-9])$/;

export function parseMonthList(
  values: readonly string[]
): number[] | undefined {
  const months = values
    .flatMap((value) => value.split(','))
    .map((entry) => entry.trim())
    .filter((entry) => MONTH.test(entry))
    .map(Number);
  const unique = [...new Set(months)];
  return unique.length > 0 ? unique : undefined;
}
