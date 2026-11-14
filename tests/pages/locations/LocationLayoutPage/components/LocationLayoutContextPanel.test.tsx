import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import LocationLayoutContextPanel from '../../../../../src/pages/locations/LocationLayoutPage/components/LocationLayoutContextPanel';
import type { ResolvedBed } from '../../../../../src/components/beds/layout/utils/layoutTypes';
import type { LayoutEditor } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutEditor';
import type { useLayoutPlantPlacement } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useLayoutPlantPlacement';

type Placement = ReturnType<typeof useLayoutPlantPlacement>;

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

const selectedBed: ResolvedBed = {
  id: 'bed-1',
  name: 'Bancal Norte',
  width: 120,
  height: 240,
  position: { x: 10, y: 20 },
  rotation: 0
};

function buildEditor(overrides: Partial<LayoutEditor> = {}): LayoutEditor {
  return {
    mode: 'position',
    unplacedBeds: [],
    placedBeds: [selectedBed],
    placeBed: vi.fn(),
    deselectBed: vi.fn(),
    renameBedInline: vi.fn(),
    setSelectedRotation: vi.fn(),
    ...overrides
  } as unknown as LayoutEditor;
}

function buildPlacement(): Placement {
  return {
    cancelPalettePlant: vi.fn()
  } as unknown as Placement;
}

describe('LocationLayoutContextPanel in position mode', () => {
  it('does not auto-mount the bed properties panel when a bed is selected', () => {
    render(
      <LocationLayoutContextPanel
        mode="position"
        isPlanting={false}
        isPosition
        selectedBed={selectedBed}
        editor={buildEditor()}
        placement={buildPlacement()}
      />
    );

    expect(
      screen.queryByRole('region', { name: 'Propiedades del bancal' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Propiedades del bancal')
    ).not.toBeInTheDocument();
  });

  it('still renders the unplaced beds tray when beds remain to place', () => {
    render(
      <LocationLayoutContextPanel
        mode="position"
        isPlanting={false}
        isPosition
        selectedBed={selectedBed}
        editor={buildEditor({
          unplacedBeds: [
            {
              id: 'bed-2',
              name: 'Bancal Sur',
              width: 80,
              height: 100,
              position: null,
              rotation: 0
            }
          ]
        })}
        placement={buildPlacement()}
      />
    );

    expect(
      screen.getAllByRole('region', { name: 'Bancales sin colocar' }).length
    ).toBeGreaterThan(0);
  });

  it('renders plant palette as docked panel on the right in landscape orientation', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('landscape'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    );

    const { container } = renderWithClient(
      <LocationLayoutContextPanel
        mode="plants"
        isPlanting={true}
        isPosition={false}
        editor={buildEditor({ mode: 'plants' })}
        placement={buildPlacement()}
        isMobile={true}
      />
    );

    expect(
      container.querySelector('.layout-context-panel__backdrop')
    ).toBeNull();
    const docked = container.querySelector('.layout-context-panel--docked');
    expect(docked).not.toBeNull();

    vi.unstubAllGlobals();
  });

  it('renders plant palette as bottom sheet with backdrop in portrait orientation', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    );

    const { container } = renderWithClient(
      <LocationLayoutContextPanel
        mode="plants"
        isPlanting={true}
        isPosition={false}
        editor={buildEditor({ mode: 'plants' })}
        placement={buildPlacement()}
        isMobile={true}
      />
    );

    expect(
      container.querySelector('.layout-context-panel__backdrop')
    ).not.toBeNull();
    const sheet = container.querySelector('.layout-context-panel--sheet');
    expect(sheet).not.toBeNull();

    vi.unstubAllGlobals();
  });
});
