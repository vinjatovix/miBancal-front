import { classifyFailure, type FailureKind } from '../errors/classifyFailure';

const MAX_RETRIES = 2;

const RETRYABLE_KINDS: ReadonlySet<FailureKind> = new Set([
  'offline',
  'unavailable',
  'tooManyRequests'
]);

export function shouldRetryQuery(
  failureCount: number,
  error: unknown
): boolean {
  return (
    failureCount < MAX_RETRIES && RETRYABLE_KINDS.has(classifyFailure(error))
  );
}
