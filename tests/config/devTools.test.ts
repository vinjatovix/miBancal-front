import { describe, expect, it } from 'vitest';
import { IS_DEV_TOOLS } from '../../src/config/devTools';

describe('IS_DEV_TOOLS', () => {
  it('reflects import.meta.env.DEV as a boolean', () => {
    const expected = Boolean(import.meta.env.DEV);

    expect(IS_DEV_TOOLS).toBe(expected);
  });
});
