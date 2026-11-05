import { describe, expect, it } from 'vitest';

import { resolveAnomalySubmitError } from '../../../../../src/pages/anomalies/components/AnomalyForm/utils/resolveAnomalySubmitError';
import { ApiError } from '../../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';

describe('resolveAnomalySubmitError', () => {
  it('clasifica el 412 como conflicto', () => {
    const error = new PreconditionFailedError();

    const result = resolveAnomalySubmitError(error);

    expect(result).toEqual({ kind: 'conflict' });
  });

  it.each([401, 403])('clasifica el %s como sesión caducada', (status) => {
    const error = new ApiError('x', status);

    const result = resolveAnomalySubmitError(error);

    expect(result).toEqual({ kind: 'session' });
  });

  it('usa el aviso de slug duplicado para el 409', () => {
    const error = new ApiError('dup', 409);

    const result = resolveAnomalySubmitError(error);

    expect(result).toEqual({
      kind: 'general',
      fieldErrors: {},
      message: 'Ya existe una anomalía registrada con este slug.'
    });
  });

  it('asigna errores por campo del 400 sin mensaje general', () => {
    const error = new ApiError('bad', 400, { name: 'requerido' });

    const result = resolveAnomalySubmitError(error);

    expect(result).toEqual({
      kind: 'general',
      fieldErrors: { name: 'requerido' },
      message: null
    });
  });

  it('une los errores no mapeados en un mensaje general', () => {
    const error = new ApiError('bad', 400, { x: 'a', y: 'b' });

    const result = resolveAnomalySubmitError(error);

    expect(result).toMatchObject({ message: 'a; b' });
  });

  it('usa el mensaje de la API cuando no hay errores por campo', () => {
    const error = new ApiError('Fallo del servidor', 500);

    const result = resolveAnomalySubmitError(error);

    expect(result).toMatchObject({ message: 'Fallo del servidor' });
  });

  it('tolera errores que no son de la API', () => {
    const err = new Error('red');
    const unknown = 'raro';

    expect(resolveAnomalySubmitError(err)).toMatchObject({
      message: 'red'
    });
    expect(resolveAnomalySubmitError(unknown)).toMatchObject({
      message: 'La aplicación ha dejado de funcionar'
    });
  });
});
