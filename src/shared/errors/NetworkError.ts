export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed', { cause });
    this.name = 'NetworkError';
  }
}
