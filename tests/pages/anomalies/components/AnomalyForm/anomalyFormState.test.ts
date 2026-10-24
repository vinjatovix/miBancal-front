import type { AnomalyFormState } from '../../../../../src/pages/anomalies/components/AnomalyForm/types';
import {
  anomalyToFormState,
  formStateToCreateAnomalyRequest,
  formStateToUpdateAnomalyRequest,
  initialAnomalyFormState,
  normalizeAnomalyApiErrors
} from '../../../../../src/pages/anomalies/components/AnomalyForm/utils/anomalyFormMappers';
import { resolveAnomalySubmitError } from '../../../../../src/pages/anomalies/components/AnomalyForm/utils/resolveAnomalySubmitError';
import { validateAnomalyForm } from '../../../../../src/pages/anomalies/components/AnomalyForm/utils/validateAnomalyForm';
import { ApiError } from '../../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';
import { buildAnomaly } from '../../../../fixtures/anomalies/buildAnomaly';

function validState(
  overrides: Partial<AnomalyFormState> = {}
): AnomalyFormState {
  return {
    ...initialAnomalyFormState(),
    slug: 'pulgon-verde',
    name: 'Pulgón verde',
    category: 'pest',
    ...overrides
  };
}

describe('validateAnomalyForm', () => {
  it('acepta un alta con solo los obligatorios', () => {
    expect(validateAnomalyForm(validState(), 'create')).toEqual({});
  });

  it('exige slug, nombre y categoría en el alta', () => {
    const errors = validateAnomalyForm(initialAnomalyFormState(), 'create');

    expect(Object.keys(errors).sort()).toEqual(['category', 'name', 'slug']);
  });

  it.each(['Pulgón', 'a--b', '-a', 'a-', 'a b', 'a'.repeat(121)])(
    'rechaza el slug no kebab-case o demasiado largo %s',
    (slug) => {
      expect(validateAnomalyForm(validState({ slug }), 'create').slug).toBe(
        'El slug solo puede contener letras minúsculas, números y guiones sencillos (máximo 120).'
      );
    }
  );

  it('acepta un slug de 120 caracteres', () => {
    expect(
      validateAnomalyForm(validState({ slug: 'a'.repeat(120) }), 'create')
    ).toEqual({});
  });

  it('no valida el slug en edición porque es inmutable', () => {
    expect(
      validateAnomalyForm(validState({ slug: 'Slug Raro' }), 'edit')
    ).toEqual({});
  });

  it('rechaza nombre en blanco o de más de 200 caracteres', () => {
    expect(validateAnomalyForm(validState({ name: '   ' }), 'edit').name).toBe(
      'Este campo es obligatorio.'
    );
    expect(
      validateAnomalyForm(validState({ name: 'x'.repeat(201) }), 'edit').name
    ).toBe('Máximo 200 caracteres.');
    expect(
      validateAnomalyForm(validState({ name: 'x'.repeat(200) }), 'edit')
    ).toEqual({});
  });

  it('rechaza una categoría fuera del enum', () => {
    const state = validState({ category: 'virus' as never });

    expect(validateAnomalyForm(state, 'edit').category).toBe(
      'Selecciona una categoría válida.'
    );
  });

  it('limita nombre científico a 200 y descripción a 2000', () => {
    const errors = validateAnomalyForm(
      validState({
        scientificName: 'x'.repeat(201),
        description: 'x'.repeat(2001)
      }),
      'edit'
    );

    expect(errors.scientificName).toBe('Máximo 200 caracteres.');
    expect(errors.description).toBe('Máximo 2000 caracteres.');
    expect(
      validateAnomalyForm(validState({ description: 'x'.repeat(2000) }), 'edit')
    ).toEqual({});
  });

  it('limita cada línea de las listas a 2000 caracteres', () => {
    const errors = validateAnomalyForm(
      validState({
        symptoms: `ok\n${'x'.repeat(2001)}`,
        damage: 'x'.repeat(2000)
      }),
      'edit'
    );

    expect(errors.symptoms).toBe(
      'Cada línea admite como máximo 2000 caracteres.'
    );
    expect(errors.damage).toBeUndefined();
  });
});

describe('formStateToCreateAnomalyRequest', () => {
  it('envía solo obligatorios cuando lo demás está vacío', () => {
    const request = formStateToCreateAnomalyRequest(
      validState({ scientificName: '  ', description: '' }),
      'id-1'
    );

    expect(request).toEqual({
      id: 'id-1',
      slug: 'pulgon-verde',
      name: 'Pulgón verde',
      category: 'pest',
      scientificName: undefined,
      description: undefined
    });
  });

  it('descarta blancos, recorta y deduplica las líneas de las listas', () => {
    const request = formStateToCreateAnomalyRequest(
      validState({
        symptoms: '  Hojas enrolladas \n\n   \nMelaza\nHojas enrolladas',
        treatment: '\n\n'
      }),
      'id-1'
    );

    expect(request.symptoms).toEqual(['Hojas enrolladas', 'Melaza']);
    expect(request).not.toHaveProperty('treatment');
  });

  it('genera el id con randomUUID si no se pasa', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '22222222-2222-4222-8222-222222222222'
    );

    expect(formStateToCreateAnomalyRequest(validState()).id).toBe(
      '22222222-2222-4222-8222-222222222222'
    );
  });

  it('no envía campos de solo lectura', () => {
    const keys = Object.keys(formStateToCreateAnomalyRequest(validState()));

    ['version', 'status', 'deletedAt', 'metadata'].forEach((readOnly) =>
      expect(keys).not.toContain(readOnly)
    );
  });
});

