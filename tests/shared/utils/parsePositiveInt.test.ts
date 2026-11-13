import { describe, it, expect } from 'vitest';
import { parsePositiveInt } from '../../../src/shared/utils/parsePositiveInt';

describe('parsePositiveInt', () => {
  it('returns parsed integer', () => {
    expect(parsePositiveInt('10', 25)).toBe(10);
  });

  it('returns fallback when value is null', () => {
    expect(parsePositiveInt(null, 25)).toBe(25);
  });

  it('returns fallback when value is empty string', () => {
    expect(parsePositiveInt('', 25)).toBe(25);
  });

  it('returns fallback when value is not a number', () => {
    expect(parsePositiveInt('abc', 25)).toBe(25);
  });

  it('returns fallback when value is decimal', () => {
    expect(parsePositiveInt('3.14', 25)).toBe(25);
  });

  it('returns fallback when value is zero', () => {
    expect(parsePositiveInt('0', 25)).toBe(25);
  });

  it('returns fallback when value is negative', () => {
    expect(parsePositiveInt('-5', 25)).toBe(25);
  });

  it.each([
    [' 50 ', 50],
    ['2.5', 25],
    ['0', 25],
    ['-3', 25],
    ['abc', 25]
  ])('%j → %i (reglas de página y límite)', (value, expected) => {
    expect(parsePositiveInt(value, 25)).toBe(expected);
  });
});
