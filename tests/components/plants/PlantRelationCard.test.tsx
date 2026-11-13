import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PlantRelationCard from '../../../src/components/plants/PlantRelationCard/PlantRelationCard';
import {
  buildPlantRelation,
  buildTargetPlantSummary
} from '../../fixtures/plantRelations/buildPlantRelation';

const CURRENT_PLANT_ID = '11111111-1111-4111-8111-111111111111';
const COMPANION_PLANT_ID = '22222222-2222-4222-8222-222222222222';

describe('PlantRelationCard', () => {
  it('renders companion primary name and italics scientific name', () => {
    const targetPlant = buildTargetPlantSummary({ id: COMPANION_PLANT_ID });
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      targetPlant
    });

    render(
      <MemoryRouter>
        <PlantRelationCard
          relation={relation}
          currentPlantId={CURRENT_PLANT_ID}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Tomate')).toBeInTheDocument();
    expect(screen.getByText('Solanum lycopersicum')).toBeInTheDocument();
  });

  it('renders companion avatar when image url is present', () => {
    const targetPlant = buildTargetPlantSummary({
      id: COMPANION_PLANT_ID,
      image: { url: 'https://images.example.com/tomato.jpg' }
    });
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      targetPlant
    });

    render(
      <MemoryRouter>
        <PlantRelationCard
          relation={relation}
          currentPlantId={CURRENT_PLANT_ID}
        />
      </MemoryRouter>
    );

    const image = screen.getByRole('img', { name: 'Tomate' });
    expect(image).toHaveAttribute(
      'src',
      'https://images.example.com/tomato.jpg'
    );
  });

  it('renders directional badge for beneficial outgoing relation', () => {
    const targetPlant = buildTargetPlantSummary({
      id: COMPANION_PLANT_ID,
      name: { primary: 'Zanahoria' }
    });
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      type: 'beneficial',
      targetPlant
    });

    render(
      <MemoryRouter>
        <PlantRelationCard
          relation={relation}
          currentPlantId={CURRENT_PLANT_ID}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Aporta a Zanahoria')).toBeInTheDocument();
  });

  it('renders biological mechanism chip translated via tValue', () => {
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      mechanism: 'pest_repellent'
    });

    render(
      <MemoryRouter>
        <PlantRelationCard
          relation={relation}
          currentPlantId={CURRENT_PLANT_ID}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Repelente de plagas')).toBeInTheDocument();
  });

  it('renders strength indicator with accessible aria-label', () => {
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      strength: 4
    });

    render(
      <MemoryRouter>
        <PlantRelationCard
          relation={relation}
          currentPlantId={CURRENT_PLANT_ID}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByLabelText('Fuerza de la relación: 4 de 5')
    ).toBeInTheDocument();
  });

  it('renders formatted proximity distance', () => {
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      proximity: { minDistanceCm: 0, maxDistanceCm: 50 }
    });

    render(
      <MemoryRouter>
        <PlantRelationCard
          relation={relation}
          currentPlantId={CURRENT_PLANT_ID}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('0 cm - 50 cm')).toBeInTheDocument();
  });

  it('renders navigation link pointing to companion plant details', () => {
    const targetPlant = buildTargetPlantSummary({ id: COMPANION_PLANT_ID });
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      targetPlant
    });

    render(
      <MemoryRouter>
        <PlantRelationCard
          relation={relation}
          currentPlantId={CURRENT_PLANT_ID}
        />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Tomate/ });
    expect(link).toHaveAttribute('href', `/plants/${targetPlant.slug}`);
  });

  it('renders safe fallback when companion plant is not available without raw UUID', () => {
    const relation = buildPlantRelation({
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_PLANT_ID,
      targetPlant: undefined
    });

    render(
      <MemoryRouter>
        <PlantRelationCard
          relation={relation}
          currentPlantId={CURRENT_PLANT_ID}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Planta no disponible')).toBeInTheDocument();
    expect(screen.queryByText(COMPANION_PLANT_ID)).not.toBeInTheDocument();
  });
});
