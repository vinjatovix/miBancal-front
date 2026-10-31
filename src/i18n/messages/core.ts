import { registerMessages } from '../core/registry';

export const coreMessages = {
  app: {
    brand: 'MiBancal',
    welcome_message: 'Bienvenido a MiBancal, tu guía de cultivo de plantas.',

    info: {
      title: 'Información del proyecto',
      nonprofit: 'Este proyecto es open source y no tiene ánimo de lucro.',

      images:
        'Las imágenes provienen de Wikimedia Commons o son de elaboración propia.',

      videos:
        'Algunos vídeos están incrustados desde YouTube. Se reconoce y agradece el trabajo de sus creadores.',

      youtube_notice:
        'Si algún creador no desea que su contenido sea mostrado aquí, puede solicitar su retirada o desactivar la incrustación desde YouTube.',

      disclaimer:
        'La información ha sido recopilada de distintas fuentes en internet y organizada de forma accesible. No se garantiza su exactitud y no nos hacemos responsables del uso o de posibles daños derivados.',

      feedback:
        'Si falta información o encuentras errores, puedes contribuir. Se aceptan sugerencias y feedback para mejorar el contenido.',
      contact: 'Contacto',
      contact_text: 'Si quieres sugerir cambios o reportar contenido:',
      email: 'Escríbeme a'
    },
    nav: {
      plants: 'Plantas',
      families: 'Familias',
      anomalies: 'Anomalías',
      gardenInputs: 'Insumos',
      plantRelations: 'Relaciones',
      menu: 'Menú de navegación',
      menu_title: 'Menú',
      close: 'Cerrar',
      rail_title: 'Navegación principal',
      bottom_title: 'Navegación inferior',
      rail_toggle_expand: 'Expandir menú de navegación',
      rail_toggle_collapse: 'Contraer menú de navegación',
      account_menu: 'Menú de cuenta y configuración'
    }
  },
  auth: {
    heading: 'Acceso',
    login: 'Iniciar sesión',
    register: 'Crear cuenta',
    logout: 'Cerrar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    show_password: 'Mostrar contraseña',
    hide_password: 'Ocultar contraseña',
    repeat_password: 'Repetir contraseña',
    username: 'Nombre de usuario',
    login_submit: 'Iniciar sesión',
    register_submit: 'Crear cuenta',
    activate_submit: 'Activar cuenta',
    activate_title: 'Activación de cuenta',
    activate_success: 'Cuenta activada',
    activate_success_text:
      'Tu cuenta ha sido activada con éxito. Ya puedes iniciar sesión.',
    activate_error: 'Enlace no válido o caducado',
    activate_error_text:
      'El enlace de activación no es válido o ha caducado. Comprueba tu correo o solicita uno nuevo.',
    activate_ready_text:
      'Pulsa el botón para confirmar la activación de tu cuenta.',
    register_success: 'Revisa tu correo para activar la cuenta',
    register_success_text:
      'Hemos enviado un enlace de activación a tu dirección de correo electrónico.',
    invalid_credentials: 'Credenciales no válidas',
    unverified_account_notice: '¿No has activado tu cuenta? Revisa tu correo',
    rate_limit_notice: 'Demasiados intentos. Por favor, inténtalo más tarde.',
    username_taken:
      'El nombre de usuario ya está en uso. Por favor, elige otro.',
    username_requirements:
      'El nombre de usuario debe tener entre 4 y 20 caracteres.',
    passwords_dont_match: 'Las contraseñas no coinciden',
    invalid_email: 'Introduce una dirección de correo válida',
    password_requirements:
      'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial.',
    password_strength_weak: 'Débil',
    password_strength_medium: 'Media',
    password_strength_strong: 'Fuerte',
    required_field: 'Campo obligatorio',
    google_login: 'Continuar con Google',
    github_login: 'Continuar con GitHub',
    sso_processing: 'Procesando autenticación...',
    sso_access_denied:
      'Has cancelado la autorización con el proveedor externo.',
    sso_google_invalid:
      'El token de Google no es válido o la cuenta no tiene un correo verificado.',
    sso_github_invalid:
      'La autorización de GitHub no es válida, ha caducado o no tiene un correo verificado.',
    sso_security_error:
      'Error de validación de seguridad durante la autenticación. Por favor, inténtalo de nuevo.',
    sso_unavailable:
      'El servicio de autenticación externa no está disponible en este momento. Inténtalo más tarde o accede con correo y contraseña.',
    sso_conflict:
      'El correo proporcionado ya está vinculado a otro método o cuenta de acceso.',
    sso_separator: 'o',
    github: 'GitHub',
    meta: 'Meta',
    sso_preview: 'próximamente',
    no_account: '¿No tienes cuenta? Regístrate',
    has_account: '¿Ya tienes cuenta? Inicia sesión',
    forgot_link: '¿Olvidaste la contraseña?',
    forgot_title: 'Restablecer contraseña',
    forgot_email: 'Correo electrónico',
    forgot_submit: 'Enviar enlace',
    forgot_uniform_notice:
      'Si existe una cuenta con ese correo, te hemos enviado un enlace para restablecer la contraseña.',
    reset_title: 'Nueva contraseña',
    reset_password: 'Nueva contraseña',
    reset_repeat_password: 'Repetir nueva contraseña',
    reset_submit: 'Confirmar contraseña',
    reset_success: 'Contraseña restablecida',
    reset_success_text:
      'Tu contraseña se ha restablecido con éxito. Ya puedes iniciar sesión.',
    reset_go_to_login: 'Ir a login',
    reset_invalid_link: 'Enlace no válido o caducado',
    reset_invalid_link_text:
      'El enlace de restablecimiento no es válido o ha caducado. Solicita uno nuevo.',
    reset_request_again: 'Solicitar un enlace nuevo',
    insufficient_permissions: {
      title: 'Permisos insuficientes',
      message:
        'Se requiere rol de Colaborador o Administrador para crear o modificar fichas del catálogo botánico.',
      back_to_plants: 'Volver al catálogo de plantas',
      back_to_families: 'Volver al catálogo de familias',
      back_to_anomalies: 'Volver al catálogo de anomalías'
    }
  },
  admin: {
    heading: 'Administración de usuarios',
    subtitle:
      'Supervisión taxonómica, credenciales y asignación de permisos globales.',
    control_module_badge: 'Módulo de Control',
    description:
      'Busca cuentas de usuario para consultar sus datos y gestionar sus privilegios administrativos.',
    search_label: 'Buscar usuario',
    search_placeholder: 'username o email',
    search_button: 'Buscar',
    search_button_full: 'Buscar en el registro',
    search_loading: 'Buscando...',
    clear_search_aria: 'Limpiar búsqueda',
    search_invalid_email:
      'El formato del correo electrónico no es válido. Corrígelo antes de buscar.',
    search_empty_error: 'Introduce un correo o nombre de usuario para buscar.',
    user_not_found: 'No se encontró ningún usuario con los datos introducidos.',
    account_card_title: 'Datos de la cuenta',
    search_result_badge: 'Resultado de búsqueda',
    specimen_ref: 'Specimen Ref. 884',
    status_active: 'Estado: Activo',
    system_role_label: 'Rol del sistema:',
    email_verified: 'Verificado',
    user_details_title: 'Datos de la cuenta',
    user_roles_title: 'Roles del usuario',
    field_id: 'ID Único',
    copy_id: 'Copiar',
    copied_id: '¡Copiado!',
    copy_id_aria: 'Copiar ID',
    field_username: 'Nombre de usuario',
    field_email: 'Correo electrónico',
    field_roles: 'Roles asignados',
    roles_access_management: 'Gestión de Acceso',
    roles_matrix_title: 'Matriz de Privilegios',
    roles_matrix_desc:
      'Modifica los roles de usuario vinculados al sistema RBAC agronómico. Todo cambio se registra en auditoría.',
    role_user_label: 'Usuario estándar',
    role_admin_label: 'Administrador',
    role_user_label_with_code: 'Usuario estándar (user)',
    role_admin_label_with_code: 'Administrador (admin)',
    role_admin_code: 'admin',
    role_admin_title: 'Privilegios de Administrador',
    role_admin_desc:
      'Acceso total a la configuración global, gestión de cuentas y parametrización de catálogos.',
    role_collab_title: 'Colaborador Agronómico',
    role_collab_code: 'collaborator',
    role_collab_label: 'Colaborador',
    role_collab_label_with_code: 'Colaborador (collaborator)',
    role_collab_desc: 'Autorizado para editar catálogos.',
    role_admin_checkbox_label: 'Conceder privilegios de administrador',
    roles_pending_changes: '1 cambio de privilegios pendiente',
    roles_no_pending_changes: 'Sin cambios pendientes',
    roles_status_pending: 'Pendiente',
    roles_status_stable: 'Estable',
    save_changes_button: 'Guardar cambios',
    save_roles_button: 'Guardar cambios de rol',
    save_changes: 'Guardar cambios',
    roles_reset_button: 'Limpiar',
    self_edit_forbidden_warning:
      'Esta es tu cuenta activa. No es posible modificar tus propios privilegios de administración para evitar bloqueos accidentales de acceso.',
    concurrent_modification_warning:
      'La versión del documento está obsoleta. Vuelve a cargar la página para obtener los datos más recientes.',
    role_change_success:
      'Los roles del usuario se han actualizado correctamente.',
    role_change_success_message:
      'Los roles del usuario se han actualizado correctamente.',
    toast_success_title: 'Cambios aplicados con éxito',
    toast_success_subtitle: 'Privilegios actualizados en el sistema.',
    toast_error_title: 'Error en la solicitud',
    confirm_modal_title: 'Confirmar modificación de roles',
    confirm_role_change_title: 'Confirmar modificación de roles',
    modal_security_review: 'Revisión de Seguridad del Sistema',
    modal_close: 'Cerrar ventana',
    modal_privilege_transition: 'Transición de privilegio',
    modal_current_role: 'Roles actuales',
    modal_requested_role: 'Nuevos roles solicitados',
    modal_security_warning_title: 'Aviso de seguridad:',
    modal_security_warning_grant:
      'Este usuario tendrá acceso total a la configuración y gestión de cuentas.',
    modal_security_warning_revoke:
      'Este usuario perderá los privilegios de administración del sistema.',
    modal_security_warning_grant_collab:
      'Este usuario estará autorizado para editar los catálogos del sistema.',
    modal_security_warning_revoke_collab:
      'Este usuario perderá los permisos de edición de catálogos.',
    modal_security_warning_modify:
      'Se actualizarán los permisos de acceso del usuario en el sistema.',
    confirm_modal_grant_desc:
      '¿Confirmas que deseas otorgar permisos de Administrador al usuario {username}?',
    confirm_grant_admin_message:
      '¿Confirmas que deseas otorgar permisos de Administrador al usuario {username}?',
    confirm_modal_revoke_desc:
      '¿Confirmas que deseas revocar los permisos de Administrador al usuario {username}?',
    confirm_revoke_admin_message:
      '¿Confirmas que deseas revocar los permisos de Administrador al usuario {username}?',
    confirm_modal_grant_collab_desc:
      '¿Confirmas que deseas otorgar permisos de Colaborador al usuario {username}?',
    confirm_modal_revoke_collab_desc:
      '¿Confirmas que deseas revocar los permisos de Colaborador al usuario {username}?',
    confirm_modal_modify_roles_desc:
      '¿Confirmas que deseas modificar los roles asignados al usuario {username}?',
    confirm_button: 'Confirmar cambios',
    confirm_loading: 'Guardando...',
    cancel_button: 'Cancelar'
  },
  settings: {
    nav_link: 'Configuración de la cuenta',
    title: 'Configuración de la cuenta',
    profile_section: 'Perfil',
    profile_username: 'Nombre de usuario',
    profile_email: 'Correo electrónico',
    security_section: 'Seguridad',
    old_password: 'Contraseña actual',
    new_password: 'Nueva contraseña',
    repeat_new_password: 'Confirmar nueva contraseña',
    change_password_submit: 'Cambiar contraseña',
    success_message: 'Contraseña actualizada correctamente',
    invalid_current_password: 'La contraseña actual no es válida',
    password_must_be_different:
      'La nueva contraseña debe ser diferente de la anterior'
  },
  common: {
    resources: {
      videos: 'Vídeos',
      articles: 'Artículos'
    },
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    save_changes: 'Guardar cambios',
    saving: 'Guardando...',
    creating: 'Creando...',
    deleting: 'Eliminando...',
    env_dev: 'development',

    loading: 'Cargando...',
    filters: 'Filtros',
    months: {
      short: {
        january: 'Ene',
        february: 'Feb',
        march: 'Mar',
        april: 'Abr',
        may: 'May',
        june: 'Jun',
        july: 'Jul',
        august: 'Ago',
        september: 'Sep',
        october: 'Oct',
        november: 'Nov',
        december: 'Dic'
      },
      long: {
        january: 'enero',
        february: 'febrero',
        march: 'marzo',
        april: 'abril',
        may: 'mayo',
        june: 'junio',
        july: 'julio',
        august: 'agosto',
        september: 'septiembre',
        october: 'octubre',
        november: 'noviembre',
        december: 'diciembre'
      }
    },
    drawer: {
      close: 'Cerrar panel'
    },
    modal: {
      close: 'Cerrar ventana',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      cancel_title: 'Descartar cambios',
      cancel_subtitle: 'Cambios sin guardar',
      cancel_prompt: 'Hay cambios sin guardar. ¿Deseas descartarlos y salir?',
      discard: 'Descartar cambios',
      keep_editing: 'Continuar editando'
    },
    pagination: {
      label: 'Paginación'
    }
  },

  errors: {
    offline: {
      title: 'Sin conexión',
      message:
        'No se ha podido conectar. Comprueba tu conexión e inténtalo de nuevo.'
    },
    unavailable: {
      title: 'Servicio no disponible',
      message:
        'El servicio no está disponible en este momento. Inténtalo de nuevo en unos minutos.'
    },
    badRequest: {
      title: 'Petición no válida',
      message: 'No se ha podido completar la petición.',
      listMessage: 'No se ha podido hacer la búsqueda con estos filtros.'
    },
    forbidden: {
      title: 'Acceso no permitido',
      message: 'No tienes permiso para ver este contenido.'
    },
    conflict: {
      title: 'Conflicto',
      message: 'No se puede eliminar el último administrador de la plataforma.'
    },
    validation: {
      email: 'Dirección de correo electrónico no válida.',
      required: 'Este campo es obligatorio.'
    },
    tooManyRequests: {
      title: 'Demasiadas peticiones',
      message:
        'Hay demasiadas peticiones. Espera un momento e inténtalo de nuevo.'
    },
    notFound: {
      title: 'No encontrado',
      message: 'No se ha encontrado lo que buscas.'
    },
    unknown: {
      title: 'Error inesperado',
      message: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
    },
    section: {
      message: 'No se ha podido mostrar esta sección.'
    },
    page: {
      title: 'No se ha podido mostrar la página',
      message:
        'Algo ha fallado al mostrar esta página. Puedes volver al inicio y seguir navegando.'
    },
    app: {
      title: 'La aplicación ha dejado de funcionar',
      message:
        'Ha ocurrido un error inesperado. Recarga la página para volver a intentarlo.'
    },
    actions: {
      retry: 'Reintentar',
      goHome: 'Volver al inicio',
      clearFilters: 'Quitar filtros',
      reload: 'Recargar'
    }
  },

  notFound: {
    title: 'Página no encontrada',
    message: 'La página que buscas no existe o ha cambiado de dirección.',
    plant: {
      title: 'Planta no encontrada',
      message: 'La planta no existe o ya no está disponible.'
    },
    family: {
      title: 'Familia no encontrada',
      message: 'La familia no existe.'
    },
    backHome: 'Volver al inicio',
    backToPlants: 'Volver al listado de plantas',
    anomaly: {
      title: 'Anomalía no encontrada',
      message: 'La anomalía no existe o ya no está disponible.'
    },
    backToFamilies: 'Volver al listado de familias',
    backToAnomalies: 'Volver al catálogo de anomalías',
    gardenInput: {
      title: 'Insumo no encontrado',
      message: 'El insumo no existe o ya no está disponible.'
    },
    backToGardenInputs: 'Volver al catálogo de insumos'
  },

  favoriteButton: {
    add: 'Marcar como favorita',
    remove: 'Quitar de favoritas',
    error: 'No se pudo actualizar la favorita. Inténtalo de nuevo.'
  },
  toast: {
    close: 'Cerrar notificación',
    region_label: 'Notificaciones del sistema',
    concurrent_modification:
      'El registro ha sido modificado por otro usuario. Recarga la página para ver los cambios más recientes.',
    form_validation_check:
      'Por favor, revisa los datos introducidos en el formulario.'
  }
} as const;

registerMessages(coreMessages);
