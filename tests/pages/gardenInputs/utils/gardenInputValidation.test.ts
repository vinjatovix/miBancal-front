import { describe, expect, it } from 'vitest';

import {
  fromGardenInputEntity,
  toCreateRequest,
  toUpdateRequest,
  validateGardenInputForm,
  type GardenInputFormValues
} from '../../../../src/pages/gardenInputs/utils/gardenInputValidation';
import type {
  DosageMethod,
  GardenInputCategory
} from '../../../../src/types/GardenInput/GardenInput';
import {
  buildGardenInput,
  buildRecipe
} from '../../../fixtures/gardenInputs/gardenInputFixtures';

const validValues: GardenInputFormValues = {
  id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
  slug: 'purin-ortiga',
  name: 'Purín de ortiga',
  category: 'fertilizer',
  description: 'Extracto fermentado rico en nitrógeno.',
  actions: ['fertilizer', 'biostimulant'],
  activeIngredientsText: 'Ácido fórmico, Histamina',
  nutrientsText: 'Nitrógeno, Hierro',
  targetsText: 'Pulgón, Clorosis',
  recipes: [
    {
      name: 'Purín tradicional',
      description: 'Macerado en agua.',
      brewTime: '10 días',
      ingredients: [{ item: 'Ortiga fresca', quantity: '1 kg' }],
      instructions: ['Picar hojas', 'Añadir agua'],
      dosageMethod: 'foliar',
      dosageDilution: '1:10',
      dosageFrequency: 'Semanal',
      storageDuration: '6 meses',
      storageConditions: 'Lugar oscuro',
      storageSpoilageSigns: 'Olor pútrido',
      safetyNotesText: 'Usar guantes'
    }
  ],
  images: [],
  videoResources: [],
  articleResources: []
};

