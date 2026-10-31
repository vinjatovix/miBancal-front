import { registerMessages } from '../core/registry';

export const plantRelationsMessages = {
  plantRelation: {
    mechanismValues: {
      pest_repellent: 'Repelente de plagas',
      pollinator_attractor: 'Atracción de polinizadores',
      nitrogen_fixer: 'Fijador de nitrógeno',
      nutrient_accumulator: 'Acumulador de nutrientes',
      growth_stimulator: 'Estimulador del crecimiento',
      trap_crop: 'Cultivo trampa',
      physical_support: 'Soporte físico',
      shade_provider: 'Provisión de sombra',
      allelopathy: 'Alelopatía',
      pest_host: 'Huésped de plagas',
      disease_vector: 'Vector de enfermedades',
      resource_competition: 'Competencia por recursos'
    },
    scopeValues: {
      plant: 'Planta',
      genus: 'Género',
      family: 'Familia',
      all: 'Todas las plantas'
    },
    appliesViaValues: {
      plant: 'Por la planta',
      genus: 'Por su género',
      family: 'Por su familia',
      all: 'Aplica a todas las plantas'
    },
    curator: {
      addRelation: 'Añadir relación',
      editRelation: 'Editar relación',
      deleteRelation: 'Eliminar relación',
      modalCreateTitle: 'Nueva asociación botánica',
      modalEditTitle: 'Editar asociación botánica',
      companionPlant: 'Planta compañera',
      companionScope: 'Ámbito de la compañera',
      companionGenus: 'Género botánico',
      companionGenusPlaceholder: 'Ej.: Solanum',
      companionGenusInvalid:
        'Escribe un género válido: empieza en mayúscula y solo lleva letras (2 a 50).',
      companionFamily: 'Familia botánica',
      companionFamilySelectPrompt: 'Selecciona una familia...',
      companionFamiliesError: 'No se pudieron cargar las familias.',
      companionAll: 'La relación afecta a todas las plantas del catálogo.',
      direction: 'Dirección del efecto',
      directionBenefitsGiven: 'Esta planta aporta el efecto a la compañera',
      directionBenefitsReceived: 'Esta planta recibe el efecto de la compañera',
      relationType: 'Tipo de asociación',
      typeBeneficial: 'Beneficiosa / Sinergia',
      typeDetrimental: 'Perjudicial / Incompatibilidad',
      mechanism: 'Mecanismo botánico',
      mechanismSelectPrompt: 'Selecciona un mecanismo...',
      strength: 'Fuerza de la interacción (1 a 5)',
      proximityMin: 'Distancia mínima (cm)',
      proximityMax: 'Distancia máxima (cm)',
      proximityBedWide: 'Efectiva en todo el bancal (sin límite de distancia)',
      reason: 'Explicación agronómica / justificación',
      reasonPlaceholder:
        'Describe la interacción botánica, alelopatía, repelencia o soporte...',
      save: 'Guardar relación',
      saving: 'Guardando...',
      cancel: 'Cancelar',
      deleteConfirmTitle: '¿Eliminar relación botánica?',
      deleteConfirmText:
        'Esta acción eliminará de forma permanente esta asociación del catálogo.',
      deleteConfirmButton: 'Eliminar',
      deleting: 'Eliminando...',
      errorSave:
        'No se pudo guardar la relación. Revisa los datos e inténtalo de nuevo.',
      errorDuplicate:
        'Ya existe una relación con el mismo origen, destino y mecanismo. Cambia el mecanismo o edita la existente.',
      errorSameParticipant: 'El origen y el destino no pueden ser el mismo.',
      errorDelete: 'No se pudo eliminar la relación. Inténtalo de nuevo.'
    }
  },
  plantRelations: {
    title: 'Explorador de relaciones entre plantas',
    subtitle:
      'Descubre qué plantas se benefician mutuamente y cuáles conviene separar en el bancal',
    searchPlaceholder: 'Buscar planta por nombre común o científico...',
    searchAriaLabel: 'Buscar planta en el catálogo',
    clearSelection: 'Limpiar selección',
    noSearchResults: 'No se encontraron plantas que coincidan con la búsqueda',
    loadingRelations: 'Cargando relaciones...',
    loadingSearch: 'Buscando plantas...',
    focalPlantLabel: 'Planta de origen',
    viewPlantDetail: 'Ver ficha de {name}',
    tabs: {
      ariaLabel: 'Filtrar relaciones por tipo',
      all: 'Todas ({count})',
      beneficial: 'Beneficiosas ({count})',
      detrimental: 'Perjudiciales ({count})'
    },
    explorer: {
      emptyTitle: 'Explora asociaciones en el huerto',
      initialPrompt:
        'Selecciona o busca una planta para explorar sus relaciones y asociaciones ecológicas',
      emptyFilter: 'No hay relaciones que coincidan con el filtro seleccionado'
    }
  }
} as const;

registerMessages(plantRelationsMessages);
