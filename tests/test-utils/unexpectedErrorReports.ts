import type { MockInstance } from 'vitest';

export type ReportPayload = Record<string, unknown> & { kind: unknown };

function isReportPayload(value: unknown): value is ReportPayload {
  return typeof value === 'object' && value !== null && 'kind' in value;
}

export function getUnexpectedErrorReports(
  spy: MockInstance<(...args: unknown[]) => void>
): ReportPayload[] {
  return spy.mock.calls.map((call) => call.at(-1)).filter(isReportPayload);
}

export function silenceConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

export function ThrowingChild({ message = 'render failed' }): never {
  throw new Error(message);
}
