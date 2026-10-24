import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryRouter,
  Link,
  MemoryRouter,
  RouterProvider
} from 'react-router-dom';

import { UnsavedChangesGuard } from '../../../../src/shared/components/UnsavedChangesGuard/UnsavedChangesGuard';

const PROMPT = 'Hay cambios sin guardar. ¿Deseas descartarlos y salir?';

function renderInDataRouter(when: boolean) {
  const router = createMemoryRouter(
    [
      {
        path: '/form',
        element: (
          <>
            <UnsavedChangesGuard when={when} prompt={PROMPT} />
            <Link to="/other">salir</Link>
          </>
        )
      },
      { path: '/other', element: <div>OTHER</div> }
    ],
    { initialEntries: ['/form'] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('UnsavedChangesGuard', () => {
  it('no bloquea la navegación cuando no hay cambios', async () => {
    const user = userEvent.setup();
    renderInDataRouter(false);

    await user.click(screen.getByRole('link', { name: 'salir' }));

    expect(screen.getByText('OTHER')).toBeInTheDocument();
  });

  it('bloquea la navegación con cambios y permite seguir editando', async () => {
    const user = userEvent.setup();
    const router = renderInDataRouter(true);

    await user.click(screen.getByRole('link', { name: 'salir' }));
    await user.click(
      await screen.findByRole('button', { name: 'Continuar editando' })
    );

    expect(router.state.location.pathname).toBe('/form');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('deja salir al confirmar el descarte', async () => {
    const user = userEvent.setup();
    renderInDataRouter(true);

    await user.click(screen.getByRole('link', { name: 'salir' }));
    await user.click(
      await screen.findByRole('button', { name: 'Descartar cambios' })
    );

    expect(await screen.findByText('OTHER')).toBeInTheDocument();
  });

  it('avisa antes de cerrar o recargar la pestaña con cambios', () => {
    render(
      <MemoryRouter>
        <UnsavedChangesGuard when prompt={PROMPT} />
      </MemoryRouter>
    );
    const event = new Event('beforeunload', { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('no avisa al cerrar la pestaña sin cambios', () => {
    render(
      <MemoryRouter>
        <UnsavedChangesGuard when={false} prompt={PROMPT} />
      </MemoryRouter>
    );
    const event = new Event('beforeunload', { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('funciona sin router de datos (solo beforeunload)', () => {
    expect(() =>
      render(
        <MemoryRouter>
          <UnsavedChangesGuard when prompt={PROMPT} />
        </MemoryRouter>
      )
    ).not.toThrow();
  });
});
