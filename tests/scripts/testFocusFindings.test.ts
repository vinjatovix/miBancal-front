import { describe, expect, it } from 'vitest';

import { findFocusFindings } from '../../scripts/testFocusFindings';
import {
  cleanSource,
  focusInsideStringOrComment,
  multipleOnly,
  onlyWithReferenceAbove,
  skipWithNumberSameLine,
  skipWithReferencePreviousLine,
  skipWithReferenceTwoLinesAbove,
  skipWithUrlSameLine,
  skipWithoutReference
} from './fixtures/testFocusSources';

describe('findFocusFindings - focus', () => {
  it('reports focus usage regardless of any reference', () => {
    const findings = findFocusFindings(onlyWithReferenceAbove);

    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(2);
    expect(findings[0].message).toContain('only');
  });

  it('reports describe and test focus across multiple occurrences', () => {
    expect(findFocusFindings(multipleOnly)).toHaveLength(2);
  });
});

describe('findFocusFindings - skip', () => {
  it('reports skip without an issue reference', () => {
    const findings = findFocusFindings(skipWithoutReference);

    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(1);
    expect(findings[0].message).toContain('skip');
  });

  it('permits skip with a number reference on the same line', () => {
    expect(findFocusFindings(skipWithNumberSameLine)).toEqual([]);
  });

  it('permits skip with a URL reference on the same line', () => {
    expect(findFocusFindings(skipWithUrlSameLine)).toEqual([]);
  });

  it('permits skip with an issue reference on the previous line', () => {
    expect(findFocusFindings(skipWithReferencePreviousLine)).toEqual([]);
  });

  it('reports skip when the reference is two lines above', () => {
    expect(findFocusFindings(skipWithReferenceTwoLinesAbove)).toHaveLength(1);
  });
});

describe('findFocusFindings - clean source', () => {
  it('returns no findings for tests without focus or skip', () => {
    expect(findFocusFindings(cleanSource)).toEqual([]);
  });

  it('does not flag .only/.skip appearing inside strings or comments', () => {
    expect(findFocusFindings(focusInsideStringOrComment)).toEqual([]);
  });
});
