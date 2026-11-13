import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import BedCropNode from '../../../../src/components/beds/visualizer/BedCropNode';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import '../../../../src/i18n/messages/beds';

const crop = buildCropPlacementItem({
  id: 'crop-1',
  commonName: 'Tomate',
  position: { x: 30, y: 40 },
  vitalRadius: 20
});

describe('BedCropNode', () => {
  it('renders standard crop node with position and common name', () => {
    render(
      <svg>
        <BedCropNode crop={crop} />
      </svg>
    );

    const node = screen.getByRole('button', {
      name: 'Tomate en 30, 40 centímetros'
    });
    expect(node).toBeInTheDocument();
    expect(screen.getByText('Tomate')).toBeInTheDocument();
  });

  it('includes companion and incompatibility counts in accessible label', () => {
    render(
      <svg>
        <BedCropNode crop={crop} companionCount={2} incompatibilityCount={1} />
      </svg>
    );

    const node = screen.getByRole('button', {
      name: 'Tomate en 30, 40 centímetros, 2 compañeras, 1 incompatibles'
    });
    expect(node).toBeInTheDocument();
  });

  it('indicates collision state in accessible label', () => {
    render(
      <svg>
        <BedCropNode crop={crop} hasCollision />
      </svg>
    );

    const node = screen.getByRole('button', {
      name: 'Tomate en 30, 40 centímetros, en colisión con otro cultivo'
    });
    expect(node).toBeInTheDocument();
  });

  it('indicates overflow state in accessible label', () => {
    render(
      <svg>
        <BedCropNode crop={crop} hasOverflow />
      </svg>
    );

    const node = screen.getByRole('button', {
      name: 'Tomate en 30, 40 centímetros, el radio sobrepasa el borde'
    });
    expect(node).toBeInTheDocument();
  });

  it('triggers onSelect when clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <svg>
        <BedCropNode crop={crop} onSelect={onSelect} />
      </svg>
    );

    await user.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalledWith('crop-1');
  });

  it('dispatches keyboard movement on arrow keys', async () => {
    const onKeyboardMove = vi.fn();
    const user = userEvent.setup();

    render(
      <svg>
        <BedCropNode crop={crop} onKeyboardMove={onKeyboardMove} />
      </svg>
    );

    const node = screen.getByRole('button');
    node.focus();
    await user.keyboard('{ArrowRight}');

    expect(onKeyboardMove).toHaveBeenCalledWith('crop-1', { x: 31, y: 40 });
  });
});
