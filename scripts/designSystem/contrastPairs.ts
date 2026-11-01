export type ContrastThreshold =
  | 'text'
  | 'large-text'
  | 'disabled-text'
  | 'placeholder'
  | 'non-text'
  | 'decor'
  | 'distinct'
  | 'small-text';

export interface ContrastPair {
  fg: string;
  bg: string;
  threshold: ContrastThreshold;
  over?: string;
  usage?: string;
}

export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  {
    fg: 'fg',
    bg: 'bg-page',
    threshold: 'text',
    usage: 'Texto principal en fondo de página'
  },
  {
    fg: 'fg',
    bg: 'bg-surface',
    threshold: 'text',
    usage: 'Texto principal en superficies'
  },
  {
    fg: 'fg',
    bg: 'bg-sunken',
    threshold: 'text',
    usage: 'Texto principal en fondos agrupados'
  },
  {
    fg: 'fg',
    bg: 'bg-hover',
    threshold: 'text',
    usage: 'Texto principal en filas hover'
  },
  {
    fg: 'fg-muted',
    bg: 'bg-page',
    threshold: 'text',
    usage: 'Texto secundario en página'
  },
  {
    fg: 'fg-muted',
    bg: 'bg-surface',
    threshold: 'text',
    usage: 'Texto secundario en superficies'
  },
  {
    fg: 'fg-muted',
    bg: 'bg-sunken',
    threshold: 'text',
    usage: 'Texto secundario en zonas agrupadas'
  },
  {
    fg: 'fg-muted',
    bg: 'bg-hover',
    threshold: 'text',
    usage: 'Texto secundario en hover'
  },
  {
    fg: 'fg-placeholder',
    bg: 'bg-page',
    threshold: 'placeholder',
    usage: 'Placeholder en campos sobre página'
  },
  {
    fg: 'fg-placeholder',
    bg: 'bg-surface',
    threshold: 'placeholder',
    usage: 'Placeholder en campos sobre superficies'
  },
  {
    fg: 'fg-placeholder',
    bg: 'bg-sunken',
    threshold: 'placeholder',
    usage: 'Placeholder en campos sobre fondos agrupados'
  },
  {
    fg: 'fg-link',
    bg: 'bg-page',
    threshold: 'text',
    usage: 'Enlaces en página'
  },
  {
    fg: 'fg-link',
    bg: 'bg-surface',
    threshold: 'text',
    usage: 'Enlaces en superficies'
  },
  {
    fg: 'fg-link',
    bg: 'bg-sunken',
    threshold: 'text',
    usage: 'Enlaces en zonas agrupadas'
  },
  {
    fg: 'fg-link',
    bg: 'bg-hover',
    threshold: 'text',
    usage: 'Enlaces en hover'
  },
  {
    fg: 'fg-on-inverse',
    bg: 'bg-inverse',
    threshold: 'text',
    usage: 'Texto en tooltip'
  },
  {
    fg: 'on-action',
    bg: 'action-bg',
    threshold: 'text',
    usage: 'Botón principal'
  },
  {
    fg: 'on-action',
    bg: 'action-bg-hover',
    threshold: 'text',
    usage: 'Botón principal en hover'
  },
  {
    fg: 'on-action',
    bg: 'action-bg-active',
    threshold: 'text',
    usage: 'Botón principal en active'
  },
  {
    fg: 'secondary-fg',
    bg: 'bg-surface',
    threshold: 'text',
    usage: 'Botón secundario en superficie'
  },
  {
    fg: 'secondary-fg',
    bg: 'bg-page',
    threshold: 'text',
    usage: 'Botón secundario en página'
  },
  {
    fg: 'secondary-border',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Borde botón secundario en superficie'
  },
  {
    fg: 'secondary-border',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Borde botón secundario en página'
  },
  {
    fg: 'on-selected',
    bg: 'selected-bg',
    threshold: 'text',
    usage: 'Texto de chip o pestaña seleccionada'
  },
  {
    fg: 'selected-indicator',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Indicador de selección en página'
  },
  {
    fg: 'selected-indicator',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Indicador de selección en superficies'
  },
  {
    fg: 'selected-indicator',
    bg: 'selected-bg',
    threshold: 'non-text',
    usage: 'Indicador de selección en selected-bg'
  },
  {
    fg: 'border-decor',
    bg: 'bg-page',
    threshold: 'decor',
    usage: 'Separadores en página'
  },
  {
    fg: 'border-decor',
    bg: 'bg-surface',
    threshold: 'decor',
    usage: 'Separadores en superficie'
  },
  {
    fg: 'border-control',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Bordes de campos en superficies'
  },
  {
    fg: 'border-control',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Bordes de controles en página'
  },
  {
    fg: 'border-control',
    bg: 'bg-sunken',
    threshold: 'non-text',
    usage: 'Bordes de controles en fondos agrupados'
  },
  {
    fg: 'border-strong',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Bordes activos de campos en superficies'
  },
  {
    fg: 'border-strong',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Bordes activos de controles en página'
  },
  {
    fg: 'focus',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Anillo de foco en superficies'
  },
  {
    fg: 'focus',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Anillo de foco en página'
  },
  {
    fg: 'focus',
    bg: 'bg-sunken',
    threshold: 'non-text',
    usage: 'Anillo de foco en fondos agrupados'
  },
  {
    fg: 'on-earth',
    bg: 'earth-bg',
    threshold: 'text',
    usage: 'Insignias y acentos cálidos'
  },
  {
    fg: 'earth-accent',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Detalles de tierra en superficie'
  },
  {
    fg: 'earth-accent',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Detalles de tierra en página'
  },
  {
    fg: 'on-success',
    bg: 'success-bg',
    threshold: 'text',
    usage: 'Avisos y toasts de éxito'
  },
  {
    fg: 'success-icon',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Icono de éxito en superficie'
  },
  {
    fg: 'success-icon',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Icono de éxito en página'
  },
  {
    fg: 'success-icon',
    bg: 'success-bg',
    threshold: 'non-text',
    usage: 'Icono de éxito en fondo de éxito'
  },
  {
    fg: 'success-border',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Borde de éxito en superficie'
  },
  {
    fg: 'success-border',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Borde de éxito en página'
  },
  {
    fg: 'on-warning',
    bg: 'warning-bg',
    threshold: 'text',
    usage: 'Avisos y toasts de advertencia'
  },
  {
    fg: 'on-warning',
    bg: 'bg-page',
    threshold: 'text',
    usage: 'Texto de advertencia sobre página (B3/B4)'
  },
  {
    fg: 'warning-icon',
    bg: 'bg-sunken',
    threshold: 'non-text',
    usage: 'Segmento medio en carril del medidor (B3/B4)'
  },
  {
    fg: 'error-icon',
    bg: 'bg-sunken',
    threshold: 'non-text',
    usage: 'Segmento débil en carril del medidor (B3/B4)'
  },
  {
    fg: 'success-icon',
    bg: 'bg-sunken',
    threshold: 'non-text',
    usage: 'Segmento fuerte en carril del medidor (B3/B4)'
  },
  {
    fg: 'warning-icon',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Icono de advertencia en superficie'
  },
  {
    fg: 'warning-icon',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Icono de advertencia en página'
  },
  {
    fg: 'warning-icon',
    bg: 'warning-bg',
    threshold: 'non-text',
    usage: 'Icono de advertencia en fondo de advertencia'
  },
  {
    fg: 'warning-border',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Borde de advertencia en superficie'
  },
  {
    fg: 'warning-border',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Borde de advertencia en página'
  },
  {
    fg: 'on-error',
    bg: 'error-bg',
    threshold: 'text',
    usage: 'Avisos y toasts de error'
  },
  {
    fg: 'error-text',
    bg: 'bg-surface',
    threshold: 'text',
    usage: 'Texto de error de validación en campo'
  },
  {
    fg: 'error-text',
    bg: 'bg-page',
    threshold: 'text',
    usage: 'Texto de error en página'
  },
  {
    fg: 'error-icon',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Icono de error en superficie'
  },
  {
    fg: 'error-icon',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Icono de error en página'
  },
  {
    fg: 'error-icon',
    bg: 'error-bg',
    threshold: 'non-text',
    usage: 'Icono de error en fondo de error'
  },
  {
    fg: 'error-border',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Borde de error en superficie'
  },
  {
    fg: 'error-border',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Borde de error en página'
  },
  {
    fg: 'on-danger',
    bg: 'danger-bg',
    threshold: 'text',
    usage: 'Botón de acción destructiva'
  },
  {
    fg: 'on-danger',
    bg: 'danger-bg-hover',
    threshold: 'text',
    usage: 'Botón destructivo en hover'
  },
  {
    fg: 'danger-bg',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Fondo de botón destructivo en superficie'
  },
  {
    fg: 'on-info',
    bg: 'info-bg',
    threshold: 'text',
    usage: 'Avisos y toasts informativos'
  },
  {
    fg: 'info-icon',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Icono informativo en superficie'
  },
  {
    fg: 'info-icon',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Icono informativo en página'
  },
  {
    fg: 'info-icon',
    bg: 'info-bg',
    threshold: 'non-text',
    usage: 'Icono informativo en fondo informativo'
  },
  {
    fg: 'info-border',
    bg: 'bg-surface',
    threshold: 'non-text',
    usage: 'Borde informativo en superficie'
  },
  {
    fg: 'info-border',
    bg: 'bg-page',
    threshold: 'non-text',
    usage: 'Borde informativo en página'
  },
  {
    fg: 'on-disabled',
    bg: 'disabled-bg',
    threshold: 'disabled-text',
    usage: 'Texto de botón o control deshabilitado'
  },
  {
    fg: 'disabled-border',
    bg: 'disabled-bg',
    threshold: 'non-text',
    usage: 'Borde discontinuo de control deshabilitado'
  },
  {
    fg: 'success-icon',
    bg: 'error-icon',
    threshold: 'distinct',
    usage: 'Distinción de luminancia entre icono de éxito y error'
  }
];
