import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import BedCropsLayer from '../../../../src/components/beds/visualizer/BedCropsLayer';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import '../../../../src/i18n/messages/beds';

const crop = buildCropPlacementItem({ id: 'crop-1', commonName: 'Tomate' });

function renderLayer(
  props: Partial<React.ComponentProps<typeof BedCropsLayer>>
) {
  return render(
    <svg>
      <BedCropsLayer
        crops={[crop]}
        collisions={[]}
        perimeterWarnings={new Set()}
        {...props}
      />
    </svg>
  );
}

describe('BedCropsLayer reposition', () => {
  it('selects a crop when its node is clicked', async () => {
    const onSelectCrop = vi.fn();
    const user = userEvent.setup();
    renderLayer({ onSelectCrop });

    await user.click(screen.getByRole('button'));

    expect(onSelectCrop).toHaveBeenCalledWith('crop-1');
  });

  it('marks the selected crop node visually', () => {
    const { container } = renderLayer({ selectedCropId: 'crop-1' });

    expect(container.querySelector('.bed-crop-node--selected')).toBeTruthy();
  });

  it('starts a pointer drag on the crop node', () => {
    const onPointerDownCrop = vi.fn();
    renderLayer({ onPointerDownCrop });

    fireEvent.pointerDown(screen.getByRole('button'), { pointerId: 1 });

    expect(onPointerDownCrop).toHaveBeenCalledWith('crop-1', expect.anything());
  });

  it('forwards pointer move during a crop drag', () => {
    const onPointerMoveCrop = vi.fn();
    renderLayer({ onPointerMoveCrop });

    fireEvent.pointerMove(screen.getByRole('button'), {
      pointerId: 1,
      clientX: 20,
      clientY: 20
    });

    expect(onPointerMoveCrop).toHaveBeenCalled();
  });
});
