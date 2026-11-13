import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { t } from '../../src/i18n/core/t';
import NotFoundPage from '../../src/pages/NotFoundPage';
import { renderWithProviders } from '../test-utils/renderWithProviders';

describe('NotFoundPage', () => {
  it('renders the generic not found texts with a link home', () => {
    renderWithProviders(<NotFoundPage />, { route: '/ruta-inventada' });

    expect(
      screen.getByRole('heading', { level: 1, name: t('notFound.title') })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(t('notFound.message'));
    expect(
      screen.getByRole('link', { name: t('notFound.backHome') })
    ).toHaveAttribute('href', '/');
  });
});
