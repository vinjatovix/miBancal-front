import {
  reportUnexpectedError,
  toUnexpectedErrorReport
} from './reportUnexpectedError';

export function reportRejection(section: string) {
  return (error: unknown): void =>
    reportUnexpectedError(
      toUnexpectedErrorReport(error, { kind: 'unknown', section }),
      error
    );
}
