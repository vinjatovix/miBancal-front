import { registerMessages } from '../core/registry';

export const plantMessages = {
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
      genus: 'Género',
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
      family_unavailable: 'Familia no disponible',
      source: 'Fuente: {source}'
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
    relations: {
      title: 'Relaciones ecológicas',
      viewInExplorer: 'Explorar en el visor',
      loading: 'Cargando relaciones...',
      empty: 'No se han registrado asociaciones para esta planta',
      companionUnavailable: 'Planta no disponible',
      benefitsReceivedTitle: 'Plantas que la benefician',
      benefitsGivenTitle: 'Plantas a las que beneficia',
      incompatibilitiesTitle: 'Incompatibilidades (evitar cerca)',
      direction: {
        benefitsTo: 'Aporta a {name}',
        harmsTo: 'Perjudica a {name}',
        benefitsToGenus: 'Aporta al género {name}',
        benefitsToFamily: 'Aporta a la familia {name}',
        benefitsToAll: 'Aporta a todas las plantas',
        harmsToGenus: 'Perjudica al género {name}',
        harmsToFamily: 'Perjudica a la familia {name}',
        harmsToAll: 'Perjudica a todas las plantas',
        benefitsGeneral: 'Aporta',
        harmsGeneral: 'Perjudica',
        benefitsReceived: 'Recibe beneficio de',
        benefitsGiven: 'Beneficia a',
        harmfulTo: 'Perjudicial para',
        affectedBy: 'Afectada por'
      },
      proximity: {
        bedWide: 'Efectiva en todo el bancal (sin límite de distancia)',
        range: '{min} cm - {max} cm',
        upTo: 'Hasta {max} cm'
      },
      strength: {
        ariaLabel: 'Fuerza de la relación: {strength} de 5'
      }
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
  plantLikeButton: {
    be_first_to_like: 'Sé el primero en darle a like',
    aria_label_zero_unpressed: 'Dar me gusta a esta planta',
    aria_label_zero_pressed: 'Quitar me gusta a esta planta',
    aria_label_count_unpressed:
      'Dar me gusta a esta planta. Actualmente tiene {count} me gusta',
    aria_label_count_pressed:
      'Quitar me gusta a esta planta. Actualmente tiene {count} me gusta',
    error: 'No se pudo actualizar el me gusta. Inténtalo de nuevo.'
  }
} as const;

registerMessages(plantMessages);
