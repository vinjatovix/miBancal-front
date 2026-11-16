import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from './axe';

describe('expectNoAxeViolations', () => {
  it.each(['light', 'dark'] as const)(
    'passes when container has no accessibility violations in %s theme',
    async (theme) => {
      const { container } = render(<button type="button">Guardar</button>);

      await expect(
        expectNoAxeViolations(container, { theme })
      ).resolves.toBeUndefined();
    }
  );

  it('rejects when container contains an accessibility violation like image without alt', async () => {
    const { container } = render(<img src="test.jpg" />);

    await expect(
      expectNoAxeViolations(container, { theme: 'light' })
    ).rejects.toThrow();
  });
});
