import { ApiError } from './ApiError';

export class PreconditionFailedError extends ApiError {
  constructor(
    message = 'Precondition failed',
    errors?: Record<string, string>
  ) {
    super(message, 412, errors);
    this.name = 'PreconditionFailedError';
  }
}
