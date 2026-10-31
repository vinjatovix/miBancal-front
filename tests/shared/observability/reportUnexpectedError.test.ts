import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '../../../src/shared/errors/ApiError';
import {
  reportUnexpectedError,
  shouldReportFailure,
  toUnexpectedErrorReport
} from '../../../src/shared/observability/reportUnexpectedError';

describe('shouldReportFailure', () => {
  it.each([
    'unavailable',
    'badRequest',
    'forbidden',
    'unknown',
    'render'
  ] as const)('reports %s', (kind) => {
    expect(shouldReportFailure(kind)).toBe(true);
  });

  it.each(['offline', 'tooManyRequests', 'notFound'] as const)(
    'does not report %s',
    (kind) => {
      expect(shouldReportFailure(kind)).toBe(false);
    }
  );
});

describe('toUnexpectedErrorReport', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/plants/abc?page=2#notes');
  });

  it('builds a report from an ApiError with its status and route without query or hash', () => {
    const report = toUnexpectedErrorReport(new ApiError('boom', 500), {
      kind: 'unavailable'
    });

    expect(report).toEqual({
      kind: 'unavailable',
      route: '/plants/abc',
      status: 500,
      error: { name: 'Error', message: 'boom' }
    });
  });

  it('includes the section when given', () => {
    const report = toUnexpectedErrorReport(new Error('x'), {
      kind: 'render',
      section: 'plant.calendar'
    });

    expect(report.section).toBe('plant.calendar');
  });

  it('has no status when the error is not an ApiError', () => {
    const report = toUnexpectedErrorReport(new TypeError('x'), {
      kind: 'unknown'
    });

    expect(report).not.toHaveProperty('status');
    expect(report.error).toEqual({ name: 'TypeError', message: 'x' });
  });

  it('describes a non-Error value as NonError', () => {
    const report = toUnexpectedErrorReport('texto', { kind: 'unknown' });

    expect(report.error).toEqual({ name: 'NonError', message: 'texto' });
  });
});

describe('reportUnexpectedError', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    errorSpy.mockClear();
  });

  it('logs only the sanitized report fields', () => {
    const error = new ApiError('boom', 500, { id: 'x' });
    error.cause = { headers: { Authorization: 'Bearer secret' } };

    reportUnexpectedError(
      toUnexpectedErrorReport(error, { kind: 'unavailable', section: 'page' }),
      error
    );

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const payload = errorSpy.mock.calls[0].at(-1) as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      ['error', 'kind', 'route', 'section', 'status'].sort()
    );
    expect(Object.keys(payload.error as object).sort()).toEqual([
      'message',
      'name'
    ]);
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('secret');
  });

  it('logs the same error object only once', () => {
    const error = new Error('once');
    const report = toUnexpectedErrorReport(error, { kind: 'render' });

    reportUnexpectedError(report, error);
    reportUnexpectedError(report, error);

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('logs every time when the source is a primitive', () => {
    const report = toUnexpectedErrorReport('texto', { kind: 'render' });

    reportUnexpectedError(report, 'texto');
    reportUnexpectedError(report, 'texto');

    expect(errorSpy).toHaveBeenCalledTimes(2);
  });
});
