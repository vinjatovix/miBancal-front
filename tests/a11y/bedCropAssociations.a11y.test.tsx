import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import BedAssociationsLayer from '../../src/components/beds/associations/BedAssociationsLayer';
import CropAssociationInspectionModal from '../../src/components/beds/associations/CropAssociationInspectionModal';
import LocationAssociationsLayer from '../../src/components/beds/associations/LocationAssociationsLayer';
import type { ActiveAssociationLink } from '../../src/components/beds/associations/types/cropAssociationTypes';
import { BedCanvasToolSelector } from '../../src/components/beds/visualizer/BedCanvasToolSelector';
import CropAdjustmentControls from '../../src/components/beds/visualizer/CropAdjustmentControls';
import { buildPlantRelation } from '../fixtures/plantRelations/buildPlantRelation';
import { expectNoAxeViolations } from '../test-utils/axe';
import '../../src/i18n/messages/beds';

const beneficialLink: ActiveAssociationLink = {
  id: 'crop-1:crop-2',
  cropA: {
    id: 'crop-1',
    plantId: 'plant-tomato',
    bedId: 'bed-1',
    commonName: 'Tomate',
    scientificName: 'Solanum lycopersicum',
    x: 30,
    y: 30,
    vitalRadius: 20
  },
  cropB: {
    id: 'crop-2',
    plantId: 'plant-basil',
    bedId: 'bed-1',
    commonName: 'Albahaca',
    scientificName: 'Ocimum basilicum',
    x: 60,
    y: 30,
    vitalRadius: 15
  },
  distanceCm: 30,
  effectiveReachCm: 80,
  scope: 'intra_bed',
  relations: [
    buildPlantRelation({
      type: 'beneficial',
      mechanism: 'pest_repellent',
      strength: 4,
      reason: 'Efecto repelente mutuo de plagas.'
    })
  ],
  visualPolarity: 'beneficial',
  isWarningPriority: false,
  midpoint: { x: 45, y: 30 }
};

const detrimentalLink: ActiveAssociationLink = {
  id: 'crop-1:crop-3',
  cropA: {
    id: 'crop-1',
    plantId: 'plant-tomato',
    bedId: 'bed-1',
    commonName: 'Tomate',
    x: 30,
    y: 30,
    vitalRadius: 20
  },
  cropB: {
    id: 'crop-3',
    plantId: 'plant-fennel',
    bedId: 'bed-2',
    commonName: 'Hinojo',
    x: 80,
    y: 30,
    vitalRadius: 20
  },
  distanceCm: 50,
  effectiveReachCm: 100,
  scope: 'cross_bed',
  relations: [
    buildPlantRelation({
      type: 'detrimental',
      mechanism: 'allelopathy',
      strength: 5,
      reason: 'Incompatibilidad biológica alelopática.'
    })
  ],
  visualPolarity: 'detrimental',
  isWarningPriority: true,
  midpoint: { x: 55, y: 30 }
};

describe('Bed crop associations a11y', () => {
  it.each(['light', 'dark'] as const)(
    'has no axe violations on BedAssociationsLayer in %s theme',
    async (theme) => {
      const { container } = render(
        <svg aria-label="Plano de bancal">
          <BedAssociationsLayer
            links={[beneficialLink, detrimentalLink]}
            filterMode="all"
          />
        </svg>
      );

      await expectNoAxeViolations(container, { theme });
    }
  );

  it.each(['light', 'dark'] as const)(
    'has no axe violations on LocationAssociationsLayer in %s theme',
    async (theme) => {
      const { container } = render(
        <svg aria-label="Plano de ubicación">
          <LocationAssociationsLayer
            links={[beneficialLink, detrimentalLink]}
            filterMode="all"
          />
        </svg>
      );

      await expectNoAxeViolations(container, { theme });
    }
  );

  it.each(['light', 'dark'] as const)(
    'has no axe violations on CropAssociationInspectionModal in %s theme',
    async (theme) => {
      const { container } = render(
        <CropAssociationInspectionModal
          link={detrimentalLink}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await expectNoAxeViolations(container, { theme });
    }
  );

  it.each(['light', 'dark'] as const)(
    'has no axe violations on BedCanvasToolSelector with association controls in %s theme',
    async (theme) => {
      const { container } = render(
        <BedCanvasToolSelector
          activeMode="plant-single"
          activeBrushPattern="single-row"
          onSelectMode={vi.fn()}
          onSelectBrushPattern={vi.fn()}
          showAssociations={true}
          onToggleAssociations={vi.fn()}
          associationFilterMode="all"
          onSelectAssociationFilterMode={vi.fn()}
        />
      );

      await expectNoAxeViolations(container, { theme });
    }
  );

  it.each(['light', 'dark'] as const)(
    'has no axe violations on CropAdjustmentControls with active associations in %s theme',
    async (theme) => {
      const selectedCropItem = {
        id: 'crop-1',
        bedId: 'bed-1',
        plantId: 'plant-tomato',
        commonName: 'Tomate',
        position: { x: 30, y: 30 },
        vitalRadius: 20,
        growthStatus: 'planted' as const,
        version: 1
      };

      const { container } = render(
        <CropAdjustmentControls
          selectedCrop={selectedCropItem}
          onAdjust={vi.fn()}
          onRemove={vi.fn()}
          onClose={vi.fn()}
          activeLinks={[beneficialLink]}
          onInspectLink={vi.fn()}
        />
      );

      await expectNoAxeViolations(container, { theme });
    }
  );
});
