export const dictionary = {
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
    backToAnomalies: 'Volver al catálogo de anomalías'
  },

  family: {
    catalog: {
      new_family: 'Nueva familia'
    },
    families: 'Familias',
    empty: 'No hay familias registradas.',
    select_error: 'No se han podido cargar las familias.',
    detail: {
      loading: 'Cargando familia...',
      edit_family: 'Editar'
    },
    form: {
      title_create: 'Nueva familia',
      title_edit: 'Editar familia',
      subtitle_create:
        'Registra una nueva familia taxonómica botánica en el catálogo.',
      subtitle_edit:
        'Modifica los datos taxonómicos y descriptivos de la familia.',
      fields: {
        name: 'Nombre común',
        name_placeholder: 'Ej. Solanáceas',
        scientific_name: 'Nombre científico',
        scientific_name_placeholder: 'Ej. Solanaceae',
        slug: 'Slug para URL',
        slug_placeholder: 'ej-solanaceae',
        slug_hint: 'Identificador en minúsculas y separado por guiones.',
        short_description: 'Descripción corta',
        short_description_placeholder:
          'Resumen botánico y agronómico de la familia...',
        highlights: 'Aspectos destacados',
        highlights_placeholder: 'Introduce uno por línea...',
        aliases: 'Nombres alternativos',
        aliases_placeholder: 'Separados por comas...',
        order: 'Orden taxonómico',
        order_placeholder: 'Ej. Solanales',
        distribution: 'Distribución geográfica',
        distribution_placeholder:
          'Ej. Cosmopolita, predominio en zonas tropicales',
        species_count: 'Número aproximado de especies'
      },
      validation: {
        required_field: 'Este campo es obligatorio.',
        invalid_slug:
          'El slug solo puede contener letras minúsculas, números y guiones sencillos.',
        highlights_required: 'Debes introducir al menos un aspecto destacado.',
        positive_integer: 'Debe ser un número entero mayor o igual a 1.',
        summary:
          'El formulario contiene errores o campos obligatorios pendientes de completar.'
      },
      conflict: {
        title: 'Conflicto de edición (412)',
        message:
          'La familia fue modificada por otro usuario. Recarga la ficha para ver los datos más recientes.',
        reload_button: 'Recargar ficha'
      },
      duplicate_error:
        'Ya existe una familia registrada con este nombre o slug.',
      cancel_confirm: 'Hay cambios sin guardar. ¿Deseas descartarlos y salir?'
    },
    hero: {
      order: 'Orden',
      scientific_name: 'Nombre científico',
      species: 'Especies',
      aliases: 'Alias',
      distribution: 'Distribución'
    },
    info: {
      description: 'Descripción',
      highlights: 'Destacados'
    },
    plants: {
      title: 'Plantas',
      view_all: 'Ver todas las plantas de esta familia',
      showing_count: 'Mostrando {count} de {total} plantas',
      total_count: '{total} plantas en total',
      single_count: '1 planta en total',
      empty: 'No hay plantas registradas para esta familia.'
    }
  },
  anomaly: {
    title: 'Anomalías',
    subtitle: 'Plagas, enfermedades y desórdenes de los cultivos.',
    empty: 'No hay anomalías que coincidan con los filtros.',
    empty_catalog: 'Aún no hay anomalías registradas.',
    list_error: 'No se han podido cargar las anomalías.',
    scientific_name_missing: 'Sin nombre científico',
    open_detail: 'Ver ficha de {name}',
    go_to_first_page: 'Ir a la primera página',
    page_size: 'Mostrar',
    catalog: {
      new_anomaly: 'Nueva anomalía'
    },
    categoryValues: {
      pest: 'Plaga',
      disease: 'Enfermedad',
      disorder: 'Desorden'
    },
    statusValues: {
      ACTIVE: 'Activa',
      DELETED: 'Eliminada'
    },
    filters: {
      category: 'Categoría',
      category_any: 'Todas las categorías',
      clear: 'Limpiar filtros'
    },
    sort: {
      label: 'Ordenar por',
      name_asc: 'Nombre (A-Z)',
      name_desc: 'Nombre (Z-A)',
      slug_asc: 'Slug (A-Z)',
      slug_desc: 'Slug (Z-A)'
    },
    detail: {
      loading: 'Cargando anomalía...',
      edit: 'Editar',
      delete: 'Eliminar',
      deleting: 'Eliminando...',
      delete_confirm_title: 'Eliminar anomalía',
      delete_confirm_message:
        'La anomalía dejará de ser visible para el público. ¿Deseas eliminarla?',
      delete_confirm_action: 'Eliminar anomalía',
      delete_error: 'No se ha podido eliminar la anomalía.',
      delete_conflict:
        'La anomalía fue modificada por otro usuario. Recarga la ficha para ver los datos más recientes.',
      delete_reload: 'Recargar ficha',
      scientific_name: 'Nombre científico',
      category: 'Categoría',
      slug: 'Identificador',
      deleted_at: 'Eliminada el {date}',
      no_data: 'Sin datos registrados.'
    },
    sections: {
      description: 'Descripción',
      symptoms: 'Síntomas',
      damage: 'Daños',
      causes: 'Causas',
      affectedCrops: 'Cultivos afectados',
      prevention: 'Prevención',
      treatment: 'Tratamiento',
      naturalEnemies: 'Enemigos naturales',
      confused_with: 'Diagnóstico diferencial'
    },
    carousel: {
      label: 'Galería de imágenes de la anomalía',
      roledescription: 'carrusel',
      slide_roledescription: 'diapositiva',
      prev: 'Imagen anterior',
      next: 'Imagen siguiente',
      dot_label: 'Ir a la imagen {current} de {total}',
      slide_label: 'Imagen {current} de {total}'
    },
    hero: {
      source: 'Fuente: {source}'
    },
    resources: {
      title: 'Recursos',
      video_title: 'Vídeo sobre la anomalía',
      videos: 'Vídeos',
      articles: 'Artículos'
    },
    form: {
      title_create: 'Nueva anomalía',
      title_edit: 'Editar anomalía',
      subtitle_create:
        'Registra una plaga, enfermedad o desorden en el catálogo.',
      subtitle_edit: 'Modifica los datos de la anomalía.',
      sections: {
        resources: 'Fotografías y recursos',
        images: 'Fotografías',
        videos: 'Vídeos (ej. YouTube)',
        articles: 'Artículos y referencias',
        confused_with: 'Diagnóstico diferencial'
      },
      fields: {
        name: 'Nombre común',
        name_placeholder: 'Ej. Pulgón verde',
        scientific_name: 'Nombre científico',
        scientific_name_placeholder: 'Ej. Myzus persicae',
        slug: 'Slug para URL',
        slug_placeholder: 'ej-pulgon-verde',
        slug_hint:
          'Identificador en minúsculas y separado por guiones. No se podrá cambiar después.',
        slug_locked_hint: 'El slug no se puede modificar.',
        category: 'Categoría',
        category_placeholder: 'Selecciona una categoría',
        description: 'Descripción',
        description_placeholder: 'Resumen de la anomalía...',
        list_hint: 'Introduce una línea por elemento.',
        symptoms_placeholder: 'Un síntoma por línea...',
        damage_placeholder: 'Un daño por línea...',
        causes_placeholder: 'Una causa por línea...',
        affectedCrops_placeholder: 'Un cultivo por línea...',
        prevention_placeholder: 'Una medida preventiva por línea...',
        treatment_placeholder: 'Un tratamiento por línea...',
        naturalEnemies_placeholder: 'Un enemigo natural por línea...',
        add_image: 'Añadir fotografía',
        image_url: 'URL de la imagen',
        image_url_placeholder: 'https://...',
        image_title: 'Pie de foto o título',
        image_title_placeholder: 'Ej. Síntomas visibles en el envés',
        image_source: 'Fuente o autor',
        image_source_placeholder: 'Ej. INIA / Banco de imágenes',
        remove_image: 'Eliminar fotografía',
        add_video: 'Añadir enlace de vídeo',
        video_url: 'URL del vídeo',
        video_url_placeholder: 'https://www.youtube.com/watch?v=...',
        video_title: 'Título del vídeo',
        video_title_placeholder: 'Ej. Identificación en campo',
        remove_video: 'Eliminar vídeo',
        add_article: 'Añadir artículo o referencia',
        article_url: 'URL del artículo',
        article_url_placeholder: 'https://...',
        article_title: 'Título del artículo o recurso',
        article_title_placeholder: 'Ej. Ficha técnica de control integrado',
        remove_article: 'Eliminar artículo',
        confused_with: 'Se confunde con (diagnóstico diferencial)',
        confused_with_placeholder: 'Un slug por línea (ej. pulgon-negro)...',
        confused_with_hint: 'Introduce un identificador de anomalía por línea.',
        confused_with_count: '{count} identificadores'
      },
      validation: {
        required_field: 'Este campo es obligatorio.',
        invalid_slug:
          'El slug solo puede contener letras minúsculas, números y guiones sencillos (máximo 120).',
        name_too_long: 'Máximo 200 caracteres.',
        text_too_long: 'Máximo 2000 caracteres.',
        invalid_category: 'Selecciona una categoría válida.',
        list_line_too_long: 'Cada línea admite como máximo 2000 caracteres.',
        invalid_resource_url:
          'La URL del recurso debe comenzar por http:// o https:// y tener como máximo 2048 caracteres.',
        invalid_confused_slug:
          'Cada identificador debe ser un slug válido (minúsculas, números y guiones, máx. 120 caracteres).',
        confused_slug_self: 'La anomalía no puede confundirse consigo misma.',
        confused_slug_max: 'No se pueden añadir más de 200 identificadores.',
        resources_max: 'No se pueden añadir más de 200 recursos en total.',
        summary:
          'El formulario contiene errores o campos obligatorios pendientes de completar.'
      },
      conflict: {
        title: 'Conflicto de edición',
        message:
          'La anomalía fue modificada por otro usuario. Recarga la ficha para ver los datos más recientes.',
        reload_button: 'Recargar ficha'
      },
      duplicate_error: 'Ya existe una anomalía registrada con este slug.',
      session_expired:
        'Tu sesión ha caducado. Inicia sesión de nuevo; los datos del formulario se conservan en esta pantalla.',
      login_again: 'Iniciar sesión',
      cancel_confirm: 'Hay cambios sin guardar. ¿Deseas descartarlos y salir?'
    }
  },
  plant: {
    form: {
      title_create: 'Nueva planta',
      title_edit: 'Editar planta',
      subtitle_create:
        'Introduce los datos botánicos y agronómicos para incorporar una nueva especie al catálogo.',
      subtitle_edit:
        'Modifica los atributos botánicos y agronómicos de la planta.',
      sections: {
        identity: 'Identidad y clasificación',
        traits: 'Rasgos botánicos y biológicos',
        phenology: 'Fenología, siembra y recolección',
        knowledge: 'Requisitos edafoclimáticos y cultivo',
        notes: 'Notas agronómicas',
        resources: 'Fotografía y recursos'
      },
      fields: {
        primary_name: 'Nombre común principal',
        primary_name_placeholder: 'Ej. Tomate',
        scientific_name: 'Nombre científico',
        scientific_name_placeholder: 'Ej. Solanum lycopersicum',
        family: 'Familia botánica',
        family_placeholder: 'Selecciona una familia...',
        family_create_link: '¿No encuentras la familia? Crear nueva familia',
        family_refresh: 'Actualizar listado de familias',
        aliases: 'Nombres alternativos o locales',
        aliases_placeholder: 'Separados por comas (ej. Jitomate, Tomatera)',
        lifecycle: 'Ciclo biológico',
        height: 'Altura (cm)',
        spread: 'Envergadura (cm)',
        spacing: 'Marco de plantación (cm)',
        min: 'Mín.',
        max: 'Máx.',
        edible: 'Comestible',
        toxic: 'Tóxica',
        toxicity_notes: 'Notas de toxicidad',
        toxicity_notes_placeholder:
          'Partes tóxicas, síntomas o advertencias...',
        sowing_months: 'Meses de siembra',
        seeds_per_hole: 'Semillas por golpe',
        germination_days: 'Días de germinación',
        direct_depth: 'Profundidad siembra directa (cm)',
        starter_enabled: 'Apta para semillero',
        starter_depth: 'Profundidad semillero (cm)',
        flowering_months: 'Meses de floración',
        pollination_type: 'Tipo de polinización',
        pollination_agents: 'Agentes polinizadores',
        pollination_agents_placeholder:
          'Separados por comas (ej. Abejas, abejorros, mariposas)',
        harvest_months: 'Meses de recolección',
        harvest_description: 'Indicaciones de recolección',
        harvest_description_placeholder:
          'Puntos óptimos de maduración y técnicas de cosecha...',
        soil_ph: 'pH del suelo (0-14)',
        soil_depth: 'Profundidad de suelo disponible (cm)',
        root_type: 'Tipo de raíz',
        root_depth: 'Profundidad de raíces (cm)',
        root_spread: 'Extensión radial de raíces (cm)',
        watering_frequency: 'Frecuencia de riego',
        watering_frequency_placeholder: 'Ej. regular, moderado, frecuente',
        watering_conditions: 'Condiciones de riego',
        watering_conditions_placeholder:
          'Separadas por comas (ej. Suelo húmedo sin encharcar, Evitar mojar hojas)',
        light_hours_min: 'Horas mínimas de sol directo',
        light_type: 'Tipo de luz',
        light_preference: 'Preferencia de exposición solar',
        strategic_benefits: 'Beneficios ecológicos y estratégicos',
        strategic_benefits_placeholder:
          'Separados por comas (ej. Atrae polinizadores, Repelente natural)',
        image_url: 'URL de la fotografía principal',
        image_url_placeholder: 'https://ejemplo.com/imagen.jpg',
        image_title: 'Pie de foto o descripción de la imagen',
        image_source: 'Fuente o créditos de la fotografía'
      },
      notes: {
        title: 'Notas agronómicas',
        add: 'Añadir nota',
        empty: 'No hay notas añadidas para esta planta.',
        note_label: 'Nota {n}',
        placeholder:
          'Escribe una recomendación agronómica o nota de cultivo...',
        remove: 'Eliminar nota',
        too_long: 'La nota no puede superar los 2000 caracteres.'
      },
      resources: {
        videos_title: 'Vídeos (ej. YouTube)',
        add_video: 'Añadir enlace de vídeo',
        video_url: 'URL del vídeo',
        video_url_placeholder: 'https://www.youtube.com/watch?v=...',
        video_title: 'Título o descripción del vídeo',
        video_title_placeholder: 'Ej. Tutorial de cultivo en YouTube',
        remove_video: 'Eliminar vídeo',
        empty_videos: 'No hay vídeos vinculados.',
        articles_title: 'Artículos y enlaces de interés',
        add_article: 'Añadir enlace de artículo',
        article_url: 'URL del artículo',
        article_url_placeholder: 'https://ejemplo.com/articulo',
        article_title: 'Título del artículo',
        article_title_placeholder: 'Ej. Ficha técnica de cultivo',
        remove_article: 'Eliminar artículo',
        empty_articles: 'No hay artículos vinculados.',
        invalid_url: 'La URL debe comenzar por http:// o https://'
      },
      light_preference_options: {
        none: 'Sin preferencia específica',
        morning: 'Sol de mañana',
        afternoon: 'Sol de tarde',
        all_day: 'Todo el día'
      },
      pollination_type_options: {
        none: 'Sin polinización / No aplica',
        insect: 'Insectos',
        wind: 'Viento',
        self: 'Autopolinización',
        water: 'Agua',
        bird: 'Aves',
        bat: 'Murciélagos'
      },
      image: {
        preview_alt: 'Vista previa de la fotografía',
        load_error: 'No se pudo cargar la imagen desde la URL facilitada.',
        required: 'Es obligatorio incluir al menos una imagen con URL válida.',
        invalid_url: 'La URL debe comenzar por http:// o https://'
      },
      validation: {
        required_field: 'Este campo es obligatorio.',
        invalid_range: 'El valor máximo debe ser mayor o igual que el mínimo.',
        positive_number: 'Debe ser un número mayor que 0.',
        non_negative_number: 'Debe ser un número mayor o igual que 0.',
        sowing_months_required: 'Debes seleccionar al menos un mes de siembra.',
        family_required: 'Debes seleccionar una familia botánica.',
        summary:
          'El formulario contiene errores o campos obligatorios pendientes de completar.'
      },
      conflict: {
        title: 'Conflicto de concurrencia (412)',
        message:
          'Esta planta fue modificada por otro usuario mientras la editabas. Para evitar sobrescribir información, debes recargar los datos actualizados.',
        reload_button: 'Recargar datos actuales'
      },
      duplicate_error: 'Ya existe una planta con este nombre o identificador.',
      cancel_confirm:
        'Tienes cambios sin guardar. ¿Deseas descartarlos y salir?'
    },
    safety: {
      title: 'Comestibilidad y toxicidad',
      edible: 'Comestible',
      toxic: 'Tóxica',
      flagValues: {
        yes: 'Sí',
        no: 'No',
        unknown: 'Sin dato'
      },
      toxicity_notes: 'Notas de toxicidad',
      source: 'Fuente:',
      source_name: 'Plants For A Future'
    },
    statusValues: {
      ACTIVE: 'Activa',
      DELETED: 'Borrada'
    },
    plants: 'Plantas',
    emptyState: {
      noMatches: 'Ningún resultado coincide con los filtros.',
      emptyCatalog: 'Todavía no hay plantas registradas.',
      outOfRange: 'Esta página no tiene resultados.',
      goToFirstPage: 'Ir a la primera página',
      favorites: 'Todavía no has marcado ninguna planta como favorita.',
      favorites_action: 'Explorar el catálogo'
    },
    tabs: {
      group_label: 'Pestañas del catálogo',
      all: 'Todas',
      favorites: 'Mis Favoritas'
    },
    filters: {
      clear: 'Borrar filtros',
      clear_range: 'Quitar filtro de {label}',
      search_label: 'Buscar plantas',
      search_placeholder: 'Nombre, alias...',
      aliases: 'Alias',
      family: 'Familia',
      allFamilies: 'Todas las familias',
      edible: 'Comestible',
      toxic: 'Tóxica',
      booleanValues: {
        any: 'Cualquiera',
        true: 'Sí',
        false: 'No'
      },
      boolean_no_hint: 'Elegir «No» excluye las plantas sin dato.',
      lifeCycle: 'Ciclo de vida',
      lifeCycleValues: {
        annual: 'Anual',
        biennial: 'Bienal',
        perennial: 'Perenne'
      },
      sowingMonths: 'Meses de siembra',
      sowingMethod: 'Método de siembra',
      sowingMethodValues: {
        direct: 'Directa',
        starter: 'Semillero'
      },

      lightType: 'Tipo de luz',
      lightTypeValues: {
        full_sun: 'Sol pleno',
        partial_shade: 'Sombra parcial'
      },
      rootSystem: 'Sistema radicular',
      rootSystemValues: {
        fibrous: 'Fibroso',
        taproot: 'Pivotante',
        rhizome: 'Rizoma',
        tuber: 'Tuberosa',
        adventitious: 'Adventicia',
        fasciculate: 'Fasciculada'
      },
      light: 'Luz',
      lightHoursMin: 'Horas de luz disponibles',
      strategicBenefits: 'Ecología',
      soilPh: 'pH del suelo',
      spacingCm: 'Espacio disponible (cm)',
      soilAvailableDepthCm: 'Profundidad disponible (cm)',
      active_count: '{n} activos',
      families_count: '{n} registradas',
      page_size: 'Mostrar'
    },
    applied: {
      title: 'Filtros aplicados',
      clear_all: 'Limpiar todo',
      remove: 'Quitar filtro {label}'
    },
    catalog: {
      new_plant: 'Nueva planta',
      species_count: '{n} especies',
      summary_prefix: 'Filtrado activo'
    },
    card: {
      likes_count_single: '1 persona ha indicado que le gusta esta planta',
      likes_count_plural:
        '{count} personas han indicado que les gusta esta planta'
    },
    view: {
      label: 'Vista',
      grid: 'Cuadrícula',
      list: 'Lista'
    },
    orders: {
      sort_label: 'Ordenar',
      combined: {
        name_asc: 'Nombre común (A-Z)',
        name_desc: 'Nombre común (Z-A)',
        scientificName_asc: 'Nombre científico (A-Z)',
        scientificName_desc: 'Nombre científico (Z-A)'
      }
    },
    detail: {
      loading: 'Cargando planta...',
      edit_plant: 'Editar',
      delete_plant: 'Eliminar',
      delete_confirm:
        '¿Estás seguro de que deseas eliminar esta planta del catálogo?',
      delete_modal_title: 'Eliminar planta',
      delete_modal_subtitle: 'Catálogo botánico',
      delete_modal_prompt:
        '¿Estás seguro de que deseas eliminar «{name}» del catálogo?',
      delete_modal_warning:
        'La planta se marcará como borrada y dejará de estar visible en el catálogo público.'
    },
    hero: {
      scientific_name: 'Nombre científico',
      aliases: 'Alias',
      family_unavailable: 'Familia no disponible'
    },
    calendar: {
      title: 'Calendario',

      seeds_per_hole: 'Semillas por golpe',
      germination: 'Germinación',

      sowing: 'Siembra',
      flowering: 'Floración',
      harvest: 'Cosecha',

      days: 'días',
      season: 'Estación',
      seasonValues: {
        spring: 'Primavera',
        summer: 'Verano',
        autumn: 'Otoño',
        winter: 'Invierno'
      }
    },
    quick_facts: {
      title: 'Datos rápidos',

      lifecycle: 'Ciclo de vida',
      light: 'Luz',
      light_hours: 'Horas de luz',
      light_hours_value: '{hours} h o más al día',
      watering: 'Riego',
      watering_conditions: 'Condiciones de riego',
      height: 'Altura',
      spread: 'Ancho',
      spacing: 'Espaciado'
    },
    cultivation: {
      title: 'Cultivo',

      soil_ph: 'pH del suelo',
      soil_depth: 'Profundidad del suelo',
      root_system: 'Sistema radicular',
      root_depth: 'Profundidad de la raíz',

      propagation: {
        propagation: 'Propagación',
        method: 'Método',
        season: 'Estación',
        best_practices: 'Buenas prácticas',

        methodValues: {
          cutting: 'Esqueje',
          grafting: 'Injerto',
          layering: 'Acodo',
          division: 'División',
          seed: 'Semilla'
        }
      },
      pruning: {
        pruning: 'Poda',
        type: 'Tipo',
        pruningTypeValues: {
          maintenance: 'Mantenimiento',
          rejuvenation: 'Rejuvenecimiento',
          shaping: 'Formación'
        },
        intensity: 'Intensidad',
        pruningIntensityValues: {
          light: 'Ligera',
          moderate: 'Moderada',
          hard: 'Fuerte'
        },
        frequency: 'Frecuencia',
        times_per_year: 'veces/año',
        best_practices: 'Buenas prácticas'
      }
    },

    ecology: {
      title: 'Ecología'
    },
    notes: {
      title: 'Notas'
    },
    resources: {
      title: 'Recursos',
      video_title: 'Vídeo sobre la planta',
      videos: 'Vídeos',
      articles: 'Artículos'
    },
    hemisphere: {
      title: 'Hemisferio',
      north: 'Norte',
      south: 'Sur'
    }
  },
  favoriteButton: {
    add: 'Marcar como favorita',
    remove: 'Quitar de favoritas',
    error: 'No se pudo actualizar la favorita. Inténtalo de nuevo.'
  },
  plantLikeButton: {
    be_first_to_like: 'Sé el primero en darle a like',
    aria_label_zero_unpressed: 'Dar me gusta a esta planta',
    aria_label_zero_pressed: 'Quitar me gusta a esta planta',
    aria_label_count_unpressed:
      'Dar me gusta a esta planta. Actualmente tiene {count} me gusta',
    aria_label_count_pressed:
      'Quitar me gusta a esta planta. Actualmente tiene {count} me gusta',
    error: 'No se pudo actualizar el me gusta. Inténtalo de nuevo.'
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
