import axe from 'axe-core';

export interface AxeOptions {
  theme?: 'light' | 'dark';
}

export async function expectNoAxeViolations(
  container: Element,
  options?: AxeOptions
): Promise<void> {
  const theme = options?.theme ?? 'light';
  const previousTheme = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', theme);

  try {
    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: [
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
          'wcag22aa',
          'best-practice'
        ]
      },
      rules: {
        'color-contrast': { enabled: false },
        'color-contrast-enhanced': { enabled: false }
      }
    });

    if (results.violations.length > 0) {
      const errorMessages = results.violations.map(
        (violation) =>
          `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`
      );
      throw new Error(
        `A11y violations found (${results.violations.length}):\n${errorMessages.join('\n')}`
      );
    }
  } finally {
    if (previousTheme === null) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', previousTheme);
    }
  }
}
