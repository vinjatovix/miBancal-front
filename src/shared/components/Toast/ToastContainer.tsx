import React from 'react';
import { t } from '../../../i18n/core/t';
import { useToast } from '../../toast/useToast';
import { ToastItemView } from './ToastItemView';
import './toast.css';

export interface ToastContainerProps {
  readonly className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  className
}) => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  const containerClassName = className
    ? `toast-container ${className}`
    : 'toast-container';

  return (
    <div
      className={containerClassName}
      role="region"
      aria-label={t('toast.region_label')}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItemView key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};
