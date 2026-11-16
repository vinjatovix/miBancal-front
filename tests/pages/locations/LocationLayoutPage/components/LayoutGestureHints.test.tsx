import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutGestureHints from '../../../../../src/pages/locations/LocationLayoutPage/components/LayoutGestureHints';

describe('LayoutGestureHints', () => {
  it('shows the read-mode hint when inspecting the plan', () => {
    render(
      <LayoutGestureHints
        mode="read"
        toolMode="plant-single"
        onOpenHelp={vi.fn()}
      />
    );
    expect(
      screen.getByText('Pellizca para ampliar • Arrastra para mover el plano')
    ).toBeInTheDocument();
  });

  it('shows the position-mode hint when arranging beds', () => {
    render(
      <LayoutGestureHints
        mode="position"
        toolMode="plant-single"
        onOpenHelp={vi.fn()}
      />
    );
    expect(
      screen.getByText(
        'Toca para seleccionar • Mantén y arrastra para mover un bancal'
      )
    ).toBeInTheDocument();
  });

  it('shows the planting single-tool hint while placing plants', () => {
    render(
      <LayoutGestureHints
        mode="plants"
        toolMode="plant-single"
        onOpenHelp={vi.fn()}
      />
    );
    expect(
      screen.getByText(
        'Toca para seleccionar • Mantén y arrastra para mover una planta'
      )
    ).toBeInTheDocument();
  });

  it('shows the brush hint while painting plants along a stroke', () => {
    render(
      <LayoutGestureHints mode="plants" toolMode="brush" onOpenHelp={vi.fn()} />
    );
    expect(
      screen.getByText('Arrastra para sembrar siguiendo el trazo')
    ).toBeInTheDocument();
  });

  it('shows the marquee hint while selecting groups', () => {
    render(
      <LayoutGestureHints
        mode="plants"
        toolMode="select"
        onOpenHelp={vi.fn()}
      />
    );
    expect(
      screen.getByText(
        'Toca para elegir • Arrastra en vacío para marcar un grupo'
      )
    ).toBeInTheDocument();
  });

  it('opens the gesture cheat sheet from the help button', async () => {
    const user = userEvent.setup();
    const onOpenHelp = vi.fn();
    render(
      <LayoutGestureHints
        mode="plants"
        toolMode="plant-single"
        onOpenHelp={onOpenHelp}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Ayuda de gestos' }));
    expect(onOpenHelp).toHaveBeenCalledTimes(1);
  });
});
