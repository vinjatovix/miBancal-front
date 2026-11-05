import { registerMessages } from '../core/registry';

export const designSystemMessages = {
  dev: {
    designSystem: {
      title: 'Catálogo del sistema de diseño',
      sections: {
        contrast: 'Contraste y pares de color',
        typography: 'Tipografía y lectura',
        buttons: 'Botones y enlaces de acción',
        forms: 'Controles de formulario y validación',
        feedback: 'Avisos, toasts y estados de respuesta',
        navigation: 'Navegación, pestañas y paginación',
        overlays: 'Modales, cajones y capas flotantes'
      },
      demos: {
        primaryRest: 'Acción reposo',
        primaryHover: 'Acción hover',
        primaryActive: 'Acción activa',
        successToast: 'Aviso de éxito',
        warningToast: 'Aviso de advertencia',
        errorToast: 'Aviso de error',
        infoToast: 'Aviso informativo',
        toastSampleMessage: 'Mensaje descriptivo del aviso accesible.',
        fieldLabel: 'Nombre del recurso',
        fieldInvalidLabel: 'Nombre obligatorio no completado',
        fieldError: 'Este campo es obligatorio'
      }
    }
  }
} as const;

registerMessages(designSystemMessages);
