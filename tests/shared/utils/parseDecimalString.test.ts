import { parseDecimalString } from '../../../src/shared/utils/parseDecimalString';

describe('parseDecimalString', () => {
  it.each([
    ['6.5', '6.5'],
    [' 5 ', '5'],
    ['-1', '-1'],
    ['0.0000001', '0.0000001']
  ])('%j es un decimal simple → %j', (value, expected) => {
    expect(parseDecimalString(value)).toBe(expected);
  });

  it.each([null, '', '1e3', 'abc', 'Infinity', '0x10', '.5', '5.'])(
    '%j no es un decimal simple',
    (value) => {
      expect(parseDecimalString(value)).toBeUndefined();
    }
  );
});
