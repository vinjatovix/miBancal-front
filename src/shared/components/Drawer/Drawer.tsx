import { type ReactNode, useEffect } from 'react';
import { t } from '../../../i18n/core/t';
import './drawer.css';

interface DrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly width?: number;
  readonly position?: 'left' | 'right';
}

export default function Drawer({
  isOpen,
  onClose,
  children,
  width = 320,
  position = 'left'
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="drawer-overlay"
          onClick={onClose}
          aria-label={t('common.drawer.close')}
        />
      )}

      <aside
        className={[
          'drawer-panel',
          `drawer-${position}`,
          isOpen ? 'drawer-open' : 'drawer-closed'
        ].join(' ')}
        style={
          {
            '--drawer-width': `${width}px`
          } as React.CSSProperties
        }
      >
        {children}
      </aside>
    </>
  );
}
