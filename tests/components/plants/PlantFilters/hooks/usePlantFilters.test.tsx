import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { usePlantFilters } from '../../../../../src/components/plants/PlantFilters/hooks/usePlantFilters';

function wrapperEmpty({ children }: { children: React.ReactNode }) {
  return <MemoryRouter initialEntries={['/plants']}>{children}</MemoryRouter>;
}

function wrapperWithParams({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter
      initialEntries={[
        '/plants?page=3&soilPh=6&lightHoursMin=8&spacingCm=20&soilAvailableDepthCm=30'
      ]}
    >
      {children}
    </MemoryRouter>
  );
}

const FILTER_COALESCE_DELAY_MS = 300;

function flushFilters() {
  act(() => {
    vi.advanceTimersByTime(FILTER_COALESCE_DELAY_MS);
  });
}

describe('usePlantFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exposes default params (empty URL)', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperEmpty
    });

    expect(result.current.hemisphere).toBe('north');

    expect(result.current.getParam('lifeCycle')).toBe('');
    expect(result.current.getParam('sowingMethod')).toBe('');
    expect(result.current.getParam('lightType')).toBe('');
    expect(result.current.getParam('rootSystem')).toBe('');

    expect(result.current.family).toBe('');

    expect(result.current.soilPh.value).toBe(null);
    expect(result.current.lightHours.value).toBe(null);
    expect(result.current.spacing.value).toBe(null);
    expect(result.current.soilDepth.value).toBe(null);
  });

  it('initializes sliders from URL params', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperWithParams
    });

    expect(result.current.soilPh.value).toBe(6);
    expect(result.current.lightHours.value).toBe(8);
    expect(result.current.spacing.value).toBe(20);
    expect(result.current.soilDepth.value).toBe(30);
  });

  it('setParam updates query params', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperEmpty
    });

    act(() => {
      result.current.setParam('family', 'abc');
    });
    flushFilters();

    expect(result.current.getParam('family')).toBe('abc');
  });

  it('setParamNow updates the URL synchronously without waiting the debounce', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperEmpty
    });

    act(() => {
      result.current.setParamNow('lifeCycle', 'annual');
    });

    expect(result.current.getParam('lifeCycle')).toBe('annual');
  });

  it('setFamily updates param correctly', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperEmpty
    });

    act(() => {
      result.current.setFamily('family-1');
    });
    flushFilters();

    expect(result.current.getParam('family')).toBe('family-1');
  });

  it('setHemisphere updates param', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperEmpty
    });

    act(() => {
      result.current.setHemisphere('south');
    });
    flushFilters();

    expect(result.current.getParam('hemisphere')).toBe('south');
  });

  it('clearFilters resets URL + sliders + search', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperWithParams
    });

    act(() => {
      result.current.setParam('family', 'abc');
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.getParam('family')).toBe('');
    expect(result.current.getParam('identity')).toBe('');

    expect(result.current.soilPh.value).toBe(null);
    expect(result.current.lightHours.value).toBe(null);
    expect(result.current.spacing.value).toBe(null);
    expect(result.current.soilDepth.value).toBe(null);
  });

  it('sets page param when setParam is used', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperEmpty
    });

    act(() => {
      result.current.setParam('page', '1');
    });
    flushFilters();

    expect(result.current.getParam('page')).toBe('1');
  });

  it('resets page when any filter changes (bug regression test)', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperWithParams
    });

    act(() => {
      result.current.setParam('family', 'abc');
    });
    flushFilters();

    expect(result.current.getParam('family')).toBe('abc');

    expect(result.current.getParam('page')).toBe('');
  });

  it.each([
    ['changing', '?page=3&lifeCycle=annual', 'lifeCycle', 'perennial'],
    ['adding', '?page=3', 'lifeCycle', 'annual'],
    ['removing', '?page=3&lifeCycle=annual', 'lifeCycle', '']
  ])('%s a filter removes page', (_, search, key, value) => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[`/plants${search}`]}>
          {children}
        </MemoryRouter>
      )
    });

    act(() => {
      result.current.setParam(key, value);
    });
    flushFilters();

    expect(result.current.getParam(key)).toBe(value);
    expect(result.current.getParam('page')).toBe('');
  });

  function renderWithUrl(url: string) {
    return renderHook(() => usePlantFilters(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
      )
    });
  }

  it.each([
    ['/plants', undefined, undefined],
    ['/plants?edible=true&toxic=false', 'true', 'false'],
    ['/plants?edible=%20false%20', 'false', undefined],
    ['/plants?edible=quiza&toxic=FALSE', undefined, undefined]
  ])('reads edible and toxic from %s', (url, edible, toxic) => {
    const { result } = renderWithUrl(url);

    expect(result.current.edible).toBe(edible);
    expect(result.current.toxic).toBe(toxic);
  });

  it('choosing a boolean value resets the page and clearing removes it', () => {
    const { result } = renderWithUrl('/plants?page=3');

    act(() => {
      result.current.setParam('edible', 'true');
    });
    flushFilters();

    expect(result.current.edible).toBe('true');
    expect(result.current.getParam('page')).toBe('');

    act(() => {
      result.current.setParam('edible', undefined);
    });
    flushFilters();

    expect(result.current.edible).toBeUndefined();
  });

  it('clearFilters resets edible and toxic to any', () => {
    const { result } = renderWithUrl('/plants?edible=true&toxic=false');

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.edible).toBeUndefined();
    expect(result.current.toxic).toBeUndefined();
  });

  it('clearing individual slider filter removes its parameter and resets page', () => {
    const { result } = renderHook(() => usePlantFilters(), {
      wrapper: wrapperWithParams
    });

    act(() => {
      result.current.setParam('soilPh', undefined);
      result.current.soilPh.setValue(null);
    });
    flushFilters();

    expect(result.current.getParam('soilPh')).toBe('');
    expect(result.current.soilPh.value).toBe(null);
    expect(result.current.getParam('page')).toBe('');
  });

  describe('search text synced with the URL', () => {
    function useFiltersWithNavigation() {
      return { filters: usePlantFilters(), navigate: useNavigate() };
    }

    function renderWithSearch(route: string) {
      return renderHook(() => useFiltersWithNavigation(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        )
      });
    }

    it('follows the identity param when it changes from outside', () => {
      const { result } = renderWithSearch('/plants?identity=tomate');
      expect(result.current.filters.textState.identity).toBe('tomate');

      act(() => {
        result.current.navigate('/plants?limit=50');
      });

      expect(result.current.filters.textState.identity).toBe('');
    });

    it('flushes pending text onto the latest URL after an external navigation', () => {
      const { result } = renderWithSearch('/plants');

      act(() => {
        result.current.filters.handleTextChange('identity', 'lech');
      });
      act(() => {
        result.current.navigate('/plants?tab=favorites');
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filters.getParam('identity')).toBe('lech');
      expect(result.current.filters.getParam('tab')).toBe('favorites');
    });

    it('keeps what is typed inside the debounce window', () => {
      const { result } = renderWithSearch('/plants');

      act(() => {
        result.current.filters.handleTextChange('identity', 'lech');
      });
      act(() => {
        result.current.filters.setHemisphere('south');
      });

      expect(result.current.filters.textState.identity).toBe('lech');

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.filters.getParam('identity')).toBe('lech');
      expect(result.current.filters.textState.identity).toBe('lech');
    });
  });
});
