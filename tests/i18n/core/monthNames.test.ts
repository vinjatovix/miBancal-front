import { describe, expect, it } from 'vitest';
import { monthNames } from '../../../src/i18n/core/monthNames';
import { MONTH_KEYS } from '../../../src/shared/constants/months';

const SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic'
];

const LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

describe('monthNames', () => {
  it('returns the twelve months in display order', () => {
    const months = monthNames();

    expect(months).toHaveLength(12);
    expect(months.map((month) => month.displayMonth)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
    ]);
  });

  it('returns the Spanish abbreviations', () => {
    expect(monthNames().map((month) => month.short)).toEqual(SHORT);
  });

  it('returns the full Spanish names', () => {
    expect(monthNames().map((month) => month.long)).toEqual(LONG);
  });

  it('abbreviates with three letters and an initial capital', () => {
    for (const { short } of monthNames()) {
      expect(short).toMatch(/^\p{Lu}\p{Ll}{2}$/u);
    }
  });

  it('abbreviates with a prefix of the full name', () => {
    for (const { short, long } of monthNames()) {
      expect(long.startsWith(short.toLowerCase())).toBe(true);
    }
  });
});

describe('MONTH_KEYS', () => {
  it('lists the twelve month keys in order', () => {
    expect(MONTH_KEYS).toEqual([
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ]);
  });
});
