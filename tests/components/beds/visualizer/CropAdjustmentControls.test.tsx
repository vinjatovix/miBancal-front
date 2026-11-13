import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import CropAdjustmentControls from '../../../../src/components/beds/visualizer/CropAdjustmentControls';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import '../../../../src/i18n/messages/beds';

const crop = buildCropPlacementItem({ id: 'crop-1', commonName: 'Tomate' });

describe('CropAdjustmentControls', () => {
  it('renders nothing without a selected crop', () => {
    const { container } = render(
      <CropAdjustmentControls
        selectedCrop={null}
        onAdjust={vi.fn()}
        onRemove={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it.each<{ readonly label: string; readonly dx: number; readonly dy: number }>(
    [
      { label: 'Mover arriba 1 cm', dx: 0, dy: -1 },
      { label: 'Mover abajo 1 cm', dx: 0, dy: 1 },
      { label: 'Mover a la izquierda 1 cm', dx: -1, dy: 0 },
      { label: 'Mover a la derecha 1 cm', dx: 1, dy: 0 }
    ]
  )('dispatches a 1 cm $label adjustment', async ({ label, dx, dy }) => {
    const onAdjust = vi.fn();
    const user = userEvent.setup();
    render(
      <CropAdjustmentControls
        selectedCrop={crop}
        onAdjust={onAdjust}
        onRemove={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: label }));

    expect(onAdjust).toHaveBeenCalledWith(dx, dy);
  });

  it('invokes removal for the selected crop', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <CropAdjustmentControls
        selectedCrop={crop}
        onAdjust={vi.fn()}
        onRemove={onRemove}
        onClose={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Retirar Tomate' }));

    expect(onRemove).toHaveBeenCalledWith('crop-1');
  });

  it('renders active associations and calls onInspectLink when clicked', async () => {
    const onInspect = vi.fn();
    const user = userEvent.setup();
    const link = {
      id: 'c1:c2',
      cropA: {
        id: crop.id,
        plantId: crop.plantId,
        bedId: crop.bedId,
        commonName: crop.commonName,
        x: 20,
        y: 20,
        vitalRadius: crop.vitalRadius
      },
      cropB: {
        id: 'crop-2',
        plantId: 'plant-2',
        bedId: crop.bedId,
        commonName: 'Albahaca',
        x: 45,
        y: 20,
        vitalRadius: 15
      },
      distanceCm: 25,
      effectiveReachCm: 80,
      scope: 'intra_bed' as const,
      relations: [],
      visualPolarity: 'beneficial' as const,
      isWarningPriority: false,
      midpoint: { x: 32.5, y: 20 }
    };

    render(
      <CropAdjustmentControls
        selectedCrop={crop}
        onAdjust={vi.fn()}
        onRemove={vi.fn()}
        onClose={vi.fn()}
        activeLinks={[link]}
        onInspectLink={onInspect}
      />
    );

    const btn = screen.getByRole('button', {
      name: /ver detalles de la asociación con albahaca/i
    });
    expect(btn).toBeInTheDocument();
    await user.click(btn);

    expect(onInspect).toHaveBeenCalledWith(link);
  });
});
