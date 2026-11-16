import { parseMonthList } from '../../../src/shared/utils/parseMonthList';

describe('parseMonthList', () => {
  it.each([
    [
      ['3', '13', '5', '3'],
      [3, 5]
    ],
    [
      ['3,13', ' 5 ,3'],
      [3, 5]
    ],
    [
      ['12', '1'],
      [12, 1]
    ]
  ])('%j → %j', (values, expected) => {
    expect(parseMonthList(values)).toEqual(expected);
  });

  it.each([[['13', '0', '3.5']], [[]], [['01']]])(
    '%j no tiene meses válidos',
    (values) => {
      expect(parseMonthList(values)).toBeUndefined();
    }
  );
});
