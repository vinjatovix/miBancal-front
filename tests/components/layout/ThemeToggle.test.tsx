import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ThemeToggle from '../../../src/components/layout/ThemeToggle/ThemeToggle';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';
import type { ThemePreference } from '../../../src/shared/theme/types';

function renderThemeToggle(initialPreference?: ThemePreference) {
  return render(
    <ThemeProvider initialPreference={initialPreference}>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  it.each([
    [
      'light' as ThemePreference,
      'Tema claro activo. Pulsar para cambiar a tema oscuro.'
    ],
    [
      'dark' as ThemePreference,
      'Tema oscuro activo. Pulsar para cambiar a tema claro.'
    ]
  ])(
    'renders button with accessible label and decorative icon for preference %s',
    (preference, expectedLabel) => {
      renderThemeToggle(preference);

      const button = screen.getByRole('button', { name: expectedLabel });
      const icon = button.querySelector('svg');

      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', expectedLabel);
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveClass('theme-toggle');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon?.querySelectorAll('path').length).toBeGreaterThan(0);
    }
  );

  it('toggles theme preference between light and dark when clicked', async () => {
    const user = userEvent.setup();
    renderThemeToggle('light');

    const lightButton = screen.getByRole('button', {
      name: 'Tema claro activo. Pulsar para cambiar a tema oscuro.'
    });
    await user.click(lightButton);

    const darkButton = screen.getByRole('button', {
      name: 'Tema oscuro activo. Pulsar para cambiar a tema claro.'
    });
    expect(darkButton).toBeInTheDocument();

    await user.click(darkButton);

    expect(
      screen.getByRole('button', {
        name: 'Tema claro activo. Pulsar para cambiar a tema oscuro.'
      })
    ).toBeInTheDocument();
  });
});
