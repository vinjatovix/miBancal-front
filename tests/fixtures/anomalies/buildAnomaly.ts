import type {
  Anomaly,
  AnomalyListItem
} from '../../../src/types/Anomaly/Anomaly';

export function buildAnomaly(overrides: Partial<Anomaly> = {}): Anomaly {
  return {
    id: '4f0f9a2e-7a0b-4a0e-9d52-2d6a8d1c0a11',
    version: 1,
    slug: 'pulgon-verde',
    name: 'Pulgón verde',
    scientificName: 'Myzus persicae',
    category: 'pest',
    description: 'Insecto chupador que debilita la planta.',
    symptoms: ['Hojas enrolladas', 'Melaza pegajosa'],
    damage: ['Retraso del crecimiento'],
    causes: ['Exceso de nitrógeno'],
    affectedCrops: ['Pimiento', 'Tomate'],
    prevention: ['Fomentar fauna auxiliar'],
    treatment: ['Jabón potásico'],
    naturalEnemies: ['Mariquita'],
    status: 'ACTIVE',
    ...overrides
  };
}

export function buildAnomalyListItem(
  overrides: Partial<AnomalyListItem> = {}
): AnomalyListItem {
  return {
    id: '4f0f9a2e-7a0b-4a0e-9d52-2d6a8d1c0a11',
    slug: 'pulgon-verde',
    name: 'Pulgón verde',
    scientificName: 'Myzus persicae',
    category: 'pest',
    status: 'ACTIVE',
    ...overrides
  };
}

export function buildDeletedAnomaly(overrides: Partial<Anomaly> = {}): Anomaly {
  return buildAnomaly({
    status: 'DELETED',
    deletedAt: '2026-10-01T10:00:00.000Z',
    ...overrides
  });
}

export function buildDeletedAnomalyListItem(
  overrides: Partial<AnomalyListItem> = {}
): AnomalyListItem {
  return buildAnomalyListItem({
    status: 'DELETED',
    deletedAt: '2026-10-01T10:00:00.000Z',
    ...overrides
  });
}
