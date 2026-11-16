import { describe, expect, it } from 'vitest';

import { inflesz, sentences, syllables, words } from '../../scripts/inflesz';

describe('syllables', () => {
  it.each([
    ['casa', 2],
    ['sol', 1],
    ['gato', 2],
    ['come', 2],
    ['murciélago', 4],
    ['día', 2],
    ['aéreo', 4],
    ['y', 1]
  ] as const)('counts syllables of %s as %i', (word, expected) => {
    expect(syllables(word)).toBe(expected);
  });
});

describe('words', () => {
  it('counts word tokens', () => {
    expect(words('Hola, mundo feliz')).toBe(3);
  });

  it('ignores interpolation placeholders', () => {
    expect(words('Riega con {amount} litros')).toBe(3);
  });

  it('returns zero for an empty string', () => {
    expect(words('   ')).toBe(0);
  });
});

describe('sentences', () => {
  it.each([
    ['Hola. Adiós.', 2],
    ['Hola mundo', 1],
    ['¿Qué? ¡Sí!', 2],
    ['', 1]
  ] as const)('counts sentences of %s as %i', (text, expected) => {
    expect(sentences(text)).toBe(expected);
  });
});

describe('inflesz', () => {
  it('applies the INFLESZ formula', () => {
    expect(inflesz('El gato come.')).toBeCloseTo(100.0, 1);
  });

  it('scores plain language above the readable threshold', () => {
    const plain =
      'Riega la planta cuando la tierra esté seca y deja que el sol le dé unas horas al día.';
    expect(inflesz(plain)).toBeGreaterThanOrEqual(55);
  });

  it('scores dense jargon below the readable threshold', () => {
    const dense =
      'La caracterización edafoclimática condiciona la fenología reproductiva y la polinización entomófila del espécimen cultivado intensivamente.';
    expect(inflesz(dense)).toBeLessThan(55);
  });
});
