export type ToastVariant = 'error' | 'success' | 'warning' | 'info';

export interface ToastItem {
  readonly id: string;
  readonly title?: string;
  readonly message: string;
  readonly variant: ToastVariant;
  readonly duration: number;
  readonly createdAt: number;
}

export interface ToastInput {
  readonly id?: string;
  readonly title?: string;
  readonly message: string;
  readonly variant?: ToastVariant;
  readonly duration?: number;
}

export interface ToastStore {
  addToast(input: ToastInput): string;
  dismissToast(id: string): void;
  clearToasts(): void;
  subscribe(listener: () => void): () => void;
  getSnapshot(): readonly ToastItem[];
}

export const MAX_VISIBLE_TOASTS = 3;

class ReactiveToastStore implements ToastStore {
  private toasts: readonly ToastItem[] = [];
  private readonly listeners = new Set<() => void>();

  public getSnapshot = (): readonly ToastItem[] => {
    return this.toasts;
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public addToast = (input: ToastInput): string => {
    const id = input.id ?? crypto.randomUUID();
    const variant = input.variant ?? 'error';
    const duration = input.duration ?? 0;
    const createdAt = Date.now();

    const newToast: ToastItem = {
      id,
      title: input.title,
      message: input.message,
      variant,
      duration,
      createdAt
    };

    const nextQueue =
      this.toasts.length >= MAX_VISIBLE_TOASTS
        ? [...this.toasts.slice(1), newToast]
        : [...this.toasts, newToast];

    this.toasts = nextQueue;
    this.notify();
    return id;
  };

  public dismissToast = (id: string): void => {
    const nextQueue = this.toasts.filter((item) => item.id !== id);
    if (nextQueue.length !== this.toasts.length) {
      this.toasts = nextQueue;
      this.notify();
    }
  };

  public clearToasts = (): void => {
    if (this.toasts.length > 0) {
      this.toasts = [];
      this.notify();
    }
  };

  private notify(): void {
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}

export const toastStore: ToastStore = new ReactiveToastStore();
