import { describe, expect, it } from 'vitest';

import { findColorLiterals } from '../../scripts/colorLiterals';
import { selectColorCheckFiles } from '../../scripts/colorCheckFiles';

function matches(filePath: string, source: string): string[] {
  return findColorLiterals(filePath, source).map(({ match }) => match);
}

describe('findColorLiterals in CSS', () => {
  it.each([
    ['a { color: #fff; }', ['#fff']],
    ['a { color: #ffff; border-color: #5c3d06; }', ['#ffff', '#5c3d06']],
    ['a { background: #e7f0e392; }', ['#e7f0e392']],
    ['a { box-shadow: 0 1px 2px rgba(0,0,0,.1); }', ['rgba(']],
    ['a { color: RGB(0 0 0); }', ['RGB(']],
    ['a { color: hsl(0 0% 0%); fill: hsla(0,0%,0%,1); }', ['hsl(', 'hsla(']],
    ['a { background: white; }', ['white']],
    [':root { --x: Tomato; }', ['Tomato']]
  ])('flags the color literals of %s', (source, expected) => {
    expect(matches('src/a.css', source)).toEqual(expected);
  });

  it.each([
    '#add { color: var(--color-primary); }',
    'a { color: transparent; fill: currentColor; border-color: inherit; }',
    '/* #fff */ a { color: var(--color-primary); }',
    "a::before { content: 'white'; }",
    "a { font-family: 'Red Hat', sans-serif; }",
    'a { background: url(white.png); }',
    'a { white-space: nowrap; }',
    'a { background: color-mix(in srgb, var(--color-surface) 80%, transparent); }'
  ])('does not flag %s', (source) => {
    expect(matches('src/a.css', source)).toEqual([]);
  });

  it('reports line and column from 1', () => {
    expect(findColorLiterals('src/a.css', 'a { color: #fff; }')).toEqual([
      { line: 1, column: 12, match: '#fff' }
    ]);
  });

  it('keeps line numbers after multiline comments', () => {
    const source = '/*\n#fff\n*/\na {\n  color: #000;\n}';

    expect(findColorLiterals('src/a.css', source)).toEqual([
      { line: 5, column: 10, match: '#000' }
    ]);
  });
});

describe('findColorLiterals in TS and TSX', () => {
  it.each([
    ['src/a.ts', "const C = '#fff';", ['#fff']],
    ['src/a.tsx', "<div style={{ color: 'white' }} />", ['white']],
    [
      'src/a.tsx',
      "<div style={{ boxShadow: '0 0 1px rgba(0,0,0,1)' }} />",
      ['rgba(']
    ],
    ['src/a.ts', 'const C = `0 0 1px ${size} hsl(0 0% 0%)`;', ['hsl(']],
    ['src/a.ts', "const C = 'Black';", ['Black']],
    [
      'src/a.ts',
      "const S: CSSProperties = { border: '1px solid red' };",
      ['red']
    ],
    [
      'src/a.ts',
      "const S = { border: '1px solid red' } satisfies CSSProperties;",
      ['red']
    ],
    [
      'src/a.ts',
      "const S = { border: '1px solid red' } as React.CSSProperties;",
      ['red']
    ],
    ['src/a.tsx', "<a href={'#bed'}>x</a>", []],
    ['src/a.tsx', '<div title="#fff" />', ['#fff']]
  ])('flags the color literals of %s: %s', (filePath, source, expected) => {
    expect(matches(filePath, source)).toEqual(expected);
  });

  it.each([
    ['src/a.tsx', '<a href="#bed">x</a>'],
    ['src/a.tsx', '<Link to="/plants#top" />'],
    ['src/a.tsx', '<p>white</p>'],
    ['src/a.ts', "const NAME = 'tomato plant';"],
    ['src/a.ts', "const LINK = { hash: '#add' };"],
    ['src/a.ts', '// #fff\nconst white = 1;'],
    ['src/a.ts', "const S = { border: '1px solid red' };"],
    ['src/a.ts', "const S: Options = { border: '1px solid red' };"],
    ['src/a.ts', "call({ border: '1px solid red' });"],
    ['src/a.ts', "const LINK = { ['href']: '#bed' };"],
    ['src/a.md', 'color: #fff']
  ])('does not flag %s: %s', (filePath, source) => {
    expect(matches(filePath, source)).toEqual([]);
  });

  it('reports the position of the literal inside the string', () => {
    expect(findColorLiterals('src/a.ts', "const C = '#fff';")).toEqual([
      { line: 1, column: 12, match: '#fff' }
    ]);
  });
});

describe('findColorLiterals in index.html', () => {
  it('flags style attributes, style blocks and theme color', () => {
    const source = [
      '<meta name="theme-color" content="#133e2b" />',
      '<style>body { color: black; }</style>',
      '<div style="background: #fff"></div>',
      '<a href="#main">x</a>'
    ].join('\n');

    expect(findColorLiterals('index.html', source)).toEqual([
      { line: 1, column: 35, match: '#133e2b' },
      { line: 2, column: 22, match: 'black' },
      { line: 3, column: 25, match: '#fff' }
    ]);
  });

  it('ignores a theme color meta without content', () => {
    expect(
      findColorLiterals('index.html', '<meta name="theme-color" />')
    ).toEqual([]);
  });
});

describe('selectColorCheckFiles', () => {
  it('keeps sources and index.html and excludes tokens, tests and scripts', () => {
    expect(
      selectColorCheckFiles([
        'src/styles/tokens.css',
        'src/shared/components/Icon/iconPaths.tsx',
        'src/shared/components/Badge/Badge.css',
        'src/app/router.tsx',
        'src/main.ts',
        'src/assets/logo.svg',
        'tests/scripts/colorLiterals.test.ts',
        'scripts/colorLiterals.ts',
        'index.html',
        'docs/index.html'
      ])
    ).toEqual([
      'index.html',
      'src/app/router.tsx',
      'src/main.ts',
      'src/shared/components/Badge/Badge.css'
    ]);
  });
});
