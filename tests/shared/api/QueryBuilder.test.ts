import { describe, it, expect } from 'vitest';
import { QueryBuilder } from '../../../src/shared/api/QueryBuilder';

describe('QueryBuilder', () => {
  it('starts empty', () => {
    const result = QueryBuilder.create().build();

    expect(result).toBe('');
  });

  it('adds primitive values', () => {
    const result = QueryBuilder.create()
      .add('name', 'tomato')
      .add('page', 1)
      .build();

    expect(result).toBe('name=tomato&page=1');
  });

  it('ignores null and undefined values', () => {
    const result = QueryBuilder.create()
      .add('name', null)
      .add('family', undefined)
      .add('valid', 'ok')
      .build();

    expect(result).toBe('valid=ok');
  });

  it('supports array values', () => {
    const result = QueryBuilder.create().addArray('months', [1, 2, 3]).build();

    expect(result).toBe('months=1%2C2%2C3');
  });

  it('supports single value array input', () => {
    const result = QueryBuilder.create().addArray('months', 5).build();

    expect(result).toBe('months=5');
  });

  it('returns new instance (immutability)', () => {
    const qb1 = QueryBuilder.create().add('a', '1');
    const qb2 = qb1.add('b', '2');

    expect(qb1.build()).toBe('a=1');
    expect(qb2.build()).toBe('a=1&b=2');
  });

  it('build preserves multiple chained calls', () => {
    const result = QueryBuilder.create()
      .add('name', 'carrot')
      .add('family', 'apiaceae')
      .addArray('months', [4, 5])
      .build();

    expect(result).toContain('name=carrot');
    expect(result).toContain('family=apiaceae');
    expect(result).toContain('months=4%2C5');
  });

  it('ignores strings that are empty after trimming', () => {
    const result = QueryBuilder.create()
      .add('name', '   ')
      .add('valid', 'ok')
      .build();

    expect(result).toBe('valid=ok');
  });

  it('ignores null, undefined and empty arrays', () => {
    const result = QueryBuilder.create()
      .addArray('months', null)
      .addArray('weeks', undefined)
      .addArray('days', [])
      .build();

    expect(result).toBe('');
  });
});
