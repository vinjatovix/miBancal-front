import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PlantLikeButton } from '../../../../../src/pages/plants/PlantDetail/components/PlantLikeButton/PlantLikeButton';

vi.mock('../../../../../src/pages/plants/hooks/usePlantLike', () => ({
  usePlantLike: vi.fn().mockReturnValue({ data: { liked: false } })
}));

vi.mock('../../../../../src/pages/plants/hooks/useTogglePlantLike', () => ({
  useTogglePlantLike: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isPending: false
  })
}));

function NavigationSpy() {
  const location = useLocation();

  return (
    <div>
      <span data-testid="target-path">{location.pathname}</span>
      <span data-testid="target-state">{JSON.stringify(location.state)}</span>
    </div>
  );
}

describe('PlantLikeButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.scrollY = 0;
  });

  it('redirects unauthenticated user to login with from location and scrollY state', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, 'scrollY', { value: 650, writable: true });

    render(
      <MemoryRouter initialEntries={['/plants/tomate-cherry']}>
        <Routes>
          <Route
            path="/plants/tomate-cherry"
            element={<PlantLikeButton plantId="plant-1" likesCount={5} />}
          />
          <Route path="/login" element={<NavigationSpy />} />
        </Routes>
      </MemoryRouter>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByTestId('target-path').textContent).toBe('/login');
    expect(screen.getByTestId('target-state').textContent).toContain(
      '"pathname":"/plants/tomate-cherry"'
    );
    expect(screen.getByTestId('target-state').textContent).toContain(
      '"scrollY":650'
    );
  });
});
