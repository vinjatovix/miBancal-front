import { registerMessages } from '../core/registry';

export const locationsMessages = {
  location: {
    title: 'Mis ubicaciones',
    subtitle: 'Guarda los lugares de tu huerto y sus coordenadas.',
    loading: 'Cargando ubicaciones...',
    list_error: 'No se han podido cargar tus ubicaciones.',
    empty: 'Todavía no tienes ninguna ubicación.',
    empty_action: 'Crear la primera ubicación',
    create_action: 'Nueva ubicación',
    page_size: 'Mostrar',
    open_edit: 'Editar {name}',
    open_delete: 'Eliminar {name}',
    unnamed: 'Ubicación sin nombre',
    sort: {
      label: 'Ordenar por',
      name_asc: 'Nombre (A-Z)',
      name_desc: 'Nombre (Z-A)',
      createdAt_asc: 'Más antiguas primero',
      createdAt_desc: 'Más recientes primero'
    },
    card: {
      coordinates: 'Coordenadas',
      latitude: 'Latitud',
      longitude: 'Longitud',
      edit: 'Editar',
      delete: 'Eliminar'
    },
    form: {
      title_create: 'Nueva ubicación',
      title_edit: 'Editar ubicación',
      subtitle_create: 'Añade un lugar y fija sus coordenadas en el mapa.',
      subtitle_edit: 'Modifica los datos y coordenadas de esta ubicación.',
      name: 'Nombre',
      name_placeholder: 'Ej. Huerto de casa',
      search_place: 'Buscar municipio o lugar',
      search_placeholder: 'Ej. Carmona, Sevilla',
      search_button: 'Buscar',
      search_loading: 'Buscando lugares...',
      search_no_results: 'No se han encontrado lugares para esta búsqueda.',
      search_select_place: 'Seleccionar {place}',
      use_current_location: 'Usar mi ubicación actual',
      geolocation_error: 'No se ha podido obtener tu ubicación actual.',
      geolocation_not_supported: 'Tu navegador no admite geolocalización.',
      map_instructions:
        'Haz clic en el mapa o arrastra el marcador para fijar las coordenadas exactas.',
      map_label: 'Mapa interactivo de selección de coordenadas',
      latitude: 'Latitud',
      latitude_placeholder: 'Ej. 40.4168',
      longitude: 'Longitud',
      longitude_placeholder: 'Ej. -3.7038',
      submit_create: 'Crear ubicación',
      submit_edit: 'Guardar cambios',
      cancel: 'Cancelar',
      submitting: 'Guardando...',
      success_create: 'Ubicación creada correctamente.',
      success_edit: 'Ubicación actualizada correctamente.',
      conflict_title: 'Conflicto de edición',
      conflict_message:
        'Esta ubicación se ha modificado en otro sitio. Hemos recargado los datos; revísalos y vuelve a guardar.',
      duplicate_error: 'Ya tienes una ubicación con este nombre.',
      errors: {
        name_required: 'El nombre es obligatorio.',
        name_too_long: 'El nombre no puede superar los 200 caracteres.',
        latitude_required: 'La latitud es obligatoria.',
        latitude_invalid: 'La latitud debe ser un número entre -90 y 90.',
        longitude_required: 'La longitud es obligatoria.',
        longitude_invalid: 'La longitud debe ser un número entre -180 y 180.',
        save_error: 'Ha ocurrido un error al crear la ubicación.',
        update_error: 'Ha ocurrido un error al guardar la ubicación.'
      }
    },
    delete: {
      title: '¿Eliminar ubicación?',
      message:
        'La ubicación «{name}» se eliminará de tu lista. Podrás volver a crear una con el mismo nombre.',
      confirm: 'Eliminar',
      cancel: 'Cancelar',
      deleting: 'Eliminando...',
      success: 'Ubicación eliminada correctamente.',
      error: 'No se ha podido eliminar la ubicación.',
      conflict_title: 'Conflicto al eliminar',
      conflict_message:
        'Esta ubicación se ha modificado en otro sitio. Hemos recargado los datos; vuelve a intentarlo.'
    }
  }
} as const;

registerMessages(locationsMessages);
