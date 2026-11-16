const DECIMAL_STRING = /^-?\d+(\.\d+)?$/;

export function parseDecimalString(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed && DECIMAL_STRING.test(trimmed) ? trimmed : undefined;
}
