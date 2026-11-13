import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BedVisualizerCanvas from '../../../../src/components/beds/visualizer/BedVisualizerCanvas';
import { DEFAULT_ACTIVE_GRID_LAYERS } from '../../../../src/components/beds/visualizer/utils/bedGridConfig';
import { buildBed } from '../../../fixtures/beds/buildBed';

describe('BedVisualizerCanvas', () => {
  it('renders svg with role img and descriptive aria-label', () => {
    const bed = buildBed({ name: 'Bancal Norte', width: 120, height: 240 });

    render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
      />
    );

    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      'Plano cenital a escala del bancal Bancal Norte, de 240 por 120 centímetros'
    );
  });

  it('renders bed outline rectangle with metric dimensions', () => {
    const bed = buildBed({ width: 120, height: 240 });

    const { container } = render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
      />
    );

    const rect = container.querySelector('.bed-canvas__bed-rect');
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute('width', '240');
    expect(rect).toHaveAttribute('height', '120');
  });

  it('renders dimension lines projection', () => {
    const bed = buildBed({ width: 120, height: 240 });

    render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
      />
    );

    expect(screen.getByText('120 cm')).toBeInTheDocument();
    expect(screen.getByText('240 cm')).toBeInTheDocument();
  });

  it('updates viewBox to match container dimensions reported by ResizeObserver', () => {
    const bed = buildBed({ width: 90, height: 600 });
    let observerCallback: ResizeObserverCallback | undefined;

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback;
      }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
      />
    );

    act(() => {
      observerCallback?.(
        [
          {
            contentRect: {
              width: 1400,
              height: 600,
              top: 0,
              left: 0,
              right: 1400,
              bottom: 600,
              x: 0,
              y: 0,
              toJSON: () => {}
            }
          } as ResizeObserverEntry
        ],
        {} as ResizeObserver
      );
    });

    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('viewBox', '0 0 1400 600');

    vi.unstubAllGlobals();
  });
});