describe('validateGardenInputForm', () => {
  it('passes validation when all fields are valid', () => {
    const errors = validateGardenInputForm(validValues, { isCreate: true });

    expect(errors).toEqual({});
  });

  it('fails validation when name is empty', () => {
    const values = { ...validValues, name: '   ' };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors.name).toBe('El nombre es obligatorio.');
  });

  it('fails validation when name exceeds 200 characters', () => {
    const values = { ...validValues, name: 'a'.repeat(201) };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors.name).toBe('El nombre no puede superar los 200 caracteres.');
  });

  it('fails validation when slug is empty on create', () => {
    const values = { ...validValues, slug: '   ' };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors.slug).toBe('El identificador es obligatorio.');
  });

  it.each([
    'Purin Ortiga',
    'purin_ortiga',
    '-purin',
    'purin-',
    'purin--ortiga',
    'purín-ortiga',
    'a'.repeat(201)
  ])('fails validation when slug has invalid format: %s', (invalidSlug) => {
    const values = { ...validValues, slug: invalidSlug };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors.slug).toBe(
      'El slug solo admite letras minúsculas, números y guiones sencillos (1-200 caracteres).'
    );
  });

  it('does not validate slug on edit', () => {
    const values = { ...validValues, slug: '' };

    const errors = validateGardenInputForm(values, { isCreate: false });

    expect(errors.slug).toBeUndefined();
  });

  it('fails validation when category is not selected', () => {
    const values = {
      ...validValues,
      category: '' as unknown as GardenInputCategory
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors.category).toBe('Debes seleccionar una categoría.');
  });

  it('fails validation when description exceeds 2000 characters', () => {
    const values = { ...validValues, description: 'a'.repeat(2001) };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors.description).toBe(
      'La descripción no puede superar los 2000 caracteres.'
    );
  });

  it('fails validation when recipe name is empty', () => {
    const values: GardenInputFormValues = {
      ...validValues,
      recipes: [{ ...validValues.recipes[0], name: '' }]
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors['recipes.0.name']).toBe(
      'El nombre de la receta es obligatorio.'
    );
  });

  it('fails validation when recipe has no ingredients', () => {
    const values: GardenInputFormValues = {
      ...validValues,
      recipes: [{ ...validValues.recipes[0], ingredients: [] }]
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors['recipes.0.ingredients']).toBe(
      'La receta debe incluir al menos un ingrediente.'
    );
  });

  it('fails validation when ingredient item is missing', () => {
    const values: GardenInputFormValues = {
      ...validValues,
      recipes: [
        {
          ...validValues.recipes[0],
          ingredients: [{ item: '', quantity: '1 kg' }]
        }
      ]
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors['recipes.0.ingredients.0.item']).toBe(
      'El ingrediente es obligatorio.'
    );
  });

  it('fails validation when ingredient quantity is missing', () => {
    const values: GardenInputFormValues = {
      ...validValues,
      recipes: [
        {
          ...validValues.recipes[0],
          ingredients: [{ item: 'Ortiga fresca', quantity: '' }]
        }
      ]
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors['recipes.0.ingredients.0.quantity']).toBe(
      'La cantidad es obligatoria.'
    );
  });

  it('fails validation when recipe has no instructions', () => {
    const values: GardenInputFormValues = {
      ...validValues,
      recipes: [{ ...validValues.recipes[0], instructions: [] }]
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors['recipes.0.instructions']).toBe(
      'La receta debe incluir al menos una instrucción.'
    );
  });

  it.each([
    [
      'dosageMethod',
      { dosageMethod: '' as unknown as DosageMethod },
      'recipes.0.dosageMethod',
      'La vía de suministro es obligatoria.'
    ],
    [
      'dosageDilution',
      { dosageDilution: '' },
      'recipes.0.dosageDilution',
      'La dilución es obligatoria.'
    ],
    [
      'dosageFrequency',
      { dosageFrequency: '' },
      'recipes.0.dosageFrequency',
      'La frecuencia es obligatoria.'
    ]
  ])(
    'fails validation when %s is missing',
    (_field, override, errorKey, expectedMessage) => {
      const values: GardenInputFormValues = {
        ...validValues,
        recipes: [{ ...validValues.recipes[0], ...override }]
      };

      const errors = validateGardenInputForm(values, { isCreate: true });

      expect(errors[errorKey]).toBe(expectedMessage);
    }
  );

  it('fails validation when storage conditions are missing while storage duration is set', () => {
    const values: GardenInputFormValues = {
      ...validValues,
      recipes: [
        {
          ...validValues.recipes[0],
          storageDuration: '6 meses',
          storageConditions: ''
        }
      ]
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors['recipes.0.storageConditions']).toBe(
      'Las condiciones de conservación son obligatorias.'
    );
  });

  it('fails validation when storage duration is missing while storage conditions are set', () => {
    const values: GardenInputFormValues = {
      ...validValues,
      recipes: [
        {
          ...validValues.recipes[0],
          storageDuration: '',
          storageConditions: 'Lugar oscuro'
        }
      ]
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors['recipes.0.storageDuration']).toBe(
      'La duración de conservación es obligatoria.'
    );
  });

  it('fails validation when resources exceed max limit', () => {
    const images = Array.from({ length: 201 }, (_, i) => ({
      id: `img-${i}`,
      url: `https://example.com/img-${i}.jpg`,
      title: '',
      source: ''
    }));
    const values: GardenInputFormValues = {
      ...validValues,
      images
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors.resources).toBe(
      'Se ha superado el número máximo de recursos (200).'
    );
  });

  it.each([
    'ftp://example.com/file.jpg',
    'javascript:alert(1)',
    'not-a-url',
    `https://example.com/${'a'.repeat(2048)}`
  ])('fails validation when resource url is invalid: %s', (invalidUrl) => {
    const values: GardenInputFormValues = {
      ...validValues,
      images: [
        {
          id: 'img-1',
          url: invalidUrl,
          title: 'Foto',
          source: 'Fuente'
        }
      ]
    };

    const errors = validateGardenInputForm(values, { isCreate: true });

    expect(errors.resources).toBe(
      'Las URL de los recursos deben empezar por http:// o https:// y no superar los 2048 caracteres.'
    );
  });
});

