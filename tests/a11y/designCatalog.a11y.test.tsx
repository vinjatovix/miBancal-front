import { describe, it } from 'vitest';
import DesignSystemPage from '../../src/pages/dev/DesignSystemPage/DesignSystemPage';
import { expectNoAxeViolations } from '../test-utils/axe';
import { renderWithProviders } from '../test-utils/renderWithProviders';

describe('DesignSystemPage a11y', () => {
  it.each(['light', 'dark'] as const)(
    'has no axe violations in %s theme',
    async (theme) => {
      const { container } = renderWithProviders(<DesignSystemPage />);

      await expectNoAxeViolations(container, { theme });
    }
  );
});
