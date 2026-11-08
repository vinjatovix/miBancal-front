import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayersPopoverButton from '../../../../src/components/beds/visualizer/LayersPopoverButton';

describe('LayersPopoverButton', () => {
  it('renders trigger button with aria-haspopup and aria-expanded false by default', () => {
    render(
      <LayersPopoverButton
        showNames={true}
        onToggleNames={vi.fn()}
        showDimensions={true}
        onToggleDimensions={vi.fn()}
        showPlants={true}
        onTogglePlants={vi.fn()}
        showCardinalOrientation={true}
        onToggleCardinalOrientation={vi.fn()}
        showGrids={true}
        onToggleGrids={vi.fn()}
        activeGridLayers={{
          sfg: false,
          intermediate: false,
          decimeters: false,
          fine: false
        }}
        onToggleGridLayer={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: 'Capas' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens popover dialog when trigger button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <LayersPopoverButton
        showNames={true}
        onToggleNames={vi.fn()}
        showDimensions={true}
        onToggleDimensions={vi.fn()}
        showPlants={true}
        onTogglePlants={vi.fn()}
        showCardinalOrientation={true}
        onToggleCardinalOrientation={vi.fn()}
        showGrids={true}
        onToggleGrids={vi.fn()}
        activeGridLayers={{
          sfg: false,
          intermediate: false,
          decimeters: false,
          fine: false
        }}
        onToggleGridLayer={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Capas' }));

    expect(
      screen.getByRole('dialog', { name: 'Capas visibles' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Capas' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('displays five layer toggle switches in popover', async () => {
    const user = userEvent.setup();

    render(
      <LayersPopoverButton
        showNames={true}
        onToggleNames={vi.fn()}
        showDimensions={true}
        onToggleDimensions={vi.fn()}
        showPlants={true}
        onTogglePlants={vi.fn()}
        showCardinalOrientation={true}
        onToggleCardinalOrientation={vi.fn()}
        showGrids={false}
        onToggleGrids={vi.fn()}
        activeGridLayers={{
          sfg: false,
          intermediate: false,
          decimeters: false,
          fine: false
        }}
        onToggleGridLayer={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Capas' }));

    expect(
      screen.getByRole('switch', { name: 'Nombres de bancales' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('switch', { name: 'Líneas de cota' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('switch', { name: 'Plantas sembradas' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('switch', { name: 'Orientación cardinal' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('switch', { name: 'Cuadrículas agronómicas' })
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('invokes layer toggle callback when clicking a switch without closing popover', async () => {
    const user = userEvent.setup();
    const onToggleCardinal = vi.fn();

    render(
      <LayersPopoverButton
        showNames={true}
        onToggleNames={vi.fn()}
        showDimensions={true}
        onToggleDimensions={vi.fn()}
        showPlants={true}
        onTogglePlants={vi.fn()}
        showCardinalOrientation={true}
        onToggleCardinalOrientation={onToggleCardinal}
        showGrids={true}
        onToggleGrids={vi.fn()}
        activeGridLayers={{
          sfg: false,
          intermediate: false,
          decimeters: false,
          fine: false
        }}
        onToggleGridLayer={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Capas' }));
    await user.click(
      screen.getByRole('switch', { name: 'Orientación cardinal' })
    );

    expect(onToggleCardinal).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('dialog', { name: 'Capas visibles' })
    ).toBeInTheDocument();
  });

  it('closes popover on Escape key press and returns focus to button', async () => {
    const user = userEvent.setup();

    render(
      <LayersPopoverButton
        showNames={true}
        onToggleNames={vi.fn()}
        showDimensions={true}
        onToggleDimensions={vi.fn()}
        showPlants={true}
        onTogglePlants={vi.fn()}
        showCardinalOrientation={true}
        onToggleCardinalOrientation={vi.fn()}
        showGrids={true}
        onToggleGrids={vi.fn()}
        activeGridLayers={{
          sfg: false,
          intermediate: false,
          decimeters: false,
          fine: false
        }}
        onToggleGridLayer={vi.fn()}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Capas' });
    await user.click(trigger);
    expect(
      screen.getByRole('dialog', { name: 'Capas visibles' })
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});
