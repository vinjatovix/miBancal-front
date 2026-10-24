import { describe, expect, it } from 'vitest';

import {
  CSS_BUDGET_GZIP,
  JS_BUDGET_GZIP,
  budgetFindings,
  eagerFiles
} from '../../scripts/bundleBudget';

const manifest = {
  'index.html': {
    file: 'assets/index-entry.js',
    isEntry: true,
    imports: ['_shared.js'],
    dynamicImports: ['src/pages/Lazy.tsx'],
    css: ['assets/index.css']
  },
  '_shared.js': {
    file: 'assets/shared.js',
    css: ['assets/shared.css']
  },
  'src/pages/Lazy.tsx': {
    file: 'assets/lazy.js',
    isDynamicEntry: true,
    css: ['assets/lazy.css']
  }
};

describe('eagerFiles', () => {
  it('collects the entry chunk and its transitive static imports', () => {
    expect(eagerFiles(manifest).js).toEqual([
      'assets/index-entry.js',
      'assets/shared.js'
    ]);
  });

  it('collects css from eager chunks only', () => {
    expect(eagerFiles(manifest).css).toEqual([
      'assets/index.css',
      'assets/shared.css'
    ]);
  });

  it('excludes dynamically imported (lazy) chunks and their css', () => {
    const files = eagerFiles(manifest);

    expect(files.js).not.toContain('assets/lazy.js');
    expect(files.css).not.toContain('assets/lazy.css');
  });
});

describe('budgetFindings', () => {
  it('returns no findings when both sizes are within budget', () => {
    expect(
      budgetFindings({ js: JS_BUDGET_GZIP, css: CSS_BUDGET_GZIP })
    ).toEqual([]);
  });

  it('reports JS when it exceeds its budget', () => {
    const findings = budgetFindings({ js: JS_BUDGET_GZIP + 1, css: 0 });

    expect(findings).toHaveLength(1);
    expect(findings[0].message).toContain('JS');
  });

  it('reports CSS when it exceeds its budget', () => {
    const findings = budgetFindings({ js: 0, css: CSS_BUDGET_GZIP + 1 });

    expect(findings).toHaveLength(1);
    expect(findings[0].message).toContain('CSS');
  });

  it('reports both types when both exceed their budgets', () => {
    const findings = budgetFindings({
      js: JS_BUDGET_GZIP + 1,
      css: CSS_BUDGET_GZIP + 1
    });

    expect(findings).toHaveLength(2);
  });
});
