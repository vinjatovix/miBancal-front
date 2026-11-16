import { ApiError } from './ApiError';
import { NetworkError } from './NetworkError';

export type FailureKind =
  | 'offline'
  | 'unavailable'
  | 'badRequest'
  | 'forbidden'
  | 'tooManyRequests'
  | 'notFound'
  | 'unknown';

export type ClassifyFailureOptions = {
  badRequestMeansNotFound?: boolean;
};

const FAILURE_KIND_BY_STATUS: Readonly<Record<number, FailureKind>> = {
  401: 'forbidden',
  403: 'forbidden',
  404: 'notFound',
  429: 'tooManyRequests'
};

const FIRST_SERVER_ERROR_STATUS = 500;

function classifyStatus(
  status: number,
  options: ClassifyFailureOptions
): FailureKind {
  if (status === 400) {
    return options.badRequestMeansNotFound ? 'notFound' : 'badRequest';
  }
  if (status >= FIRST_SERVER_ERROR_STATUS) return 'unavailable';
  return FAILURE_KIND_BY_STATUS[status] ?? 'unknown';
}

export function classifyFailure(
  error: unknown,
  options: ClassifyFailureOptions = {}
): FailureKind {
  if (error instanceof NetworkError) return 'offline';
  if (error instanceof ApiError) return classifyStatus(error.status, options);
  return 'unknown';
}
