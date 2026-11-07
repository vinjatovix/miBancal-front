import { registerMessages } from '../core/registry';

export const bedsMessages = {
  bed: {
    list: {
      title: 'Mis bancales',
      subtitle: 'Organiza y revisa el espacio de tus bancales.',
      loading: 'Cargando bancales...',
      error: 'No se han podido cargar tus bancales.',
      empty_title: 'Todavía no tienes ningún bancal',
      empty_description:
        'Crea tu primer bancal para planificar la siembra a escala métrica.',
      empty_action: 'Crear mi primer bancal',
      create_action: 'Nuevo bancal',
      filter_location: 'Filtrar por ubicación',
      all_locations: 'Todas las ubicaciones'
    },
    card: {
      dimensions: '{width} × {height} × {depth} cm',
      depth_label: 'Profundidad: {depth} cm',
      no_location: 'Sin ubicación asignada',
      view_detail: 'Ver bancal {name}'
    },
    drawer: {
      title: 'Nuevo bancal',
      subtitle:
        'Introduce las dimensiones reales y asocia el bancal a tu huerto.',
      close: 'Cerrar panel de creación'
    },
    form: {
      name_label: 'Nombre del bancal',
      name_placeholder: 'Ej. Bancal Aromáticas',
      width_label: 'Ancho (cm)',
      width_placeholder: 'Ej. 120',
      height_label: 'Largo (cm)',
      height_placeholder: 'Ej. 240',
      depth_label: 'Profundidad de sustrato (cm)',
      depth_placeholder: 'Ej. 30',
      location_label: 'Ubicación',
      location_select_placeholder: 'Selecciona una ubicación',
      location_create_action: 'Crear nueva ubicación',
      submit: 'Crear bancal',
      submitting: 'Creando bancal...',
      cancel: 'Cancelar',
      errors: {
        name_required: 'El nombre del bancal es obligatorio.',
        name_too_long: 'El nombre no puede superar los 200 caracteres.',
        name_duplicate: 'Ya tienes un bancal con ese nombre.',
        dimension_required: 'Las medidas son obligatorias.',
        dimension_invalid: 'La medida debe ser un número válido.',
        dimension_min: 'La medida debe ser mayor que 0 cm.',
        location_required: 'Debes seleccionar una ubicación para el bancal.'
      }
    },
    edit: {
      title: 'Editar bancal',
      subtitle: 'Corrige las dimensiones o el nombre de {name}.',
      close: 'Cerrar panel de edición',
      loading: 'Cargando bancal...',
      submit: 'Guardar cambios',
      submitting: 'Guardando...',
      success: 'Bancal actualizado.',
      error: 'No se ha podido actualizar el bancal.',
      conflict:
        'El bancal cambió en otro sitio. Hemos recargado los datos; revísalos antes de guardar.'
    },
    delete: {
      title: '¿Eliminar el bancal?',
      message:
        'Vas a eliminar el bancal {name}. Esta acción no se puede deshacer.',
      confirm: 'Eliminar',
      cancel: 'Cancelar',
      deleting: 'Eliminando...',
      success: 'Se ha eliminado el bancal {name}.',
      error: 'No se ha podido eliminar el bancal.'
    },
    quick_location: {
      title: 'Nueva ubicación',
      subtitle: 'Crea una zona para asociar a tu bancal.',
      name_label: 'Nombre de la ubicación',
      name_placeholder: 'Ej. Huerto Norte',
      latitude_label: 'Latitud (opcional)',
      latitude_placeholder: 'Ej. 40.4168',
      longitude_label: 'Longitud (opcional)',
      longitude_placeholder: 'Ej. -3.7038',
      submit: 'Guardar ubicación',
      submitting: 'Guardando...',
      cancel: 'Cancelar',
      close: 'Cerrar ventana de ubicación',
      error_name_required: 'El nombre de la ubicación es obligatorio.',
      error_name_too_long: 'El nombre no puede superar los 200 caracteres.',
      error_latitude_invalid: 'La latitud debe ser un número entre -90 y 90.',
      error_longitude_invalid:
        'La longitud debe ser un número entre -180 y 180.'
    },
    detail: {
      loading: 'Cargando bancal...',
      error: 'No se ha podido cargar el bancal.',
      not_found_title: 'Bancal no encontrado',
      not_found_description:
        'El bancal que buscas no existe o ha sido eliminado.',
      back_to_list: 'Volver a bancales'
    },
    technical_header: {
      dimensions_label: 'Medidas',
      dimensions_value: '{width} cm × {height} cm',
      depth_label: 'Profundidad',
      depth_value: '{depth} cm de sustrato',
      location_label: 'Ubicación',
      no_location: 'Sin ubicación asignada',
      back_link: 'Volver a mis bancales',
      view_layout: 'Ver la disposición de la localización'
    },
    visualizer: {
      canvas_label:
        'Plano cenital a escala del bancal {name}, de {width} por {height} centímetros',
      controls_label: 'Controles del visor',
      zoom_in: 'Acercar',
      zoom_out: 'Alejar',
      fit_screen: 'Ajustar al centro',
      fullscreen_enter: 'Pantalla completa',
      fullscreen_exit: 'Salir de pantalla completa',
      dimension_width: '{width} cm',
      dimension_height: '{height} cm',
      dimension_lines_label: 'Líneas de cota'
    },
    grids: {
      group_label: 'Capas de cuadrícula agronómica',
      sfg: 'Malla SFG (30 × 30 cm)',
      intermediate: 'Submódulo (15 × 15 cm)',
      decimeters: 'Decímetros (10 × 10 cm)',
      fine: 'Malla fina (5 × 5 cm)',
      sfg_hint: 'Square Foot Gardening',
      intermediate_hint: '15 cm',
      decimeters_hint: '10 cm',
      fine_hint: '5 cm'
    },
    layout: {
      title: 'Disposición de {name}',
      subtitle: 'Coloca y mueve los bancales en el plano de este lugar.',
      loading: 'Cargando la disposición...',
      error: 'No se ha podido cargar la disposición de la localización.',
      empty_title: 'Esta localización todavía no tiene bancales',
      empty_description:
        'Crea bancales en este lugar. Luego podrás colocarlos en el plano.',
      empty_action: 'Ir a mis bancales',
      empty_hint:
        'Crea el primer bancal de esta localización para empezar a disponerlo en el plano.',
      new_bed: 'Nuevo bancal',
      not_found_title: 'Localización no encontrada',
      not_found_description:
        'La localización que buscas no existe o ha sido eliminada.',
      back_to_beds: 'Volver a mis bancales',
      canvas_label: 'Plano a escala de la disposición de bancales de {name}',
      canvas_hint:
        'Usa los controles para acercar, alejar y desplazar el plano.',
      bed_label: 'Bancal {name}, {width} por {height} centímetros',
      bed_selected_label: 'Bancal {name} seleccionado',
      mode_group_label: 'Modo de la vista',
      mode_read: 'Modo lectura',
      mode_position: 'Modo posición',
      mode_view: 'Vista',
      mode_position_short: 'Posición',
      tray_title: 'Bancales sin colocar',
      tray_empty: 'No hay bancales sin colocar.',
      tray_place_action: 'Colocar el bancal {name} en el plano',
      unplace_action: 'Devolver {name} a sin colocar',
      manage_plants: 'Gestionar plantas de {name}',
      edit_bed: 'Editar el bancal {name}',
      delete_bed: 'Eliminar el bancal {name}',
      snap_label: 'Ajuste magnético a bancales vecinos',
      grid_snap_label: 'Ajustar a la rejilla',
      neighbor_snap_label: 'Ajustar a bancales vecinos',
      show_names_label: 'Mostrar nombres de bancales',
      show_dimensions_label: 'Mostrar líneas de cota',
      show_cardinal_label: 'Mostrar orientación cardinal',
      rotation_label: 'Rotación en grados',
      rotation_hint: 'Entero entre 0 y 359 grados.',
      save: 'Guardar disposición',
      saving: 'Guardando...',
      discard: 'Descartar cambios',
      viewport_group_label: 'Controles del plano',
      zoom_in: 'Acercar',
      zoom_out: 'Alejar',
      reset_view: 'Centrar y restablecer el zoom',
      adjusted_notice:
        'Se ajustaron las posiciones de estos bancales al guardar: {names}.',
      overlap_error:
        'Algunos bancales se solapan. Revisa su posición; los cambios siguen pendientes.',
      overlap_error_named:
        'Los bancales {names} se solapan. Revisa su posición; los cambios siguen pendientes.',
      concurrency_warning:
        'La disposición cambió en otro sitio. Hemos recargado los datos; revísalos antes de guardar.',
      discard_title: '¿Descartar los cambios?',
      discard_message:
        'Tienes cambios de disposición sin guardar. Si continúas, se perderán.',
      discard_confirm: 'Descartar',
      discard_cancel: 'Seguir editando'
    },
    cardinal: {
      compass_hud_label: 'Brújula y orientación cardinal',
      compass_drag_hint: 'Arrastra para girar',
      terrain_north_title: 'Norte del terreno: {angle}°',
      terrain_north_default: 'Norte estándar del plano (0°)',
      bed_heading_title: 'Rumbo del bancal: {angle}° {wind}',
      calibrate_north_action: 'Guardar',
      calibrating_north: 'Guardando...',
      point_north: 'N',
      point_east: 'E',
      point_south: 'S',
      point_west: 'O',
      wind_north: 'Norte',
      wind_northeast: 'Noreste',
      wind_east: 'Este',
      wind_southeast: 'Sureste',
      wind_south: 'Sur',
      wind_southwest: 'Suroeste',
      wind_west: 'Oeste',
      wind_northwest: 'Noroeste',
      edge_north_label: 'Lado orientado al Norte',
      edge_east_label: 'Lado orientado al Este',
      edge_south_label: 'Lado orientado al Sur',
      edge_west_label: 'Lado orientado al Oeste'
    }
  }
};

registerMessages(bedsMessages);
