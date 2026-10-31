import { registerMessages } from '../core/registry';

export const familyMessages = {
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
  }
} as const;

registerMessages(familyMessages);
