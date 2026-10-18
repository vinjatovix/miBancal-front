import { describe, expect, it } from 'vitest';

import { t } from '../../../src/i18n/core/t';

describe('auth and admin dictionary keys', () => {
  it.each([
    ['app.brand', 'MiBancal'],
    [
      'app.welcome_message',
      'Bienvenido a MiBancal, tu guía de cultivo de plantas.'
    ],
    ['app.nav.menu', 'Menú de navegación'],
    ['auth.heading', 'Acceso'],
    ['auth.login', 'Iniciar sesión'],
    ['auth.show_password', 'Mostrar contraseña'],
    ['auth.hide_password', 'Ocultar contraseña'],
    ['auth.register', 'Crear cuenta'],
    ['auth.logout', 'Cerrar sesión'],
    [
      'auth.rate_limit_notice',
      'Demasiados intentos. Por favor, inténtalo más tarde.'
    ],
    ['admin.heading', 'Administración']
  ] as const)('translates %s to %s', (key, expected) => {
    const result = t(key);

    expect(result).toBe(expected);
  });
});

describe('clear_range dictionary key with interpolation', () => {
  it.each([
    [{ label: 'altura' }, 'Quitar filtro de altura'],
    [{ label: 'Separación' }, 'Quitar filtro de Separación'],
    [{ label: 'Profundidad de suelo' }, 'Quitar filtro de Profundidad de suelo']
  ])('interpolates label parameter into %s', (params, expected) => {
    const result = t('plant.filters.clear_range', params);

    expect(result).toBe(expected);
  });
});

describe('settings dictionary keys', () => {
  it.each([
    ['settings.nav_link', 'Configuración de la cuenta'],
    ['settings.title', 'Configuración de la cuenta'],
    ['settings.profile_section', 'Perfil'],
    ['settings.profile_username', 'Nombre de usuario'],
    ['settings.profile_email', 'Correo electrónico'],
    ['settings.security_section', 'Seguridad'],
    ['settings.old_password', 'Contraseña actual'],
    ['settings.new_password', 'Nueva contraseña'],
    ['settings.repeat_new_password', 'Confirmar nueva contraseña'],
    ['settings.change_password_submit', 'Cambiar contraseña'],
    ['settings.success_message', 'Contraseña actualizada correctamente'],
    ['settings.invalid_current_password', 'La contraseña actual no es válida'],
    [
      'settings.password_must_be_different',
      'La nueva contraseña debe ser diferente de la anterior'
    ]
  ] as const)('translates %s to %s', (key, expected) => {
    const result = t(key);

    expect(result).toBe(expected);
  });
});

describe('sso dictionary keys', () => {
  it.each([
    ['auth.github_login', 'Continuar con GitHub'],
    ['auth.sso_processing', 'Procesando autenticación...'],
    [
      'auth.sso_access_denied',
      'Has cancelado la autorización con el proveedor externo.'
    ],
    [
      'auth.sso_google_invalid',
      'El token de Google no es válido o la cuenta no tiene un correo verificado.'
    ],
    [
      'auth.sso_github_invalid',
      'La autorización de GitHub no es válida, ha caducado o no tiene un correo verificado.'
    ],
    [
      'auth.sso_security_error',
      'Error de validación de seguridad durante la autenticación. Por favor, inténtalo de nuevo.'
    ],
    [
      'auth.sso_unavailable',
      'El servicio de autenticación externa no está disponible en este momento. Inténtalo más tarde o accede con correo y contraseña.'
    ],
    [
      'auth.sso_conflict',
      'El correo proporcionado ya está vinculado a otro método o cuenta de acceso.'
    ]
  ] as const)('translates %s to %s', (key, expected) => {
    const result = t(key);

    expect(result).toBe(expected);
  });
});
