import {
  useCallback,
  useEffect,
  useRef,
  type JSX,
  type KeyboardEvent,
  type ReactNode
} from 'react';

import type { LayoutMode } from '../../../../components/beds/layout/utils/layoutTypes';
import { t } from '../../../../i18n/core/t';

export type ContextPanelVariant = 'palette' | 'tray' | 'properties' | 'none';

export interface LayoutContextPanelProps {
  readonly mode: LayoutMode;
  readonly open: boolean;
  readonly variant: ContextPanelVariant;
  readonly onRequestClose?: () => void;
  readonly isMobileSheet?: boolean;
  readonly children?: ReactNode;
}

function getVariantTitle(variant: ContextPanelVariant): string {
  if (variant === 'palette') return t('bed.placement.palette_title');
  if (variant === 'tray') return t('bed.layout.tray_title');
  if (variant === 'properties') return t('bed.layout.properties_title');
  return t('bed.layout.designer_mode_group');
}

export default function LayoutContextPanel({
  open,
  variant,
  onRequestClose,
  isMobileSheet = false,
  children
}: LayoutContextPanelProps): JSX.Element | null {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onRequestClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onRequestClose]);

  const handleTrapTab = useCallback(
    (event: KeyboardEvent<HTMLElement>): void => {
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    []
  );

  if (!open || variant === 'none') {
    return null;
  }

  const title = getVariantTitle(variant);

  if (isMobileSheet) {
    return (
      <div className="layout-context-panel__backdrop">
        <button
          type="button"
          className="layout-context-panel__backdrop-button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => onRequestClose?.()}
        />
        <section
          ref={panelRef}
          className="layout-context-panel layout-context-panel--sheet"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onKeyDown={handleTrapTab}
        >
          <div className="layout-context-panel__handle" aria-hidden="true" />
          <div className="layout-context-panel__content">{children}</div>
        </section>
      </div>
    );
  }

  return (
    <aside
      ref={panelRef}
      className="layout-context-panel layout-context-panel--docked"
      role="region"
      aria-label={title}
      onKeyDown={handleTrapTab}
    >
      <div className="layout-context-panel__content">{children}</div>
    </aside>
  );
}
