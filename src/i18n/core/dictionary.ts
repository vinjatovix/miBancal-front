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
      menu: 'Menú de navegación',
      menu_title: 'Menú',
      close: 'Cerrar'
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
    reset_request_again: 'Solicitar un enlace nuevo'
  },
  admin: {
    heading: 'Administración'
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
    backToFamilies: 'Volver al listado de familias'
  },

  family: {
    families: 'Familias',
    empty: 'No hay familias registradas.',
    select_error: 'No se han podido cargar las familias.',
    detail: {
      loading: 'Cargando familia...'
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
  plant: {
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
      goToFirstPage: 'Ir a la primera página'
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
      species_count: '{n} especies',
      summary_prefix: 'Filtrado activo'
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
      loading: 'Cargando planta...'
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
  }
} as const;
