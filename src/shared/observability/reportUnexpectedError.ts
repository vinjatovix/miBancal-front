import { ApiError } from '../errors/ApiError';
import type { FailureKind } from '../errors/classifyFailure';

export type UnexpectedErrorKind = FailureKind | 'render';

export type UnexpectedErrorReport = {
  kind: UnexpectedErrorKind;
  route: string;
  section?: string;
  status?: number;
  error: { name: string; message: string };
};

const REPORTED_KINDS: ReadonlySet<UnexpectedErrorKind> = new Set([
  'unavailable',
  'badRequest',
  'forbidden',
  'unknown',
  'render'
]);

const reportedErrors = new WeakSet<object>();

export function shouldReportFailure(kind: UnexpectedErrorKind): boolean {
  return REPORTED_KINDS.has(kind);
}

function describeError(error: unknown): UnexpectedErrorReport['error'] {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { name: 'NonError', message: String(error) };
}

export function toUnexpectedErrorReport(
  error: unknown,
  { kind, section }: { kind: UnexpectedErrorKind; section?: string }
): UnexpectedErrorReport {
  return {
    kind,
    route: window.location.pathname,
    ...(section === undefined ? {} : { section }),
    ...(error instanceof ApiError ? { status: error.status } : {}),
    error: describeError(error)
  };
}

function isTrackable(source: unknown): source is object {
  return typeof source === 'object' && source !== null;
}

function wasAlreadyReported(source: unknown): boolean {
  if (!isTrackable(source)) return false;
  if (reportedErrors.has(source)) return true;
  reportedErrors.add(source);
  return false;
}

export function reportUnexpectedError(
  report: UnexpectedErrorReport,
  source?: unknown
): void {
  if (wasAlreadyReported(source)) return;
  console.error('Unexpected error', report);
}
