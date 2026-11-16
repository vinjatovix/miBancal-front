import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import FamilySelect from '../../../src/components/plants/PlantFilters/components/FamilySelect/FamilySelect';
import FamilyList from '../../../src/pages/families/FamilyList';
import { useFamilies } from '../../../src/shared/hooks/useFamilies';
import { getFamilyList } from '../../../src/services/families.service';
import type { FamilyListItem } from '../../../src/types/Family';

import { listFamilyItems } from '../../fixtures/families/listFamilyItems';
import { createTestQueryClient } from '../../test-utils/createTestQueryClient';

vi.mock('../../../src/services/families.service', () => ({
  getFamilyList: vi.fn()
}));

const mockedGetFamilyList = vi.mocked(getFamilyList);

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function renderUseFamilies(queryClient = createTestQueryClient()) {
  return renderHook(() => useFamilies(), {
    wrapper: createWrapper(queryClient)
  });
}

describe('useFamilies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expone isPending mientras la petición está pendiente', () => {
    mockedGetFamilyList.mockImplementation(
      () => new Promise<FamilyListItem[]>(() => {})
    );

    const { result } = renderUseFamilies();

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('devuelve las familias del listado y pide una sola vez', async () => {
    mockedGetFamilyList.mockResolvedValue(listFamilyItems);

    const { result } = renderUseFamilies();

    await waitFor(() => {
      expect(result.current.data).toEqual(listFamilyItems);
    });
    expect(result.current.error).toBeNull();
    expect(mockedGetFamilyList).toHaveBeenCalledOnce();
  });

  it('expone el error sin datos si la petición falla', async () => {
    const failure = new Error('Failed to load families');
    mockedGetFamilyList.mockRejectedValue(failure);

    const { result } = renderUseFamilies();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(failure);
    expect(result.current.data).toBeUndefined();
  });
});

describe('caché compartida', () => {
  const [firstFamily] = listFamilyItems;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetFamilyList.mockResolvedValue(listFamilyItems);
  });

  function renderWithClient(queryClient: QueryClient, ui: React.ReactNode) {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  async function expectSelectWithFamilies() {
    expect(
      await screen.findByRole('option', { name: 'Amarilidáceas' })
    ).toHaveValue(firstFamily.id);
  }

  async function expectListWithFamilies() {
    expect(
      await screen.findByRole('link', {
        name: new RegExp(firstFamily.scientificName)
      })
    ).toHaveAttribute('href', `/families/${firstFamily.id}`);
  }

  it('el selector y el listado montados a la vez hacen una sola petición', async () => {
    renderWithClient(
      createTestQueryClient(),
      <>
        <FamilySelect value="" onChange={vi.fn()} />
        <FamilyList />
      </>
    );

    await expectSelectWithFamilies();
    await expectListWithFamilies();
    expect(mockedGetFamilyList).toHaveBeenCalledOnce();
  });

  it('navegar del selector al listado reutiliza la petición', async () => {
    const queryClient = createTestQueryClient();
    const { unmount } = renderWithClient(
      queryClient,
      <FamilySelect value="" onChange={vi.fn()} />
    );
    await expectSelectWithFamilies();
    unmount();

    renderWithClient(queryClient, <FamilyList />);

    await expectListWithFamilies();
    expect(mockedGetFamilyList).toHaveBeenCalledOnce();
  });
});
