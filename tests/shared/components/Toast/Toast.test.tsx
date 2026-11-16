import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../../../../src/i18n/core/t';
import { ToastContainer } from '../../../../src/shared/components/Toast/ToastContainer';
import { ToastItemView } from '../../../../src/shared/components/Toast/ToastItemView';
import {
  toastStore,
  DEFAULT_SUCCESS_TOAST_DURATION,
  type ToastItem
} from '../../../../src/shared/toast/toastStore';

describe('ToastItemView', () => {
  it('renders with role="alert", warning icon, title and message', () => {
    const toast: ToastItem = {
      id: 'test-1',
      title: 'Título de error',
      message: 'Mensaje explicativo',
      variant: 'error',
      duration: 0,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();

    render(<ToastItemView toast={toast} onDismiss={onDismiss} />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(screen.getByText('Título de error')).toBeInTheDocument();
    expect(screen.getByText('Mensaje explicativo')).toBeInTheDocument();
  });

  it('renders message only when title is omitted', () => {
    const toast: ToastItem = {
      id: 'test-2',
      message: 'Solo mensaje',
      variant: 'error',
      duration: 0,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();

    render(<ToastItemView toast={toast} onDismiss={onDismiss} />);

    expect(screen.getByText('Solo mensaje')).toBeInTheDocument();
  });

  it('calls onDismiss with toast id when accessible close button is clicked', async () => {
    const user = userEvent.setup();
    const toast: ToastItem = {
      id: 'toast-to-dismiss',
      message: 'Mensaje a descartar',
      variant: 'error',
      duration: 0,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();

    render(<ToastItemView toast={toast} onDismiss={onDismiss} />);

    const closeButton = screen.getByRole('button', {
      name: t('toast.close')
    });
    await user.click(closeButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('toast-to-dismiss');
  });

  it('calls onDismiss when close button is activated via Enter keyboard key', async () => {
    const user = userEvent.setup();
    const toast: ToastItem = {
      id: 'toast-enter',
      message: 'Mensaje teclado',
      variant: 'error',
      duration: 0,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();

    render(<ToastItemView toast={toast} onDismiss={onDismiss} />);

    const closeButton = screen.getByRole('button', {
      name: t('toast.close')
    });
    closeButton.focus();
    await user.keyboard('{Enter}');

    expect(onDismiss).toHaveBeenCalledWith('toast-enter');
  });

  it('calls onDismiss when close button is activated via Space keyboard key', async () => {
    const user = userEvent.setup();
    const toast: ToastItem = {
      id: 'toast-space',
      message: 'Mensaje espacio',
      variant: 'error',
      duration: 0,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();

    render(<ToastItemView toast={toast} onDismiss={onDismiss} />);

    const closeButton = screen.getByRole('button', {
      name: t('toast.close')
    });
    closeButton.focus();
    await user.keyboard(' ');

    expect(onDismiss).toHaveBeenCalledWith('toast-space');
  });

  it('renders with role="status" for non-error variants', () => {
    const toast: ToastItem = {
      id: 'toast-status',
      title: 'Operación correcta',
      message: 'Cambios guardados',
      variant: 'success',
      duration: 4000,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();

    render(<ToastItemView toast={toast} onDismiss={onDismiss} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('triggers onDismiss when duration elapses', () => {
    vi.useFakeTimers();
    const toast: ToastItem = {
      id: 'toast-timed',
      message: 'Mensaje temporal',
      variant: 'info',
      duration: 3000,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();

    render(<ToastItemView toast={toast} onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onDismiss).toHaveBeenCalledWith('toast-timed');
    vi.useRealTimers();
  });

  it('renders a progress bar with matching animation duration when toast duration is positive', () => {
    const toast: ToastItem = {
      id: 'toast-progress',
      message: 'Operación con éxito',
      variant: 'success',
      duration: 5000,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();

    const { container } = render(
      <ToastItemView toast={toast} onDismiss={onDismiss} />
    );

    const progressBar = container.querySelector('.toast-item__progress');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveClass('toast-item__progress--success');
    expect(progressBar).toHaveStyle({ animationDuration: '5000ms' });
  });

  it('does not render a progress bar when toast duration is zero', () => {
    const toast: ToastItem = {
      id: 'toast-no-progress',
      message: 'Error permanente',
      variant: 'error',
      duration: 0,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();

    const { container } = render(
      <ToastItemView toast={toast} onDismiss={onDismiss} />
    );

    expect(
      container.querySelector('.toast-item__progress')
    ).not.toBeInTheDocument();
  });

  it('pauses auto-dismiss timer and adds paused class when pointer enters toast', () => {
    vi.useFakeTimers();
    const toast: ToastItem = {
      id: 'toast-hover-pause',
      message: 'Mensaje con pausa',
      variant: 'success',
      duration: 5000,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastItemView toast={toast} onDismiss={onDismiss} />
    );
    const toastElement = container.querySelector('.toast-item') as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(2000);
      fireEvent.mouseEnter(toastElement);
      vi.advanceTimersByTime(4000);
    });

    expect(toastElement).toHaveClass('toast-item--paused');
    expect(onDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('resumes auto-dismiss timer from remaining time when pointer leaves toast', () => {
    vi.useFakeTimers();
    const toast: ToastItem = {
      id: 'toast-hover-resume',
      message: 'Mensaje con reanudación',
      variant: 'success',
      duration: 5000,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastItemView toast={toast} onDismiss={onDismiss} />
    );
    const toastElement = container.querySelector('.toast-item') as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(2000);
      fireEvent.mouseEnter(toastElement);
      vi.advanceTimersByTime(4000);
      fireEvent.mouseLeave(toastElement);
      vi.advanceTimersByTime(3000);
    });

    expect(onDismiss).toHaveBeenCalledWith('toast-hover-resume');
    vi.useRealTimers();
  });

  it('pauses auto-dismiss timer and adds paused class when toast receives focus', () => {
    vi.useFakeTimers();
    const toast: ToastItem = {
      id: 'toast-focus-pause',
      message: 'Mensaje con foco',
      variant: 'success',
      duration: 5000,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastItemView toast={toast} onDismiss={onDismiss} />
    );
    const toastElement = container.querySelector('.toast-item') as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(2000);
      fireEvent.focus(toastElement);
      vi.advanceTimersByTime(4000);
    });

    expect(toastElement).toHaveClass('toast-item--paused');
    expect(onDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('resumes auto-dismiss timer from remaining time when toast loses focus', () => {
    vi.useFakeTimers();
    const toast: ToastItem = {
      id: 'toast-focus-resume',
      message: 'Mensaje con pérdida de foco',
      variant: 'success',
      duration: 5000,
      createdAt: Date.now()
    };
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastItemView toast={toast} onDismiss={onDismiss} />
    );
    const toastElement = container.querySelector('.toast-item') as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(2000);
      fireEvent.focus(toastElement);
      vi.advanceTimersByTime(4000);
      fireEvent.blur(toastElement);
      vi.advanceTimersByTime(3000);
    });

    expect(onDismiss).toHaveBeenCalledWith('toast-focus-resume');
    vi.useRealTimers();
  });
});

describe('ToastContainer', () => {
  beforeEach(() => {
    toastStore.clearToasts();
  });

  it('renders nothing when there are no active toasts', () => {
    const { container } = render(<ToastContainer />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders container with role="region", system notification label, and polite aria-live', () => {
    toastStore.addToast({ message: 'Error visible' });

    render(<ToastContainer />);

    const region = screen.getByRole('region', {
      name: t('toast.region_label')
    });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Error visible')).toBeInTheDocument();
  });

  it('renders multiple active toasts up to the maximum capacity', () => {
    toastStore.addToast({ message: 'Error uno' });
    toastStore.addToast({ message: 'Error dos' });
    toastStore.addToast({ message: 'Error tres' });

    render(<ToastContainer />);

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);
  });

  it('dismisses toast from container when close button is clicked', async () => {
    const user = userEvent.setup();
    toastStore.addToast({ message: 'Error eliminable' });

    render(<ToastContainer />);

    const closeButton = screen.getByRole('button', {
      name: t('toast.close')
    });
    await user.click(closeButton);

    expect(screen.queryByText('Error eliminable')).not.toBeInTheDocument();
  });

  it('persists error toast indefinitely without automatic dismiss timer', () => {
    vi.useFakeTimers();
    toastStore.addToast({ message: 'Error permanente', variant: 'error' });

    render(<ToastContainer />);

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByText('Error permanente')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('auto-dismisses toast from container when duration is greater than zero', () => {
    vi.useFakeTimers();
    toastStore.addToast({
      message: 'Éxito temporal',
      variant: 'success',
      duration: 4000
    });

    render(<ToastContainer />);

    expect(screen.getByText('Éxito temporal')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Éxito temporal')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('auto-dismisses success toast after default 5000ms duration', () => {
    vi.useFakeTimers();
    toastStore.addToast({
      message: 'Éxito con tiempo por defecto',
      variant: 'success'
    });

    render(<ToastContainer />);

    expect(
      screen.getByText('Éxito con tiempo por defecto')
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(DEFAULT_SUCCESS_TOAST_DURATION);
    });

    expect(
      screen.queryByText('Éxito con tiempo por defecto')
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
