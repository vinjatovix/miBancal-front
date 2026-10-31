import { describe, it, expect, vi, afterEach } from 'vitest';
import { reportMissingTranslation } from '../../../src/shared/observability/reportMissingTranslation';

describe('reportMissingTranslation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns once with the received path', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    reportMissingTranslation('plant.calendar.seasonValues.monsoon');

    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0][0])).toContain(
      'plant.calendar.seasonValues.monsoon'
    );
  });
});
