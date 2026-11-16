import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutFloatingToolDock, {
  type LayoutFloatingToolDockProps
} from '../../../../src/components/beds/layout/LayoutFloatingToolDock';
import type { LayersPopoverButtonProps } from '../../../../src/components/beds/visualizer/LayersPopoverButton';
import { DEFAULT_ACTIVE_GRID_LAYERS } from '../../../../src/components/beds/visualizer/utils/bedGridConfig';

function buildLayersProps(): LayersPopoverButtonProps {
  return {
    showNames: true,
    onToggleNames: vi.fn(),
    showDimensions: true,
    onToggleDimensions: vi.fn(),
    showPlants: true,
    onTogglePlants: vi.fn(),
    showCardinalOrientation: false,
    onToggleCardinalOrientation: vi.fn(),
    showGrids: false,
    onToggleGrids: vi.fn(),
    activeGridLayers: DEFAULT_ACTIVE_GRID_LAYERS,
    onToggleGridLayer: vi.fn()
  };
}

function renderDock(
  overrides: Partial<LayoutFloatingToolDockProps> = {}
): LayoutFloatingToolDockProps {
  const props: LayoutFloatingToolDockProps = {
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onFitToScreen: vi.fn(),
    canUndo: true,
    onUndo: vi.fn(),
    canRedo: true,
    onRedo: vi.fn(),
    isFullscreen: false,
    onToggleFullscreen: vi.fn(),
    layersProps: buildLayersProps(),
    ...overrides
  };
  render(<LayoutFloatingToolDock {...props} />);
  return props;
}

describe('LayoutFloatingToolDock', () => {
  it('renders an accessible canvas toolbar', () => {
    renderDock();

    expect(
      screen.getByRole('toolbar', { name: 'Controles del lienzo' })
    ).toBeInTheDocument();
  });

  it.each<{
    readonly label: string;
    readonly handler: keyof LayoutFloatingToolDockProps;
  }>([
    { label: 'Acercar', handler: 'onZoomIn' },
    { label: 'Alejar', handler: 'onZoomOut' },
    { label: 'Centrar y restablecer el zoom', handler: 'onFitToScreen' },
    { label: 'Deshacer', handler: 'onUndo' },
    { label: 'Rehacer', handler: 'onRedo' }
  ])('invokes $handler when $label is clicked', async ({ label, handler }) => {
    const user = userEvent.setup();
    const props = renderDock();

    await user.click(screen.getByRole('button', { name: label }));

    expect(props[handler]).toHaveBeenCalledTimes(1);
  });

  it('opens the embedded layers popover', async () => {
    const user = userEvent.setup();
    renderDock();

    await user.click(screen.getByRole('button', { name: 'Capas' }));

    expect(
      screen.getByRole('dialog', { name: 'Capas visibles' })
    ).toBeInTheDocument();
  });

  it('disables undo and redo when there is no history', () => {
    renderDock({ canUndo: false, canRedo: false });

    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rehacer' })).toBeDisabled();
  });

  it('toggles fullscreen from the dock', async () => {
    const user = userEvent.setup();
    const props = renderDock();

    await user.click(screen.getByRole('button', { name: 'Pantalla completa' }));

    expect(props.onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('applies modifier class when className is provided', () => {
    renderDock({ className: 'layout-floating-tool-dock--stacked' });

    const toolbar = screen.getByRole('toolbar', {
      name: 'Controles del lienzo'
    });
    expect(toolbar).toHaveClass('layout-floating-tool-dock--stacked');
  });
});
