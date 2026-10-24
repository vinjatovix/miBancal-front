import { describe, expect, it } from 'vitest';

import { resolveAuthErrorText } from '../../../../src/pages/auth/utils/authErrorText';

describe('resolveAuthErrorText', () => {
  it('returns null when error key is undefined', () => {
    const result = resolveAuthErrorText(undefined);

    expect(result).toBeNull();
  });

  it('returns null when error key is unknown', () => {
    const result = resolveAuthErrorText('unknown_error_key');

    expect(result).toBeNull();
  });

  it.each([
    ['required', 'Campo obligatorio'],
    ['invalid', 'Introduce una dirección de correo válida'],
    ['taken', 'El nombre de usuario ya está en uso. Por favor, elige otro.'],
    ['mismatch', 'Las contraseñas no coinciden'],
    [
      'length',
      'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial.'
    ],
    [
      'complexity',
      'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial.'
    ],
    [
      'bytes',
      'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial.'
    ]
  ])('resolves translated message for error key %s', (key, expected) => {
    const result = resolveAuthErrorText(key);

    expect(result).toBe(expected);
  });
});
