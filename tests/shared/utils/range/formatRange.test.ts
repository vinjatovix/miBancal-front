import { formatRange } from '../../../../src/shared/utils/range/formatRange';

describe('formatRange', () => {
  it('muestra un único valor si min y max coinciden', () => {
    expect(formatRange({ min: 5, max: 5 })).toBe('5');
  });

  it('añade la unidad a un único valor', () => {
    expect(formatRange({ min: 5, max: 5 }, 'cm')).toBe('5cm');
  });

  it('muestra el intervalo si min y max difieren', () => {
    expect(formatRange({ min: 3, max: 7 })).toBe('3-7');
  });

  it('añade la unidad al intervalo', () => {
    expect(formatRange({ min: 3, max: 7 }, 'cm')).toBe('3-7cm');
  });
});
