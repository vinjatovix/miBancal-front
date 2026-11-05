import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PlantCompanionGroupCard from '../../../../src/pages/plantRelations/components/PlantCompanionGroupCard';
import {
  buildPlantRelation,
  buildPlantSummary
} from '../../../fixtures/plantRelations/buildPlantRelation';

const CURRENT_PLANT_ID = '11111111-1111-4111-8111-111111111111';
const COMPANION_ID = '22222222-2222-4222-8222-222222222222';

const companionSummary = buildPlantSummary({
  id: COMPANION_ID,
  name: { primary: 'Zanahoria' },
  scientificName: 'Daucus carota'
});

const companionInfo = {
  id: COMPANION_ID,
  scope: 'plant' as const,
  primaryName: 'Zanahoria',
  scientificName: 'Daucus carota',
  isAvailable: true
};

describe('PlantCompanionGroupCard', () => {
  it('renders companion plant header once and lists multiple interactions', () => {
    const relationA = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_ID,
      type: 'beneficial',
      reason: 'El puerro repele a la mosca de la zanahoria.',
      targetPlant: companionSummary
    });
    const relationB = buildPlantRelation({
      id: 'rel-2',
      sourcePlantId: COMPANION_ID,
      targetPlantId: CURRENT_PLANT_ID,
      type: 'beneficial',
      reason: 'La zanahoria confunde y repele a la polilla del puerro.',
      sourcePlant: companionSummary,
      targetPlant: {
        id: CURRENT_PLANT_ID,
        slug: 'puerro',
        name: { primary: 'Puerro' },
        scientificName: 'Allium ampeloprasum'
      }
    });

    render(
      <MemoryRouter>
        <PlantCompanionGroupCard
          companion={companionInfo}
          relations={[relationA, relationB]}
          currentPlantId={CURRENT_PLANT_ID}
          currentPlantName="Puerro"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Zanahoria')).toBeInTheDocument();
    expect(screen.getByText('Daucus carota')).toBeInTheDocument();
    expect(screen.getByText('Aporta a Zanahoria')).toBeInTheDocument();
    expect(screen.getByText('Aporta a Puerro')).toBeInTheDocument();
    expect(
      screen.getByText('El puerro repele a la mosca de la zanahoria.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'La zanahoria confunde y repele a la polilla del puerro.'
      )
    ).toBeInTheDocument();
  });

  it('triggers onEdit and onDelete callbacks when curator actions are clicked', async () => {
    const relation = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_ID,
      targetPlant: companionSummary
    });
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PlantCompanionGroupCard
          companion={companionInfo}
          relations={[relation]}
          currentPlantId={CURRENT_PLANT_ID}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </MemoryRouter>
    );

    const editBtn = screen.getByRole('button', { name: /Editar relación/ });
    const deleteBtn = screen.getByRole('button', {
      name: /Eliminar relación/
    });

    await user.click(editBtn);
    expect(onEdit).toHaveBeenCalledExactlyOnceWith(relation);

    await user.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledExactlyOnceWith(relation);
  });
});
