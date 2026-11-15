import React, { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../../../i18n/core/t';
import Icon from '../Icon/Icon';
import type { IconName } from '../Icon/iconPaths';
import type { ToastItem, ToastVariant } from '../../toast/toastStore';

const ICON_BY_VARIANT: Record<ToastVariant, IconName> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning'
};

export interface ToastItemViewProps {
  readonly toast: ToastItem;
  readonly onDismiss: (id: string) => void;
}

export const ToastItemView: React.FC<ToastItemViewProps> = ({
  toast,
  onDismiss
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(toast.duration);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const clearActiveTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (duration: number) => {
      clearActiveTimer();
      if (duration <= 0) {
        onDismissRef.current(toast.id);
        return;
      }
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onDismissRef.current(toast.id);
      }, duration);
    },
    [clearActiveTimer, toast.id]
  );

  const pauseTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearActiveTimer();
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(
        0,
        remainingTimeRef.current - elapsed
      );
    }
    setIsPaused(true);
  }, [clearActiveTimer]);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    startTimer(remainingTimeRef.current);
  }, [startTimer]);

  useEffect(() => {
    if (toast.duration <= 0) return;

    remainingTimeRef.current = toast.duration;
    isHoveredRef.current = false;
    isFocusedRef.current = false;
    startTimer(toast.duration);

    return () => {
      clearActiveTimer();
    };
  }, [toast.id, toast.duration, startTimer, clearActiveTimer]);

  const handleMouseEnter = () => {
    if (toast.duration <= 0) return;
    isHoveredRef.current = true;
    pauseTimer();
  };

  const handleMouseLeave = () => {
    if (toast.duration <= 0) return;
    isHoveredRef.current = false;
    if (!isFocusedRef.current) {
      resumeTimer();
    }
  };

  const handleFocus = () => {
    if (toast.duration <= 0) return;
    isFocusedRef.current = true;
    pauseTimer();
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (toast.duration <= 0) return;
    const nextFocused = event.relatedTarget;
    if (
      nextFocused instanceof Node &&
      event.currentTarget.contains(nextFocused)
    ) {
      return;
    }
    isFocusedRef.current = false;
    if (!isHoveredRef.current) {
      resumeTimer();
    }
  };

  const iconName = ICON_BY_VARIANT[toast.variant];
  const role = toast.variant === 'error' ? 'alert' : 'status';
  const pausedClassName = isPaused ? ' toast-item--paused' : '';

  return (
    <div
      className={`toast-item toast-item--${toast.variant}${pausedClassName}`}
      role={role}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {toast.duration > 0 ? (
        <span
          className={`toast-item__progress toast-item__progress--${toast.variant}`}
          style={{ animationDuration: `${toast.duration}ms` }}
          aria-hidden="true"
        />
      ) : null}
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
