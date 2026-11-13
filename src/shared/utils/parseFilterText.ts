export function parseFilterText(
  value: string | null,
  maxLength: number
): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length <= maxLength ? trimmed : undefined;
}