describe('toCreateRequest', () => {
  it('maps valid form values to CreateGardenInputRequest with recipe structure', () => {
    const result = toCreateRequest(validValues);

    expect(result).toEqual({
      id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
      slug: 'purin-ortiga',
      name: 'Purín de ortiga',
      category: 'fertilizer',
      description: 'Extracto fermentado rico en nitrógeno.',
      actions: ['fertilizer', 'biostimulant'],
      activeIngredients: ['Ácido fórmico', 'Histamina'],
      nutrients: ['Nitrógeno', 'Hierro'],
      targets: ['Pulgón', 'Clorosis'],
      recipes: [
        {
          name: 'Purín tradicional',
          description: 'Macerado en agua.',
          brewTime: '10 días',
          ingredients: [{ item: 'Ortiga fresca', quantity: '1 kg' }],
          instructions: ['Picar hojas', 'Añadir agua'],
          dosage: {
            method: 'foliar',
            dilution: '1:10',
            frequency: 'Semanal'
          },
          storage: {
            duration: '6 meses',
            conditions: 'Lugar oscuro',
            spoilageSigns: 'Olor pútrido'
          },
          safetyNotes: ['Usar guantes']
        }
      ]
    });
  });

  it('generates random uuid when id is empty in create request', () => {
    const values = { ...validValues, id: '' };

    const result = toCreateRequest(values);

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('leaves optional fields as undefined when values are empty in create request', () => {
    const values: GardenInputFormValues = {
      id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
      slug: 'macerado-ajo',
      name: 'Macerado de ajo',
      category: 'defense',
      actions: [],
      recipes: [],
      images: [],
      videoResources: [],
      articleResources: []
    };

    const result = toCreateRequest(values);

    expect(result.description).toBeUndefined();
    expect(result.actions).toBeUndefined();
    expect(result.activeIngredients).toBeUndefined();
    expect(result.nutrients).toBeUndefined();
    expect(result.targets).toBeUndefined();
    expect(result.recipes).toBeUndefined();
  });

  it('maps resources (images, videos, articles) to CreateGardenInputRequest', () => {
    const values: GardenInputFormValues = {
      ...validValues,
      images: [
        {
          id: 'img-1',
          url: 'https://example.com/foto.jpg',
          title: 'Foto de ortiga',
          source: 'Jardín'
        }
      ],
      videoResources: [
        {
          id: 'vid-1',
          url: 'https://youtube.com/watch?v=123',
          title: 'Vídeo tutorial'
        }
      ],
      articleResources: [
        {
          id: 'art-1',
          url: 'https://example.com/guia',
          title: 'Guía de uso'
        }
      ]
    };

    const result = toCreateRequest(values);

    expect(result.resources).toEqual([
      {
        type: 'image',
        url: 'https://example.com/foto.jpg',
        title: 'Foto de ortiga',
        source: 'Jardín'
      },
      {
        type: 'video',
        url: 'https://youtube.com/watch?v=123',
        title: 'Vídeo tutorial'
      },
      {
        type: 'article',
        url: 'https://example.com/guia',
        title: 'Guía de uso'
      }
    ]);
  });
});

describe('toUpdateRequest', () => {
  it('maps form values to UpdateGardenInputRequest with null for cleared fields', () => {
    const values: GardenInputFormValues = {
      id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
      slug: 'purin-ortiga',
      name: 'Purín de ortiga concentrado',
      category: 'biostimulant',
      actions: [],
      recipes: [],
      images: [],
      videoResources: [],
      articleResources: []
    };

    const result = toUpdateRequest(values);

    expect(result).toEqual({
      name: 'Purín de ortiga concentrado',
      category: 'biostimulant',
      description: null,
      actions: null,
      activeIngredients: null,
      nutrients: null,
      targets: null,
      recipes: null,
      resources: null
    });
  });

  it('preserves populated fields in update request', () => {
    const result = toUpdateRequest(validValues);

    expect(result.name).toBe('Purín de ortiga');
    expect(result.category).toBe('fertilizer');
    expect(result.description).toBe('Extracto fermentado rico en nitrógeno.');
    expect(result.actions).toEqual(['fertilizer', 'biostimulant']);
    expect(result.activeIngredients).toEqual(['Ácido fórmico', 'Histamina']);
    expect(result.nutrients).toEqual(['Nitrógeno', 'Hierro']);
    expect(result.targets).toEqual(['Pulgón', 'Clorosis']);
    expect(result.recipes).toHaveLength(1);
  });

  it('maps resources (images, videos, articles) to UpdateGardenInputRequest', () => {
    const values: GardenInputFormValues = {
      ...validValues,
      images: [
        {
          id: 'img-1',
          url: 'https://example.com/foto.jpg',
          title: 'Foto',
          source: 'Fuente'
        }
      ],
      videoResources: [
        {
          id: 'vid-1',
          url: 'https://youtube.com/watch?v=123',
          title: 'Vídeo'
        }
      ],
      articleResources: [
        {
          id: 'art-1',
          url: 'https://example.com/doc',
          title: 'Documento'
        }
      ]
    };

    const result = toUpdateRequest(values);

    expect(result.resources).toEqual([
      {
        type: 'image',
        url: 'https://example.com/foto.jpg',
        title: 'Foto',
        source: 'Fuente'
      },
      {
        type: 'video',
        url: 'https://youtube.com/watch?v=123',
        title: 'Vídeo'
      },
      {
        type: 'article',
        url: 'https://example.com/doc',
        title: 'Documento'
      }
    ]);
  });
});

describe('fromGardenInputEntity', () => {
  it('converts complete GardenInput entity to GardenInputFormValues', () => {
    const entity = buildGardenInput({
      slug: 'purin-ortiga',
      name: 'Purín de ortiga',
      category: 'fertilizer',
      description: 'Extracto fermentado.',
      status: 'active',
      actions: ['fertilizer'],
      activeIngredients: ['Ácido fórmico'],
      nutrients: ['Nitrógeno'],
      targets: ['Pulgón'],
      recipes: [
        buildRecipe({
          name: 'Purín clásico',
          description: 'Maceración en agua.',
          brewTime: '10 días',
          ingredients: [{ item: 'Ortiga', quantity: '1 kg' }],
          instructions: ['Picar hojas'],
          dosage: {
            method: 'foliar',
            dilution: '1:10',
            frequency: 'Semanal'
          },
          storage: {
            duration: '6 meses',
            conditions: 'Oscuro',
            spoilageSigns: 'Olor'
          },
          safetyNotes: ['Guantes']
        })
      ]
    });

    const result = fromGardenInputEntity(entity);

    expect(result).toEqual({
      id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
      slug: 'purin-ortiga',
      name: 'Purín de ortiga',
      category: 'fertilizer',
      description: 'Extracto fermentado.',
      actions: ['fertilizer'],
      activeIngredientsText: 'Ácido fórmico',
      nutrientsText: 'Nitrógeno',
      targetsText: 'Pulgón',
      images: [],
      videoResources: [],
      articleResources: [],
      recipes: [
        {
          name: 'Purín clásico',
          description: 'Maceración en agua.',
          brewTime: '10 días',
          ingredients: [{ item: 'Ortiga', quantity: '1 kg' }],
          instructions: ['Picar hojas'],
          dosageMethod: 'foliar',
          dosageDilution: '1:10',
          dosageFrequency: 'Semanal',
          storageDuration: '6 meses',
          storageConditions: 'Oscuro',
          storageSpoilageSigns: 'Olor',
          safetyNotesText: 'Guantes'
        }
      ]
    });
  });

  it('converts entity resources (images, videos, articles) to form item arrays', () => {
    const entity = buildGardenInput({
      resources: [
        {
          type: 'image',
          url: 'https://example.com/foto.jpg',
          title: 'Foto',
          source: 'Fuente'
        },
        {
          type: 'video',
          url: 'https://youtube.com/watch?v=123',
          title: 'Vídeo'
        },
        {
          type: 'article',
          url: 'https://example.com/articulo',
          title: 'Artículo'
        }
      ]
    });

    const result = fromGardenInputEntity(entity);

    expect(result.images).toEqual([
      expect.objectContaining({
        url: 'https://example.com/foto.jpg',
        title: 'Foto',
        source: 'Fuente'
      })
    ]);
    expect(result.videoResources).toEqual([
      expect.objectContaining({
        url: 'https://youtube.com/watch?v=123',
        title: 'Vídeo'
      })
    ]);
    expect(result.articleResources).toEqual([
      expect.objectContaining({
        url: 'https://example.com/articulo',
        title: 'Artículo'
      })
    ]);
  });

  it('handles empty optional entity fields with default fallback values', () => {
    const entity = buildGardenInput({
      description: undefined,
      actions: undefined,
      activeIngredients: undefined,
      nutrients: undefined,
      targets: undefined,
      recipes: undefined
    });

    const result = fromGardenInputEntity(entity);

    expect(result.description).toBe('');
    expect(result.actions).toEqual([]);
    expect(result.activeIngredientsText).toBe('');
    expect(result.nutrientsText).toBe('');
    expect(result.targetsText).toBe('');
    expect(result.images).toEqual([]);
    expect(result.videoResources).toEqual([]);
    expect(result.articleResources).toEqual([]);
    expect(result.recipes).toEqual([]);
  });
});
