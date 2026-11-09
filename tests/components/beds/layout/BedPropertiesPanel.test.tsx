import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import BedPropertiesPanel from '../../../../src/components/beds/layout/BedPropertiesPanel';
import type { ResolvedBed } from '../../../../src/components/beds/layout/utils/layoutTypes';

const MOCK_BED: ResolvedBed = {
  id: 'bed-1',
  name: 'Bancal Tomates',
  width: 120,
  height: 240,
  position: { x: 50, y: 50 },
  rotation: 45
};

describe('BedPropertiesPanel', () => {
  it('renders bed name, dimensions, and rotation', () => {
    render(
      <BedPropertiesPanel
        bed={MOCK_BED}
        onRenameInline={vi.fn()}
        onOpenFullEdit={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Bancal Tomates')).toBeInTheDocument();
    expect(screen.getByText('120 × 240 cm')).toBeInTheDocument();
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
  });

  it('calls onRenameInline with new name when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onRenameInline = vi.fn();

    render(
      <BedPropertiesPanel
        bed={MOCK_BED}
        onRenameInline={onRenameInline}
        onOpenFullEdit={vi.fn()}
      />
    );

    const nameInput = screen.getByDisplayValue('Bancal Tomates');
    await user.clear(nameInput);
    await user.type(nameInput, 'Bancal Pimientos{Enter}');

    expect(onRenameInline).toHaveBeenCalledWith('Bancal Pimientos');
  });

  it('calls onRenameInline with new name on blur', async () => {
    const user = userEvent.setup();
    const onRenameInline = vi.fn();

    render(
      <BedPropertiesPanel
        bed={MOCK_BED}
        onRenameInline={onRenameInline}
        onOpenFullEdit={vi.fn()}
      />
    );

    const nameInput = screen.getByDisplayValue('Bancal Tomates');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nuevo Nombre');
    await user.tab();

    expect(onRenameInline).toHaveBeenCalledWith('Nuevo Nombre');
  });

  it('does not call onRenameInline if input is empty', async () => {
    const user = userEvent.setup();
    const onRenameInline = vi.fn();

    render(
      <BedPropertiesPanel
        bed={MOCK_BED}
        onRenameInline={onRenameInline}
        onOpenFullEdit={vi.fn()}
      />
    );

    const nameInput = screen.getByDisplayValue('Bancal Tomates');
    await user.clear(nameInput);
    await user.keyboard('{Enter}');

    expect(onRenameInline).not.toHaveBeenCalled();
  });

  it('invokes onOpenFullEdit when clicking full edit button', async () => {
    const user = userEvent.setup();
    const onOpenFullEdit = vi.fn();

    render(
      <BedPropertiesPanel
        bed={MOCK_BED}
        onRenameInline={vi.fn()}
        onOpenFullEdit={onOpenFullEdit}
      />
    );

    const fullEditButton = screen.getByRole('button', {
      name: 'Editar medidas completas'
    });
    await user.click(fullEditButton);

    expect(onOpenFullEdit).toHaveBeenCalledTimes(1);
  });

  it('invokes onRotationChange when rotation input changes', async () => {
    const user = userEvent.setup();
    const onRotationChange = vi.fn();

    render(
      <BedPropertiesPanel
        bed={MOCK_BED}
        onRenameInline={vi.fn()}
        onOpenFullEdit={vi.fn()}
        onRotationChange={onRotationChange}
      />
    );

    const rotationInput = screen.getByRole('spinbutton', {
      name: 'Rotación'
    });
    await user.clear(rotationInput);
    await user.type(rotationInput, '90');

    expect(onRotationChange).toHaveBeenCalledWith(90);
  });

  it('renders active associations and calls onInspectLink when clicked', async () => {
    const user = userEvent.setup();
    const onInspect = vi.fn();
    const link = {
      id: 'l1',
      cropA: {
        id: 'c1',
        plantId: 'p1',
        bedId: 'bed-1',
        commonName: 'Tomate',
        x: 10,
        y: 10,
        vitalRadius: 15
      },
      cropB: {
        id: 'c2',
        plantId: 'p2',
        bedId: 'bed-1',
        commonName: 'Albahaca',
        x: 40,
        y: 10,
        vitalRadius: 15
      },
      distanceCm: 30,
      effectiveReachCm: 80,
      scope: 'intra_bed' as const,
      relations: [],
      visualPolarity: 'beneficial' as const,
      isWarningPriority: false,
      midpoint: { x: 25, y: 10 }
    };

    render(
      <BedPropertiesPanel
        bed={MOCK_BED}
        onRenameInline={vi.fn()}
        onOpenFullEdit={vi.fn()}
        activeLinks={[link]}
        onInspectLink={onInspect}
      />
    );

    const btn = screen.getByRole('button', { name: /Tomate - Albahaca/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);

    expect(onInspect).toHaveBeenCalledWith(link);
  });
});
