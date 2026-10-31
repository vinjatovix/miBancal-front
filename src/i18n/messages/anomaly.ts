import { registerMessages } from '../core/registry';

export const anomalyMessages = {
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
  }
} as const;

registerMessages(anomalyMessages);
