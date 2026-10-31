import { registerMessages } from '../core/registry';

export const gardenInputMessages = {
  gardenInput: {
    title: 'Insumos del huerto',
    subtitle:
      'Remedios, fertilizantes, bioestimulantes y enmiendas ecológicas.',
    empty: 'No hay insumos que coincidan con los filtros.',
    empty_catalog: 'Aún no hay insumos registrados.',
    list_error: 'No se han podido cargar los insumos.',
    open_detail: 'Ver ficha de {name}',
    go_to_first_page: 'Ir a la primera página',
    page_size: 'Mostrar',
    catalog: {
      new_garden_input: 'Nuevo insumo'
    },
    categoryValues: {
      defense: 'Defensa',
      fertilizer: 'Fertilizante',
      biostimulant: 'Bioestimulante',
      soil_amendment: 'Enmienda de suelo'
    },
    actionValues: {
      fungicide: 'Fungicida',
      insecticide: 'Insecticida',
      repellent: 'Repelente',
      nematicide: 'Nematicida',
      fertilizer: 'Fertilizante',
      biostimulant: 'Bioestimulante',
      rooting: 'Enraizante',
      compost_activator: 'Activador de compost'
    },
    dosageMethodValues: {
      foliar: 'Foliar',
      irrigation: 'Riego',
      soil: 'Suelo',
      soaking: 'Remojo',
      dusting: 'Espolvoreo',
      other: 'Otro'
    },
    statusValues: {
      active: 'Activo',
      deleted: 'Eliminado'
    },
    filters: {
      category: 'Categoría',
      action: 'Acción agronómica',
      status: 'Estado',
      all_categories: 'Todas las categorías',
      all_actions: 'Todas las acciones',
      all_statuses: 'Todos los estados',
      clear: 'Limpiar filtros',
      multi_hint: 'Toca para filtrar · puedes elegir varias'
    },
    sort: {
      label: 'Ordenar por',
      name_asc: 'Nombre (A-Z)',
      name_desc: 'Nombre (Z-A)',
      category_asc: 'Categoría (A-Z)',
      category_desc: 'Categoría (Z-A)',
      slug_asc: 'Identificador (A-Z)',
      slug_desc: 'Identificador (Z-A)'
    },
    detail: {
      loading: 'Cargando insumo...',
      edit: 'Editar',
      delete: 'Eliminar',
      deleting: 'Eliminando...',
      delete_confirm_title: '¿Eliminar insumo?',
      delete_confirm_message:
        'El insumo pasará al estado eliminado y solo será visible para editores. ¿Deseas continuar?',
      delete_confirm_action: 'Eliminar insumo',
      delete_cancel_action: 'Cancelar',
      active_ingredients: 'Principios activos',
      nutrients: 'Nutrientes aportados',
      targets: 'Indicado para',
      recipes_title: 'Recetas de elaboración',
      recipes_empty: 'Este insumo no tiene recetas registradas todavía.',
      deleted_badge: 'Eliminado',
      delete_error: 'Error al eliminar el insumo.',
      delete_etag_error: 'No se ha podido obtener la versión actual del insumo.'
    },
    resources: {
      title: 'Recursos y referencias',
      video_title: 'Vídeo del insumo',
      videos: 'Vídeos',
      articles: 'Artículos'
    },
    meta: {
      category: 'Categoría',
      action: 'Acción'
    },
    recipe: {
      ingredients: 'Ingredientes',
      instructions: 'Elaboración',
      brew_time: 'Tiempo de reposo/fermentación',
      dosage: 'Dosificación y aplicación',
      dosage_method: 'Vía',
      dosage_dilution: 'Dilución',
      dosage_frequency: 'Frecuencia',
      storage: 'Conservación',
      storage_duration: 'Duración',
      storage_conditions: 'Condiciones',
      storage_spoilage: 'Signos de mal estado',
      safety_notes: 'Precauciones de seguridad'
    },
    form: {
      title_create: 'Nuevo insumo',
      title_edit: 'Editar insumo',
      subtitle_create:
        'Registra un preparado, fertilizante, bioestimulante o enmienda.',
      subtitle_edit: 'Modifica los datos y recetas del insumo.',
      name: 'Nombre',
      name_placeholder: 'Ej. Purín de ortiga',
      slug: 'Identificador (slug)',
      slug_placeholder: 'ej-purin-ortiga',
      slug_hint:
        'Identificador en minúsculas y separado por guiones (kebab-case). Inmutable tras la creación.',
      slug_locked_hint: 'El identificador no se puede modificar.',
      category: 'Categoría',
      category_placeholder: 'Selecciona una categoría',
      description: 'Descripción agronómica',
      description_placeholder: 'Descripción general del insumo y sus usos...',
      actions: 'Acciones agronómicas',
      active_ingredients: 'Principios activos',
      active_ingredients_placeholder: 'Separados por comas o uno por línea',
      nutrients: 'Nutrientes aportados',
      nutrients_placeholder: 'Separados por comas o uno por línea',
      targets: 'Indicado para',
      targets_placeholder: 'Separados por comas o uno por línea',
      recipes_section: 'Recetas de elaboración',
      add_recipe: 'Añadir receta',
      remove_recipe: 'Eliminar receta',
      recipe_name: 'Nombre de la receta',
      recipe_name_placeholder: 'Ej. Purín clásico de 10 días',
      recipe_description: 'Descripción de la receta',
      recipe_description_placeholder: 'Breve explicación de la preparación...',
      recipe_brew_time: 'Tiempo de reposo/fermentación',
      recipe_brew_time_placeholder: 'Ej. 10 a 14 días',
      recipe_ingredients: 'Ingredientes',
      add_ingredient: 'Añadir ingrediente',
      remove_ingredient: 'Eliminar ingrediente',
      ingredient_item: 'Ingrediente',
      ingredient_item_placeholder: 'Ej. Ortiga fresca picada',
      ingredient_quantity: 'Cantidad',
      ingredient_quantity_placeholder: 'Ej. 1 kg por 10 L de agua',
      recipe_instructions: 'Instrucciones',
      add_instruction: 'Añadir paso',
      remove_instruction: 'Eliminar paso',
      instruction_step: 'Paso {step}',
      instruction_placeholder: 'Paso de elaboración...',
      recipe_dosage_method: 'Vía de suministro',
      recipe_dosage_dilution: 'Dilución',
      recipe_dosage_dilution_placeholder: 'Ej. 1:10 en agua de lluvia',
      recipe_dosage_frequency: 'Frecuencia de aplicación',
      recipe_dosage_frequency_placeholder: 'Ej. Cada 15 días al atardecer',
      recipe_storage_duration: 'Duración de conservación',
      recipe_storage_duration_placeholder: 'Ej. 6 meses',
      recipe_storage_conditions: 'Condiciones de almacenamiento',
      recipe_storage_conditions_placeholder: 'Ej. Lugar fresco y oscuro',
      recipe_storage_spoilage: 'Signos de mal estado',
      recipe_storage_spoilage_placeholder: 'Ej. Olor pútrido',
      recipe_safety_notes: 'Notas de seguridad',
      recipe_safety_notes_placeholder: 'Una precaución por línea...',
      resources_section: 'Recursos y referencias',
      resources_images: 'Imágenes',
      resources_videos: 'Vídeos',
      resources_articles: 'Artículos',
      resource_image_url: 'URL de la imagen',
      resource_image_url_placeholder: 'https://ejemplo.com/imagen.jpg',
      resource_title: 'Título',
      resource_title_placeholder: 'Título descriptivo del recurso',
      resource_image_source: 'Fuente',
      resource_image_source_placeholder: 'Ej. Wikipedia, INIA...',
      resource_video_url: 'URL del vídeo',
      resource_video_url_placeholder: 'https://www.youtube.com/watch?v=...',
      resource_article_url: 'URL del artículo',
      resource_article_url_placeholder: 'https://ejemplo.com/articulo',
      resource_add_image: 'Añadir imagen',
      resource_remove_image: 'Eliminar imagen',
      resource_add_video: 'Añadir vídeo',
      resource_remove_video: 'Eliminar vídeo',
      resource_add_article: 'Añadir artículo',
      resource_remove_article: 'Eliminar artículo',
      submit_create: 'Crear insumo',
      submit_edit: 'Guardar cambios',
      cancel: 'Cancelar',
      submitting: 'Guardando...',
      success_create: 'Insumo creado correctamente.',
      success_edit: 'Insumo actualizado correctamente.',
      success_delete: 'Insumo eliminado correctamente.',
      conflict_title: 'Conflicto de edición',
      conflict_message:
        'Este insumo ha sido modificado por otra persona. Recarga la página para ver los cambios más recientes.',
      conflict_reload: 'Recargar',
      cancel_confirm: 'Hay cambios sin guardar. ¿Deseas descartarlos y salir?',
      duplicate_error: 'Ya existe un insumo con este identificador (slug).',
      errors: {
        slug_required: 'El identificador es obligatorio.',
        slug_invalid:
          'El slug solo admite letras minúsculas, números y guiones sencillos (1-200 caracteres).',
        name_required: 'El nombre es obligatorio.',
        name_too_long: 'El nombre no puede superar los 200 caracteres.',
        category_required: 'Debes seleccionar una categoría.',
        description_too_long:
          'La descripción no puede superar los 2000 caracteres.',
        recipe_name_required: 'El nombre de la receta es obligatorio.',
        recipe_name_too_long:
          'El nombre de la receta no puede superar los 200 caracteres.',
        recipe_ingredients_min:
          'La receta debe incluir al menos un ingrediente.',
        ingredient_item_required: 'El ingrediente es obligatorio.',
        ingredient_quantity_required: 'La cantidad es obligatoria.',
        recipe_instructions_min:
          'La receta debe incluir al menos una instrucción.',
        instruction_required: 'La instrucción no puede estar vacía.',
        dosage_method_required: 'La vía de suministro es obligatoria.',
        dosage_dilution_required: 'La dilución es obligatoria.',
        dosage_frequency_required: 'La frecuencia es obligatoria.',
        storage_duration_required:
          'La duración de conservación es obligatoria.',
        storage_conditions_required:
          'Las condiciones de conservación son obligatorias.',
        save_error: 'Ha ocurrido un error inesperado al guardar el insumo.',
        update_error: 'Ha ocurrido un error al actualizar el insumo.',
        resources_max: 'Se ha superado el número máximo de recursos (200).',
        invalid_resource_url:
          'Las URL de los recursos deben empezar por http:// o https:// y no superar los 2048 caracteres.'
      }
    }
  }
} as const;

registerMessages(gardenInputMessages);
