import type {
  GardenInput,
  GardenInputListItem,
  Recipe
} from '../../../src/types/GardenInput/GardenInput';

export function buildRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    name: 'Purín clásico de 10 días',
    description: 'Fermentación aeróbica de hojas frescas.',
    ingredients: [
      { item: 'Ortiga fresca', quantity: '1 kg' },
      { item: 'Agua de lluvia', quantity: '10 L' }
    ],
    instructions: [
      'Picar la ortiga y sumergirla en el agua.',
      'Remover a diario durante 10 días.',
      'Filtrar y embotellar.'
    ],
    brewTime: '10-14 días',
    dosage: {
      method: 'foliar',
      dilution: '1:20',
      frequency: 'Cada 15 días'
    },
    storage: {
      duration: 'Hasta 6 meses',
      conditions: 'Lugar fresco y oscuro',
      spoilageSigns: 'Olor pútrido'
    },
    safetyNotes: ['Usar guantes para recolectar'],
    ...overrides
  };
}

export function buildGardenInput(
  overrides: Partial<GardenInput> = {}
): GardenInput {
  return {
    id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
    version: 1,
    slug: 'purin-ortiga',
    name: 'Purín de ortiga',
    description:
      'Fermentado de Urtica dioica rico en nitrógeno, hierro y oligoelementos.',
    category: 'fertilizer',
    actions: ['fertilizer', 'biostimulant', 'repellent'],
    activeIngredients: ['Ácido fórmico', 'Histamina'],
    nutrients: ['Nitrógeno orgánico', 'Hierro'],
    targets: ['Clorosis férrica', 'Pulgón'],
    recipes: [buildRecipe()],
    resources: [],
    status: 'active',
    metadata: {
      createdAt: new Date('2026-10-01T10:00:00.000Z'),
      createdBy: 'system',
      updatedAt: new Date('2026-10-01T10:00:00.000Z'),
      updatedBy: 'system'
    },
    ...overrides
  };
}

export function buildGardenInputListItem(
  overrides: Partial<GardenInputListItem> = {}
): GardenInputListItem {
  return {
    id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
    slug: 'purin-ortiga',
    name: 'Purín de ortiga',
    category: 'fertilizer',
    actions: ['fertilizer', 'biostimulant', 'repellent'],
    description:
      'Fermentado de Urtica dioica rico en nitrógeno, hierro y oligoelementos.',
    status: 'active',
    ...overrides
  };
}

export function buildDeletedGardenInput(
  overrides: Partial<GardenInput> = {}
): GardenInput {
  return buildGardenInput({
    status: 'deleted',
    deletedAt: '2026-10-01T12:00:00.000Z',
    ...overrides
  });
}

export function buildDeletedGardenInputListItem(
  overrides: Partial<GardenInputListItem> = {}
): GardenInputListItem {
  return buildGardenInputListItem({
    status: 'deleted',
    deletedAt: '2026-10-01T12:00:00.000Z',
    ...overrides
  });
}
