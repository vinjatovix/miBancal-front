import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { t } from '../../../../src/i18n/core/t';
import { NotFound } from '../../../../src/shared/components/NotFound/NotFound';

function renderNotFound() {
  const router = createMemoryRouter(
    [
      {
        path: '/plants/:id',
        element: (
          <NotFound
            titleKey="notFound.plant.title"
            messageKey="notFound.plant.message"
            backTo="/plants"
            backLabelKey="notFound.backToPlants"
          />
        )
      }
    ],
    { initialEntries: ['/plants/no-existe'] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('NotFound', () => {
  it('renders the title, the message and a link back', () => {
    renderNotFound();

    expect(
      screen.getByRole('heading', { level: 1, name: t('notFound.plant.title') })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      t('notFound.plant.message')
    );
    expect(
      screen.getByRole('link', { name: t('notFound.backToPlants') })
    ).toHaveAttribute('href', '/plants');
  });

  it('does not navigate when mounted', () => {
    const router = renderNotFound();

    expect(router.state.location.pathname).toBe('/plants/no-existe');
    expect(router.state.historyAction).toBe('POP');
  });
});
