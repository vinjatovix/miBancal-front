import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CropAssociationInspectionModal from '../../../../src/components/beds/associations/CropAssociationInspectionModal';
import type { ActiveAssociationLink } from '../../../../src/components/beds/associations/types/cropAssociationTypes';
import { buildPlantRelation } from '../../../fixtures/plantRelations/buildPlantRelation';

function createMockLink(
  overrides: Partial<ActiveAssociationLink> = {}
): ActiveAssociationLink {
  return {
    id: 'crop-1:crop-2',
    cropA: {
      id: 'crop-1',
      plantId: 'plant-tomato',
      bedId: 'bed-1',
      commonName: 'Tomate',
      scientificName: 'Solanum lycopersicum',
      x: 50,
      y: 50,
      vitalRadius: 20
    },
    cropB: {
      id: 'crop-2',
      plantId: 'plant-basil',
      bedId: 'bed-1',
      commonName: 'Albahaca',
      scientificName: 'Ocimum basilicum',
      x: 80,
      y: 50,
      vitalRadius: 15
    },
    distanceCm: 30,
    effectiveReachCm: 50,
    scope: 'intra_bed',
    relations: [
      buildPlantRelation({
        type: 'beneficial',
        mechanism: 'pest_repellent',
        strength: 4,
        reason:
          'El aroma de la albahaca enmascara los compuestos volátiles del tomate.'
      })
    ],
    visualPolarity: 'beneficial',
    isWarningPriority: false,
    midpoint: { x: 65, y: 50 },
    ...overrides
  };
}

describe('CropAssociationInspectionModal', () => {
  it('does not render when isOpen is false', () => {
    const link = createMockLink();

    render(
      <CropAssociationInspectionModal
        link={link}
        isOpen={false}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal with species names, mechanism, distance, and reason', () => {
    const link = createMockLink();

    render(
      <CropAssociationInspectionModal
        link={link}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /fundamento agronómico de la asociación/i
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/Tomate y Albahaca/i)).toBeInTheDocument();
    expect(
      screen.getByText(/30 cm \(alcance efectivo: 50 cm\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Repelente de plagas/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /El aroma de la albahaca enmascara los compuestos volátiles del tomate./i
      )
    ).toBeInTheDocument();
  });

  it('renders fitosanitary warning notice when isWarningPriority is true', () => {
    const link = createMockLink({
      visualPolarity: 'detrimental',
      isWarningPriority: true,
      relations: [
        buildPlantRelation({
          id: 'rel-1',
          type: 'detrimental',
          mechanism: 'allelopathy',
          reason: 'Alelopatía negativa.'
        }),
        buildPlantRelation({
          id: 'rel-2',
          type: 'beneficial',
          mechanism: 'pest_repellent',
          reason: 'Repelente.'
        })
      ]
    });

    render(
      <CropAssociationInspectionModal
        link={link}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      /Advertencia: Estas plantas se ayudan y se dañan a la vez/i
    );
    expect(
      screen.getByText(/Incompatibilidad perjudicial/i)
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const link = createMockLink();
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <CropAssociationInspectionModal
        link={link}
        isOpen={true}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole('button', {
      name: /cerrar detalles de la asociación/i
    });
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders fallback polarity label when relation has no mechanism or reason', () => {
    const link = createMockLink({
      scope: 'cross_bed',
      visualPolarity: 'detrimental',
      relations: [
        buildPlantRelation({
          id: 'rel-empty',
          type: 'detrimental',
          mechanism: undefined,
          strength: undefined,
          reason: undefined
        })
      ]
    });

    render(
      <CropAssociationInspectionModal
        link={link}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Entre bancales')).toBeInTheDocument();
    expect(screen.getByText('Efecto perjudicial')).toBeInTheDocument();
  });
});
