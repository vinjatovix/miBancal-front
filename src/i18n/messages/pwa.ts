import { registerMessages } from '../core/registry';

export const pwaMessages = {
  offline: {
    title: 'Sin conexión',
    message: 'Esta página no está disponible sin conexión a internet.',
    link: 'Volver al catálogo'
  },
  sw: {
    update: {
      title: 'Nueva versión disponible',
      action: 'Actualizar ahora'
    }
  }
} as const;

registerMessages(pwaMessages);
