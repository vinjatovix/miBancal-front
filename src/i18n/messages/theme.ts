import { registerMessages } from '../core/registry';

export const themeMessages = {
  theme: {
    aria: {
      light: 'Tema claro activo. Pulsar para cambiar a tema oscuro.',
      dark: 'Tema oscuro activo. Pulsar para cambiar a tema claro.'
    }
  }
} as const;

registerMessages(themeMessages);
