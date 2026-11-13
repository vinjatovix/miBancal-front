import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlantListRequest } from '../../../../src/services/plantListQuery';
import { useCatalogScrollReset } from '../../../../src/pages/plants/hooks/useCatalogScrollReset';

const mockUseNavigationType = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    useNavigationType: () => mockUseNavigationType()
  };
});

const BASE_REQUEST: PlantListRequest = {
  pagination: { page: 1, limit: 25 },
  sort: { field: 'name', direction: 'asc' },
  filters: {}
};

describe('useCatalogScrollReset', () => {
  beforeEach(() => {
    mockUseNavigationType.mockReturnValue('PUSH');
    vi.mocked(window.scrollTo).mockClear();
  });

  it('no invoca window.scrollTo en el montaje inicial', () => {
    renderHook(() => useCatalogScrollReset(BASE_REQUEST));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('no invoca window.scrollTo cuando los parámetros no cambian aunque cambie la referencia del objeto', () => {
    const { rerender } = renderHook(
      (request: PlantListRequest) => useCatalogScrollReset(request),
      { initialProps: BASE_REQUEST }
    );

    rerender({
      pagination: { page: 1, limit: 25 },
      sort: { field: 'name', direction: 'asc' },
      filters: {}
    });

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it.each([
    {
      parameter: 'página',
      updated: {
        ...BASE_REQUEST,
        pagination: { page: 2, limit: 25 }
      }
    },
    {
      parameter: 'filtros',
      updated: {
        ...BASE_REQUEST,
        filters: { family: '678efda2-ac3d-4623-81cd-fc1d0ab80315' }
      }
    },
    {
      parameter: 'campo de ordenación',
      updated: {
        ...BASE_REQUEST,
        sort: { field: 'scientificName' as const, direction: 'asc' as const }
      }
    },
    {
      parameter: 'dirección de ordenación',
      updated: {
        ...BASE_REQUEST,
        sort: { field: 'name' as const, direction: 'desc' as const }
      }
    },
    {
      parameter: 'tamaño de página',
      updated: {
        ...BASE_REQUEST,
        pagination: { page: 1, limit: 50 }
      }
    }
  ])(
    'invoca window.scrollTo(0, 0) ante cambio de $parameter',
    ({ updated }) => {
      const { rerender } = renderHook(
        (request: PlantListRequest) => useCatalogScrollReset(request),
        { initialProps: BASE_REQUEST }
      );

      rerender(updated);

      expect(window.scrollTo).toHaveBeenCalledTimes(1);
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    }
  );

  it('no invoca window.scrollTo cuando los tipos de filtros contienen las mismas claves en distinto orden', () => {
    const requestWithOrderA: PlantListRequest = {
      ...BASE_REQUEST,
      filters: {
        identity: 'rosa',
        family: '678efda2-ac3d-4623-81cd-fc1d0ab80315'
      }
    };
    const requestWithOrderB: PlantListRequest = {
      ...BASE_REQUEST,
      filters: {
        family: '678efda2-ac3d-4623-81cd-fc1d0ab80315',
        identity: 'rosa'
      }
    };
    const { rerender } = renderHook(
      (request: PlantListRequest) => useCatalogScrollReset(request),
      { initialProps: requestWithOrderA }
    );

    rerender(requestWithOrderB);

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('no invoca window.scrollTo cuando los arrays de filtros contienen los mismos valores en distinto orden', () => {
    const requestWithArrayA: PlantListRequest = {
      ...BASE_REQUEST,
      filters: {
        sowingMonths: [5, 3]
      }
    };
    const requestWithArrayB: PlantListRequest = {
      ...BASE_REQUEST,
      filters: {
        sowingMonths: [3, 5]
      }
    };
    const { rerender } = renderHook(
      (request: PlantListRequest) => useCatalogScrollReset(request),
      { initialProps: requestWithArrayA }
    );

    rerender(requestWithArrayB);

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('no invoca window.scrollTo cuando el tipo de navegación es POP', () => {
    const { rerender } = renderHook(
      (request: PlantListRequest) => useCatalogScrollReset(request),
      { initialProps: BASE_REQUEST }
    );

    mockUseNavigationType.mockReturnValue('POP');
    rerender({
      pagination: { page: 2, limit: 25 },
      sort: { field: 'name', direction: 'asc' },
      filters: {}
    });

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('invoca window.scrollTo(0, 0) en una navegación PUSH posterior a una navegación POP', () => {
    const { rerender } = renderHook(
      (request: PlantListRequest) => useCatalogScrollReset(request),
      { initialProps: BASE_REQUEST }
    );
    mockUseNavigationType.mockReturnValue('POP');
    rerender({
      ...BASE_REQUEST,
      pagination: { page: 2, limit: 25 }
    });
    vi.mocked(window.scrollTo).mockClear();
    mockUseNavigationType.mockReturnValue('PUSH');

    rerender({
      ...BASE_REQUEST,
      pagination: { page: 3, limit: 25 }
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('invoca window.scrollTo(0, 0) cuando el tipo de navegación es REPLACE y los parámetros cambian', () => {
    const { rerender } = renderHook(
      (request: PlantListRequest) => useCatalogScrollReset(request),
      { initialProps: BASE_REQUEST }
    );
    mockUseNavigationType.mockReturnValue('REPLACE');

    rerender({
      ...BASE_REQUEST,
      pagination: { page: 2, limit: 25 }
    });

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
