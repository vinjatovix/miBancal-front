import { describe, expect, it } from 'vitest';
import { parseOptionalEnv, parseRequiredEnv } from '../../src/config/env';

describe('parseOptionalEnv', () => {
  it('returns trimmed string when non-empty string is provided', () => {
    expect(parseOptionalEnv('  http://localhost:3000  ')).toBe(
      'http://localhost:3000'
    );
  });

  it.each(['', '   ', '\t\n'])(
    'returns undefined when string is empty or only whitespace: %j',
    (emptyInput) => {
      expect(parseOptionalEnv(emptyInput)).toBeUndefined();
    }
  );

  it.each([undefined, null, 123, true, {}, []])(
    'returns undefined when value is not a string: %s',
    (nonStringInput) => {
      expect(parseOptionalEnv(nonStringInput)).toBeUndefined();
    }
  );
});

describe('parseRequiredEnv', () => {
  it('returns trimmed string when non-empty string is provided', () => {
    expect(parseRequiredEnv('VITE_API_URL', '  http://localhost:3000  ')).toBe(
      'http://localhost:3000'
    );
  });

  it.each(['', '   ', '\t\n'])(
    'throws error when required variable is empty or only whitespace: %j',
    (emptyInput) => {
      expect(() => parseRequiredEnv('VITE_API_URL', emptyInput)).toThrow(
        'Falta la variable de entorno obligatoria: VITE_API_URL'
      );
    }
  );

  it.each([undefined, null, 123, true, {}, []])(
    'throws error when required variable is not a string: %s',
    (invalidInput) => {
      expect(() => parseRequiredEnv('VITE_API_URL', invalidInput)).toThrow(
        'Falta la variable de entorno obligatoria: VITE_API_URL'
      );
    }
  );
});
