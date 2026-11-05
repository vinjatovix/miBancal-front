import type { Primitive } from '../../types/Primitive';

export class QueryBuilder {
  private readonly params: URLSearchParams;

  constructor(params?: URLSearchParams) {
    this.params = new URLSearchParams(params?.toString());
  }

  static create() {
    return new QueryBuilder();
  }

  add(key: string, value?: Primitive | null) {
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      return this;
    }

    const next = new URLSearchParams(this.params);
    next.append(key, String(value));

    return new QueryBuilder(next);
  }

  addArray(key: string, value?: number | number[] | null) {
    if (value === undefined || value === null) {
      return this;
    }

    const arr = Array.isArray(value) ? value : [value];

    if (arr.length === 0) {
      return this;
    }

    const next = new URLSearchParams(this.params.toString());
    next.append(key, arr.join(','));

    return new QueryBuilder(next);
  }

  build() {
    return this.params.toString();
  }
}
