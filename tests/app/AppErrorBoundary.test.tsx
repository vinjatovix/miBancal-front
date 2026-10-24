import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppErrorBoundary } from '../../src/app/AppErrorBoundary';
import { t } from '../../src/i18n/core/t';
import {
  getUnexpectedErrorReports,
  silenceConsoleError,
  ThrowingChild
} from '../test-utils/unexpectedErrorReports';

const errorSpy = silenceConsoleError();

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    errorSpy.mockClear();
  });

  it('renders its children when nothing throws', () => {
    render(
      <AppErrorBoundary>
        <p>Aplicación</p>
      </AppErrorBoundary>
    );

    expect(screen.getByText('Aplicación')).toBeInTheDocument();
  });

  it('shows the app error screen with reload and a link home', async () => {
    const reload = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      reload
    });

    render(
      <AppErrorBoundary>
        <ThrowingChild />
      </AppErrorBoundary>
    );

    expect(
      screen.getByRole('heading', { name: t('errors.app.title') })
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      t('errors.app.message')
    );
    expect(
      screen.getByRole('link', { name: t('errors.actions.goHome') })
    ).toHaveAttribute('href', '/');
    await userEvent.click(
      screen.getByRole('button', { name: t('errors.actions.reload') })
    );
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('reports the failure once as an app section', () => {
    render(
      <AppErrorBoundary>
        <ThrowingChild />
      </AppErrorBoundary>
    );

    expect(getUnexpectedErrorReports(errorSpy)).toEqual([
      expect.objectContaining({ kind: 'render', section: 'app' })
    ]);
  });
});