describe('formStateToUpdateAnomalyRequest', () => {
  const anomaly = buildAnomaly();
  const initial = anomalyToFormState(anomaly);

  it('devuelve {} cuando no hay cambios', () => {
    expect(formStateToUpdateAnomalyRequest({ ...initial }, initial)).toEqual(
      {}
    );
  });

  it('ignora cambios que solo son espacios o duplicados', () => {
    const state = {
      ...initial,
      name: `  ${initial.name} `,
      symptoms: `${initial.symptoms}\n\n  `
    };

    expect(formStateToUpdateAnomalyRequest(state, initial)).toEqual({});
  });

  it('envía solo los campos modificados', () => {
    const state = {
      ...initial,
      description: ' Nueva descripción ',
      prevention: `${initial.prevention}\nRotación de cultivos`
    };

    expect(formStateToUpdateAnomalyRequest(state, initial)).toEqual({
      description: 'Nueva descripción',
      prevention: ['Fomentar fauna auxiliar', 'Rotación de cultivos']
    });
  });

  it('envía null para limpiar opcionales y listas vaciadas', () => {
    const state = {
      ...initial,
      scientificName: '',
      description: '  ',
      naturalEnemies: ''
    };

    expect(formStateToUpdateAnomalyRequest(state, initial)).toEqual({
      scientificName: null,
      description: null,
      naturalEnemies: null
    });
  });

  it('permite cambiar nombre y categoría y nunca envía el slug', () => {
    const state = {
      ...initial,
      name: 'Otro',
      category: 'disease' as const,
      slug: 'otro'
    };

    const patch = formStateToUpdateAnomalyRequest(state, initial);

    expect(patch).toEqual({ name: 'Otro', category: 'disease' });
    expect(patch).not.toHaveProperty('slug');
  });
});

describe('anomalyToFormState', () => {
  it('convierte listas a texto multilínea y opcionales ausentes a vacío', () => {
    const state = anomalyToFormState(
      buildAnomaly({
        scientificName: undefined,
        description: undefined,
        symptoms: ['A', 'B'],
        damage: undefined
      })
    );

    expect(state.symptoms).toBe('A\nB');
    expect(state.damage).toBe('');
    expect(state.scientificName).toBe('');
    expect(state.description).toBe('');
  });
});

describe('normalizeAnomalyApiErrors', () => {
  it('asigna los errores del 400 a sus campos, incluidas las posiciones de lista', () => {
    const { fieldErrors, unmappedErrors } = normalizeAnomalyApiErrors({
      name: 'requerido',
      'symptoms.1': 'demasiado largo',
      'treatment[0]': 'vacío',
      other: 'algo raro'
    });

    expect(fieldErrors).toEqual({
      name: 'requerido',
      symptoms: 'demasiado largo',
      treatment: 'vacío'
    });
    expect(unmappedErrors).toEqual(['algo raro']);
  });
});

describe('resolveAnomalySubmitError', () => {
  it('clasifica el 412 como conflicto', () => {
    expect(resolveAnomalySubmitError(new PreconditionFailedError())).toEqual({
      kind: 'conflict'
    });
  });

  it.each([401, 403])('clasifica el %s como sesión caducada', (status) => {
    expect(resolveAnomalySubmitError(new ApiError('x', status))).toEqual({
      kind: 'session'
    });
  });

  it('usa el aviso de slug duplicado para el 409', () => {
    expect(resolveAnomalySubmitError(new ApiError('dup', 409))).toEqual({
      kind: 'general',
      fieldErrors: {},
      message: 'Ya existe una anomalía registrada con este slug.'
    });
  });

  it('asigna errores por campo del 400 sin mensaje general', () => {
    expect(
      resolveAnomalySubmitError(new ApiError('bad', 400, { name: 'requerido' }))
    ).toEqual({
      kind: 'general',
      fieldErrors: { name: 'requerido' },
      message: null
    });
  });

  it('une los errores no mapeados en un mensaje general', () => {
    expect(
      resolveAnomalySubmitError(new ApiError('bad', 400, { x: 'a', y: 'b' }))
    ).toMatchObject({ message: 'a; b' });
  });

  it('usa el mensaje de la API cuando no hay errores por campo', () => {
    expect(
      resolveAnomalySubmitError(new ApiError('Fallo del servidor', 500))
    ).toMatchObject({ message: 'Fallo del servidor' });
  });

  it('tolera errores que no son de la API', () => {
    expect(resolveAnomalySubmitError(new Error('red'))).toMatchObject({
      message: 'red'
    });
    expect(resolveAnomalySubmitError('raro')).toMatchObject({
      message: 'La aplicación ha dejado de funcionar'
    });
  });
});
