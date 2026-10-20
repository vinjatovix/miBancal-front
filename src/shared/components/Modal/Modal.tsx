import { type ReactNode, useEffect, useId, useRef } from 'react';

import { t } from '../../../i18n/core/t';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import Icon from '../Icon/Icon';
import type { IconName } from '../Icon/iconPaths';

import './modal.css';

export type ModalVariant = 'default' | 'danger' | 'warning' | 'info';

export interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: ReactNode;
  readonly subtitle?: ReactNode;
  readonly icon?: IconName;
  readonly variant?: ModalVariant;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly showCloseButton?: boolean;
  readonly closeLabel?: string;
  readonly maxWidth?: string;
  readonly preventClose?: boolean;
  readonly role?: 'dialog' | 'alertdialog';
  readonly className?: string;
  readonly overlayClassName?: string;
  readonly ariaLabelledBy?: string;
  readonly ariaDescribedBy?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  variant = 'default',
  children,
  footer,
  showCloseButton = true,
  closeLabel,
  maxWidth,
  preventClose = false,
  role = 'dialog',
  className,
  overlayClassName,
  ariaLabelledBy,
  ariaDescribedBy
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const defaultTitleId = useId();
  const titleId = ariaLabelledBy ?? (title ? defaultTitleId : undefined);

  useFocusTrap(isOpen, dialogRef);

  useEffect(() => {
    if (!isOpen || preventClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, preventClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasHeader = Boolean(title || icon || showCloseButton);

  return (
    <div
      className={['modal-overlay', overlayClassName].filter(Boolean).join(' ')}
      onClick={preventClose ? undefined : onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={ariaDescribedBy}
        className={['modal-card', `modal-card--${variant}`, className]
          .filter(Boolean)
          .join(' ')}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-accent modal-accent--${variant}`} />

        {hasHeader && (
          <header className="modal-header">
            <div className="modal-header-left">
              {icon && (
                <div
                  className={`modal-icon-badge modal-icon-badge--${variant}`}
                >
                  <Icon name={icon} decorative />
                </div>
              )}
              <div className="modal-header-text">
                {subtitle && <span className="modal-subtitle">{subtitle}</span>}
                {title && (
                  <h2 id={titleId} className="modal-title">
                    {title}
                  </h2>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label={closeLabel ?? t('common.modal.close')}
                disabled={preventClose}
              >
                <Icon name="close" decorative />
              </button>
            )}
          </header>
        )}

        <div className="modal-body">{children}</div>

        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}
