import { pickAllowed } from '../../../src/shared/utils/pickAllowed';

const DIRECTIONS = ['asc', 'desc'] as const;

describe('pickAllowed', () => {
  it('devuelve el valor permitido tras recortarlo', () => {
    expect(pickAllowed([' desc '], DIRECTIONS)).toBe('desc');
  });

  it('devuelve el primer valor permitido', () => {
    expect(pickAllowed(['x', 'desc', 'asc'], DIRECTIONS)).toBe('desc');
  });

  it.each([[[]], [['up', 'DESC', '']]])(
    'sin valores permitidos devuelve undefined (%j)',
    (values) => {
      expect(pickAllowed(values, DIRECTIONS)).toBeUndefined();
    }
  );
});
