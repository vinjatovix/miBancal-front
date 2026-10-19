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
    ['admin.heading', 'Administración de usuarios']
  ] as const)('translates %s to %s', (key, expected) => {
    const result = t(key);

    expect(result).toBe(expected);
  });
});

describe('admin dictionary keys', () => {
  it.each([
    ['admin.heading', 'Administración de usuarios'],
    [
      'admin.description',
      'Busca cuentas de usuario para consultar sus datos y gestionar sus privilegios administrativos.'
    ],
    ['admin.search_label', 'Buscar usuario'],
    ['admin.search_placeholder', 'username o email'],
    ['admin.search_button', 'Buscar'],
    ['admin.search_loading', 'Buscando...'],
    [
      'admin.search_invalid_email',
      'El formato del correo electrónico no es válido. Corrígelo antes de buscar.'
    ],
    [
      'admin.search_empty_error',
      'Introduce un correo o nombre de usuario para buscar.'
    ],
    [
      'admin.user_not_found',
      'No se encontró ningún usuario con los datos introducidos.'
    ],
    ['admin.account_card_title', 'Datos de la cuenta'],
    ['admin.field_id', 'ID Único'],
    ['admin.field_username', 'Nombre de usuario'],
    ['admin.field_email', 'Correo electrónico'],
    ['admin.field_roles', 'Roles asignados'],
    ['admin.role_user_label', 'Usuario estándar'],
    ['admin.role_admin_label', 'Administrador'],
    [
      'admin.role_admin_checkbox_label',
      'Conceder privilegios de administrador'
    ],
    ['admin.save_changes_button', 'Guardar cambios'],
    [
      'admin.self_edit_forbidden_warning',
      'Esta es tu cuenta activa. No es posible modificar tus propios privilegios de administración para evitar bloqueos accidentales de acceso.'
    ],
    [
      'admin.concurrent_modification_warning',
      'La versión del documento está obsoleta. Vuelve a cargar la página para obtener los datos más recientes.'
    ],
    [
      'admin.role_change_success',
      'Los roles del usuario se han actualizado correctamente.'
    ],
    ['admin.confirm_modal_title', 'Confirmar modificación de roles'],
    ['admin.confirm_button', 'Confirmar cambios'],
    ['admin.confirm_loading', 'Guardando...'],
    ['admin.cancel_button', 'Cancelar'],
    ['admin.role_collab_label', 'Colaborador'],
    ['admin.role_collab_label_with_code', 'Colaborador (collaborator)'],
    [
      'admin.modal_security_warning_grant_collab',
      'Este usuario estará autorizado para editar los catálogos del sistema.'
    ],
    [
      'admin.modal_security_warning_revoke_collab',
      'Este usuario perderá los permisos de edición de catálogos.'
    ],
    [
      'admin.modal_security_warning_modify',
      'Se actualizarán los permisos de acceso del usuario en el sistema.'
    ]
  ] as const)('translates %s to %s', (key, expected) => {
    const result = t(key);

    expect(result).toBe(expected);
  });

  it.each([
    [
      'admin.confirm_modal_grant_desc',
      { username: 'hortelano' },
      '¿Confirmas que deseas otorgar permisos de Administrador al usuario hortelano?'
    ],
    [
      'admin.confirm_modal_revoke_desc',
      { username: 'hortelano' },
      '¿Confirmas que deseas revocar los permisos de Administrador al usuario hortelano?'
    ],
    [
      'admin.confirm_modal_grant_collab_desc',
      { username: 'hortelano' },
      '¿Confirmas que deseas otorgar permisos de Colaborador al usuario hortelano?'
    ],
    [
      'admin.confirm_modal_revoke_collab_desc',
      { username: 'hortelano' },
      '¿Confirmas que deseas revocar los permisos de Colaborador al usuario hortelano?'
    ],
    [
      'admin.confirm_modal_modify_roles_desc',
      { username: 'hortelano' },
      '¿Confirmas que deseas modificar los roles asignados al usuario hortelano?'
    ]
  ] as const)('interpolates username in %s', (key, params, expected) => {
    const result = t(key, params);

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
