import { describe, expect, it } from 'vitest';

import {
  isPreconditionConflict,
  mapLocationError
} from '../../../../../src/pages/settings/locations/utils/mapLocationError';
import { ApiError } from '../../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';

describe('isPreconditionConflict', () => {
  it.each([412, 428])(
    'devuelve true para ApiError con código de precondición %i',
    (status) => {
      const error = new ApiError('Conflict', status);

      const result = isPreconditionConflict(error);

      expect(result).toBe(true);
    }
  );

  it('devuelve true para PreconditionFailedError', () => {
    const error = new PreconditionFailedError('ETag mismatch');

    const result = isPreconditionConflict(error);

    expect(result).toBe(true);
  });

  it.each([400, 401, 404, 409, 500])(
    'devuelve false para ApiError con status no relacionado %i',
    (status) => {
      const error = new ApiError('Error', status);

      const result = isPreconditionConflict(error);

      expect(result).toBe(false);
    }
  );

  it('devuelve false para errores genéricos o valores no ApiError', () => {
    const error = new Error('Generic error');

    const result = isPreconditionConflict(error);

    expect(result).toBe(false);
  });
});

describe('mapLocationError', () => {
  it.each([
    new PreconditionFailedError('Precondition failed'),
    new ApiError('Precondition required', 428)
  ])('marca conflicto para errores de precondición', (error) => {
    const result = mapLocationError(error);

    expect(result).toEqual({
      fieldErrors: {},
      isConflict: true,
      isHandled: true
    });
  });

  it('marca error de duplicado en nombre para estado 409', () => {
    const error = new ApiError('Conflict', 409);

    const result = mapLocationError(error);

    expect(result).toEqual({
      fieldErrors: { name: 'duplicate' },
      isConflict: false,
      isHandled: true
    });
  });

  it('extrae errores de campos reconocidos para estado 400', () => {
    const error = new ApiError('Bad Request', 400, {
      name: 'name_required',
      latitude: 'latitude_invalid',
      longitude: 'longitude_required',
      unrelated: 'should_be_ignored'
    });

    const result = mapLocationError(error);

    expect(result).toEqual({
      fieldErrors: {
        name: 'name_required',
        latitude: 'latitude_invalid',
        longitude: 'longitude_required'
      },
      isConflict: false,
      isHandled: true
    });
  });

  it('marca isHandled false cuando el error 400 no contiene campos reconocidos', () => {
    const error = new ApiError('Bad Request', 400, {
      unrelated: 'ignored'
    });

    const result = mapLocationError(error);

    expect(result).toEqual({
      fieldErrors: {},
      isConflict: false,
      isHandled: false
    });
  });

  it('marca isHandled false para errores 400 sin objeto de errores', () => {
    const error = new ApiError('Bad Request', 400);

    const result = mapLocationError(error);

    expect(result).toEqual({
      fieldErrors: {},
      isConflict: false,
      isHandled: false
    });
  });

  it('devuelve estado no manejado para errores desconocidos', () => {
    const error = new Error('Unhandled network failure');

    const result = mapLocationError(error);

    expect(result).toEqual({
      fieldErrors: {},
      isConflict: false,
      isHandled: false
    });
  });
});
