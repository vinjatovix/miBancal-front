import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useScrollRestore } from '../../../src/components/layout/useScrollRestore';
import { reportUnexpectedError } from '../../../src/shared/observability/reportUnexpectedError';

const { navigateOverride } = vi.hoisted(() => ({
  navigateOverride: { impl: null as null | ((...args: unknown[]) => unknown) }
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => {
      const actualNavigate = actual.useNavigate();
      return navigateOverride.impl ?? actualNavigate;
    }
  };
});

vi.mock(
  '../../../src/shared/observability/reportUnexpectedError',
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import('../../../src/shared/observability/reportUnexpectedError')
    >()),
    reportUnexpectedError: vi.fn()
  })
);

function TestConsumer() {
  useScrollRestore();
  const location = useLocation();

  return (
    <div>
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="state">{JSON.stringify(location.state)}</span>
    </div>
  );
}

describe('useScrollRestore', () => {
  beforeEach(() => {
    vi.mocked(window.scrollTo).mockClear();
    navigateOverride.impl = null;
    vi.mocked(reportUnexpectedError).mockClear();
  });

  it('scrolls instantly to restoreScrollY when present in location state', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/plants',
            state: { restoreScrollY: 450 }
          }
        ]}
      >
        <TestConsumer />
      </MemoryRouter>
    );

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 450,
      behavior: 'instant'
    });
  });

  it('does not scroll when restoreScrollY is absent', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/plants',
            state: { otherKey: 'value' }
          }
        ]}
      >
        <TestConsumer />
      </MemoryRouter>
    );

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it.each([
    ['NaN', Number.NaN],
    ['negative number', -100],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['string value', '450'],
    ['null', null]
  ])('does not scroll when restoreScrollY is invalid (%s)', (_, invalidY) => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/plants',
            state: { restoreScrollY: invalidY }
          }
        ]}
      >
        <TestConsumer />
      </MemoryRouter>
    );

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('clears restoreScrollY from history state after restoring scroll', () => {
    const { getByTestId } = render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/plants',
            state: { restoreScrollY: 450, preservedData: 'abc' }
          }
        ]}
      >
        <TestConsumer />
      </MemoryRouter>
    );

    expect(getByTestId('state').textContent).toBe(
      JSON.stringify({ preservedData: 'abc' })
    );
  });

  it('reports the error when navigation rejects', async () => {
    const navigationError = new Error('navigation failed');
    navigateOverride.impl = vi.fn(() => Promise.reject(navigationError));

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/plants',
            state: { restoreScrollY: 450 }
          }
        ]}
      >
        <TestConsumer />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(reportUnexpectedError).toHaveBeenCalledWith(
        expect.objectContaining({ section: 'scroll-restore' }),
        navigationError
      )
    );
  });
});
