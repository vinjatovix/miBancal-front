import { describe, expect, it } from 'vitest';
import { t } from '../../../src/i18n/core/t';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import { PreconditionFailedError } from '../../../src/shared/errors/PreconditionFailedError';
import { resolveErrorToastPayload } from '../../../src/shared/toast/resolveErrorToastPayload';

describe('resolveErrorToastPayload', () => {
  it('normalizes 429 rate limit ApiError into tooManyRequests title and message', () => {
    const error = new ApiError('Rate limit exceeded', 429);

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('errors.tooManyRequests.title'),
      message: t('errors.tooManyRequests.message')
    });
  });

  it('normalizes PreconditionFailedError into conflict title and concurrent modification toast message', () => {
    const error = new PreconditionFailedError();

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('errors.conflict.title'),
      message: t('toast.concurrent_modification')
    });
  });

  it('normalizes ApiError with status 412 into conflict title and concurrent modification message', () => {
    const error = new ApiError('Precondition Failed', 412);

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('errors.conflict.title'),
      message: t('toast.concurrent_modification')
    });
  });

  it('normalizes ApiError with status 400 and field errors into form validation check prompt', () => {
    const error = new ApiError('Bad Request', 400, {
      name: 'El nombre es obligatorio'
    });

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('admin.toast_error_title'),
      message: t('toast.form_validation_check')
    });
  });

  it('normalizes ApiError with status 400 without errors map using error message', () => {
    const error = new ApiError('Formato inválido', 400);

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('admin.toast_error_title'),
      message: 'Formato inválido'
    });
  });

  it('normalizes ApiError with status 409 into admin toast error title and error message', () => {
    const error = new ApiError('Conflicto de unicidad', 409);

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('admin.toast_error_title'),
      message: 'Conflicto de unicidad'
    });
  });

  it('normalizes ApiError with status 401 into invalid credentials title and error message', () => {
    const error = new ApiError('Credenciales erróneas', 401);

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('auth.invalid_credentials'),
      message: 'Credenciales erróneas'
    });
  });

  it('normalizes NetworkError into offline title and message', () => {
    const error = new NetworkError(new Error('Failed to fetch'));

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('errors.offline.title'),
      message: t('errors.offline.message')
    });
  });

  it('normalizes generic Error into default toast title and error message', () => {
    const error = new Error('Fallo inesperado del sistema');

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('admin.toast_error_title'),
      message: 'Fallo inesperado del sistema'
    });
  });

  it('normalizes plain string into default toast title and string message', () => {
    const error = 'Mensaje de error directo';

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('admin.toast_error_title'),
      message: 'Mensaje de error directo'
    });
  });

  it('normalizes structured object with custom title and message', () => {
    const error = {
      title: 'Aviso personalizado',
      message: 'Detalle del problema'
    };

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: 'Aviso personalizado',
      message: 'Detalle del problema'
    });
  });

  it('uses fallbackMessage when unknown error is provided and fallbackMessage is given', () => {
    const error = null;

    const payload = resolveErrorToastPayload(error, 'Mensaje alternativo');

    expect(payload).toEqual({
      title: t('admin.toast_error_title'),
      message: 'Mensaje alternativo'
    });
  });

  it('uses t("errors.unknown.message") when unknown error is provided without fallbackMessage', () => {
    const error = undefined;

    const payload = resolveErrorToastPayload(error);

    expect(payload).toEqual({
      title: t('admin.toast_error_title'),
      message: t('errors.unknown.message')
    });
  });
});
