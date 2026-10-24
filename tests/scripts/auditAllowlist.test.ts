import { describe, expect, it } from 'vitest';

import {
  highSeverityAdvisories,
  unallowedAdvisories
} from '../../scripts/auditAllowlist';

const auditJson = {
  auditReportVersion: 2,
  vulnerabilities: {
    'pkg-high': {
      name: 'pkg-high',
      severity: 'high',
      via: [
        {
          source: 1001,
          name: 'pkg-high',
          severity: 'high',
          url: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc',
          title: 'High severity issue'
        }
      ]
    },
    'pkg-critical': {
      name: 'pkg-critical',
      severity: 'critical',
      via: [
        {
          source: 1002,
          name: 'pkg-critical',
          severity: 'critical',
          url: 'https://github.com/advisories/GHSA-dddd-eeee-ffff',
          title: 'Critical severity issue'
        }
      ]
    },
    'pkg-moderate': {
      name: 'pkg-moderate',
      severity: 'moderate',
      via: [
        {
          source: 1003,
          name: 'pkg-moderate',
          severity: 'moderate',
          url: 'https://github.com/advisories/GHSA-gggg-hhhh-iiii',
          title: 'Moderate severity issue'
        }
      ]
    },
    'pkg-transitive': {
      name: 'pkg-transitive',
      severity: 'high',
      via: ['pkg-high']
    }
  }
};

describe('highSeverityAdvisories', () => {
  it('returns only high and critical advisory objects', () => {
    const advisories = highSeverityAdvisories(auditJson);

    expect(advisories.map((advisory) => advisory.source)).toEqual([1001, 1002]);
  });

  it('ignores string via entries that reference other packages', () => {
    const advisories = highSeverityAdvisories(auditJson);

    expect(
      advisories.every((advisory) => typeof advisory.source === 'number')
    ).toBe(true);
  });

  it('deduplicates advisories sharing the same source', () => {
    const duplicated = {
      vulnerabilities: {
        a: {
          via: [
            { source: 1, severity: 'high', url: 'u', name: 'a', title: 't' }
          ]
        },
        b: {
          via: [
            { source: 1, severity: 'high', url: 'u', name: 'a', title: 't' }
          ]
        }
      }
    };

    expect(highSeverityAdvisories(duplicated)).toHaveLength(1);
  });

  it('returns an empty array when there are no vulnerabilities', () => {
    expect(highSeverityAdvisories({ vulnerabilities: {} })).toEqual([]);
  });
});

describe('unallowedAdvisories', () => {
  const advisories = highSeverityAdvisories(auditJson);

  it('discards advisories allowlisted by numeric source id', () => {
    const allowlist = [
      { id: '1001', justification: 'no fix yet', issue: '#42' }
    ];

    expect(
      unallowedAdvisories(advisories, allowlist).map((a) => a.source)
    ).toEqual([1002]);
  });

  it('discards advisories allowlisted by GHSA id from the url', () => {
    const allowlist = [
      {
        id: 'GHSA-dddd-eeee-ffff',
        justification: 'accepted',
        issue: 'https://example.com/issue/7'
      }
    ];

    expect(
      unallowedAdvisories(advisories, allowlist).map((a) => a.source)
    ).toEqual([1001]);
  });

  it('returns all advisories when the allowlist is empty', () => {
    expect(unallowedAdvisories(advisories, [])).toHaveLength(2);
  });

  it('returns an empty array when every advisory is allowlisted', () => {
    const allowlist = [
      { id: '1001', justification: 'x', issue: '#1' },
      { id: 'GHSA-dddd-eeee-ffff', justification: 'y', issue: '#2' }
    ];

    expect(unallowedAdvisories(advisories, allowlist)).toEqual([]);
  });
});
