export interface Advisory {
  readonly source: number;
  readonly name: string;
  readonly severity: string;
  readonly url: string;
  readonly title: string;
}

export interface AllowlistEntry {
  readonly id: string;
  readonly justification: string;
  readonly issue: string;
}

const HIGH_SEVERITIES = new Set(['high', 'critical']);

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function toAdvisory(via: unknown): Advisory | undefined {
  const entry = asRecord(via);
  if (typeof entry.source !== 'number') return undefined;
  if (!HIGH_SEVERITIES.has(String(entry.severity))) return undefined;
  return {
    source: entry.source,
    name: String(entry.name ?? ''),
    severity: String(entry.severity),
    url: String(entry.url ?? ''),
    title: String(entry.title ?? '')
  };
}

export function highSeverityAdvisories(auditJson: unknown): Advisory[] {
  const vulnerabilities = asRecord(asRecord(auditJson).vulnerabilities);
  const bySource = new Map<number, Advisory>();
  for (const vulnerability of Object.values(vulnerabilities)) {
    const via = asRecord(vulnerability).via;
    const list = Array.isArray(via) ? via : [];
    for (const item of list) {
      const advisory = toAdvisory(item);
      if (advisory && !bySource.has(advisory.source)) {
        bySource.set(advisory.source, advisory);
      }
    }
  }
  return [...bySource.values()];
}

function ghsaId(url: string): string {
  return url.split('/').at(-1) ?? '';
}

export function unallowedAdvisories(
  advisories: Advisory[],
  allowlist: AllowlistEntry[]
): Advisory[] {
  const allowed = new Set(allowlist.map((entry) => entry.id));
  return advisories.filter(
    (advisory) =>
      !allowed.has(String(advisory.source)) &&
      !allowed.has(ghsaId(advisory.url))
  );
}
