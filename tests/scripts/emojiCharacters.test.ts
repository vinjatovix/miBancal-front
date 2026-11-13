import { describe, expect, it } from 'vitest';

import { findEmojiCharacters } from '../../scripts/emojiCharacters';

describe('findEmojiCharacters - prohibited characters', () => {
  it.each([
    ['pictographic emoji', 'const icon = "🌿";', '🌿', 1, 15],
    ['notes emoji', 'const title = "📝 Notas";', '📝', 1, 16],
    ['sparkles emoji', 'const star = "🌟";', '🌟', 1, 15],
    ['cross mark emoji', 'const close = "❌";', '❌', 1, 16],
    ['up arrow', 'const up = "↑";', '↑', 1, 13],
    ['down arrow', 'const down = "↓";', '↓', 1, 15],
    ['left right arrow', 'const spread = "↔";', '↔', 1, 17],
    ['arrow right', 'const next = "➡️";', '➡️', 1, 15],
    ['star symbol', 'const rating = "★";', '★', 1, 17],
    ['copyright symbol', 'const copy = "©";', '©', 1, 15],
    ['trademark symbol', 'const tm = "™";', '™', 1, 13],
    ['keycap emoji sequence', 'const num = "1️⃣";', '1️⃣', 1, 14],
    ['zwj emoji sequence', 'const farmer = "👨‍🌾";', '👨‍🌾', 1, 17]
  ])('detects %s', (_, source, expectedChar, expectedLine, expectedCol) => {
    const findings = findEmojiCharacters('src/sample.ts', source);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toEqual({
      filePath: 'src/sample.ts',
      line: expectedLine,
      column: expectedCol,
      character: expectedChar
    });
  });

  it('detects multiple prohibited characters across multiple lines', () => {
    const source = 'const a = "🌿";\nconst b = "OK";\nconst c = "↑";';

    const findings = findEmojiCharacters('src/multiline.ts', source);

    expect(findings).toEqual([
      { filePath: 'src/multiline.ts', line: 1, column: 12, character: '🌿' },
      { filePath: 'src/multiline.ts', line: 3, column: 12, character: '↑' }
    ]);
  });
});

describe('findEmojiCharacters - allowed typographic characters', () => {
  it.each([
    ['degree symbol in temperature', 'const temp = "25 °C";'],
    ['degree sign alt', 'const temp = "18 ºC";'],
    ['ellipsis character', 'const ellipsis = "…";'],
    ['en-dash', 'const range = "10–20 cm";'],
    ['em-dash', 'const quote = "— Autor";'],
    ['spanish quotes', 'const text = "«Cita»";'],
    [
      'spanish question and exclamation',
      'const greeting = "¿Qué tal? ¡Genial!";'
    ],
    ['accented characters', 'const words = "Árbol, camión, cigüeña";']
  ])('permits %s without reporting findings', (_, source) => {
    const findings = findEmojiCharacters('src/clean.ts', source);

    expect(findings).toHaveLength(0);
  });
});
