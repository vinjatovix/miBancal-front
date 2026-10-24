const ANOMALY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ANOMALY_SLUG_MAX_LENGTH = 120;

export function isAnomalySlug(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= ANOMALY_SLUG_MAX_LENGTH &&
    ANOMALY_SLUG_PATTERN.test(value)
  );
}
