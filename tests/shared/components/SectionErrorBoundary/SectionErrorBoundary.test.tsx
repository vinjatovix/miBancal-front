import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { t } from '../../../../src/i18n/core/t';
import { SectionErrorBoundary } from '../../../../src/shared/components/SectionErrorBoundary/SectionErrorBoundary';
import {
  getUnexpectedErrorReports,
  silenceConsoleError,
  ThrowingChild
} from '../../../test-utils/unexpectedErrorReports';

const errorSpy = silenceConsoleError();

function Page({ failing }: { failing: boolean }) {
  return (
    <div>
      <p>Hermano visible</p>
      <SectionErrorBoundary section="plant.calendar">
        {failing ? <ThrowingChild /> : <p>Contenido de la sección</p>}
      </SectionErrorBoundary>
    </div>
  );
}

describe('SectionErrorBoundary', () => {
  beforeEach(() => {
    errorSpy.mockClear();
    window.history.replaceState(null, '', '/plants/abc');
  });

  it('renders its children without an extra wrapper when nothing throws', () => {
    const { container } = render(
      <SectionErrorBoundary section="plant.calendar">
        <p>Contenido de la sección</p>
      </SectionErrorBoundary>
    );

    expect(container.innerHTML).toBe('<p>Contenido de la sección</p>');
  });

  it('replaces only the failing section with an informative notice', () => {
    render(<Page failing />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      t('errors.section.message')
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Hermano visible')).toBeInTheDocument();
  });

  it('reports the failure once with its section even after rerendering', () => {
    const { rerender } = render(<Page failing />);
    rerender(<Page failing />);

    expect(getUnexpectedErrorReports(errorSpy)).toEqual([
      {
        kind: 'render',
        section: 'plant.calendar',
        route: '/plants/abc',
        error: { name: 'Error', message: 'render failed' }
      }
    ]);
  });
});
