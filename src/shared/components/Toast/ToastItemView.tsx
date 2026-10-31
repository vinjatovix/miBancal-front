import React, { useEffect } from 'react';
import { t } from '../../../i18n/core/t';
import Icon from '../Icon/Icon';
import type { ToastItem } from '../../toast/toastStore';

export interface ToastItemViewProps {
  readonly toast: ToastItem;
  readonly onDismiss: (id: string) => void;
}

export const ToastItemView: React.FC<ToastItemViewProps> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    if (toast.duration <= 0) return;

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const iconName = toast.variant === 'success' ? 'tick' : 'warning';
  const role = toast.variant === 'error' ? 'alert' : 'status';

  return (
    <div className={`toast-item toast-item--${toast.variant}`} role={role}>
      <span className={`toast-item__icon toast-item__icon--${toast.variant}`}>
        <Icon name={iconName} decorative />
      </span>
      <div className="toast-item__body">
        {toast.title ? (
          <span className="toast-item__title">{toast.title}</span>
        ) : null}
        <span className="toast-item__message">{toast.message}</span>
      </div>
      <button
        type="button"
        className="toast-item__close"
        aria-label={t('toast.close')}
        onClick={() => onDismiss(toast.id)}
      >
        <Icon name="close" decorative />
      </button>
    </div>
  );
};
