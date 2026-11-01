import { describe, expect, it } from 'vitest';
import { parseTokens } from '../../../scripts/designSystem/parseTokens';

const SAMPLE_CSS = `
:root {
  --palette-forest-500: #1f5038;
  --palette-neutral-900: #13201a;
  --palette-border-decor-light: #c4d0c7;

  --color-fg: var(--palette-neutral-900);
  --color-action-bg: var(--palette-forest-500);
  --color-border-decor: var(--palette-border-decor-light);
  --color-bg-page: #f3f8f4;
  --color-bg-scrim: color-mix(in srgb, var(--color-fg) 40%, transparent);
}

[data-theme='dark'] {
  --color-fg: #e2ebe5;
  --color-action-bg: #8fd0a9;
  --color-border-decor: #34443b;
  --color-bg-page: #0f1714;
  --color-bg-scrim: color-mix(in srgb, #000000 65%, transparent);
}

@media (prefers-contrast: more) {
  :root {
    --color-border-decor: #77857d;
  }

  [data-theme='dark'] {
    --color-border-decor: #6b7c72;
  }
}
`;

describe('parseTokens', () => {
  it('resolves light theme color tokens from :root', () => {
    const tokens = parseTokens(SAMPLE_CSS);

    expect(tokens.light['--color-action-bg']).toBe('#1f5038');
    expect(tokens.light['--color-bg-page']).toBe('#f3f8f4');
  });

  it('resolves dark theme color tokens from [data-theme="dark"]', () => {
    const tokens = parseTokens(SAMPLE_CSS);

    expect(tokens.dark['--color-action-bg']).toBe('#8fd0a9');
    expect(tokens.dark['--color-bg-page']).toBe('#0f1714');
  });

  it('resolves light+contrast tokens by overriding light with prefers-contrast: more', () => {
    const tokens = parseTokens(SAMPLE_CSS);

    expect(tokens.light['--color-border-decor']).toBe('#c4d0c7');
    expect(tokens['light+contrast']['--color-border-decor']).toBe('#77857d');
    expect(tokens['light+contrast']['--color-bg-page']).toBe('#f3f8f4');
  });

  it('resolves dark+contrast tokens by overriding dark with prefers-contrast: more', () => {
    const tokens = parseTokens(SAMPLE_CSS);

    expect(tokens.dark['--color-border-decor']).toBe('#34443b');
    expect(tokens['dark+contrast']['--color-border-decor']).toBe('#6b7c72');
    expect(tokens['dark+contrast']['--color-bg-page']).toBe('#0f1714');
  });

  it('follows chains of var(--palette-*) references to final hex values', () => {
    const tokens = parseTokens(SAMPLE_CSS);

    expect(tokens.light['--color-fg']).toBe('#13201a');
  });

  it('resolves color-mix(in srgb, ...) with transparent or variable colors', () => {
    const tokens = parseTokens(SAMPLE_CSS);

    expect(tokens.light['--color-bg-scrim']).toBe('rgba(19, 32, 26, 0.4)');
    expect(tokens.dark['--color-bg-scrim']).toBe('rgba(0, 0, 0, 0.65)');
  });

  it('resolves the same var() referenced twice in a single value', () => {
    const css = `
:root {
  --color-fg: #13201a;
  --shadow-double: 0 0 4px var(--color-fg), 0 0 8px var(--color-fg);
}
`;

    const tokens = parseTokens(css);

    expect(tokens.light['--shadow-double']).toBe(
      '0 0 4px #13201a, 0 0 8px #13201a'
    );
  });

  it('throws on a real circular variable reference', () => {
    const css = `
:root {
  --color-a: var(--color-b);
  --color-b: var(--color-a);
}
`;

    expect(() => parseTokens(css)).toThrow('Circular variable reference');
  });
});
