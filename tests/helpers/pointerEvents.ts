import { vi } from 'vitest';

export type SyntheticPointerType = 'mouse' | 'touch' | 'pen';

export interface SyntheticPointerInit {
  readonly pointerId?: number;
  readonly pointerType?: SyntheticPointerType;
  readonly clientX?: number;
  readonly clientY?: number;
  readonly button?: number;
  readonly buttons?: number;
  readonly shiftKey?: boolean;
  readonly target?: EventTarget | null;
}

export interface SyntheticPointerEvent {
  readonly type: string;
  readonly pointerId: number;
  readonly pointerType: SyntheticPointerType;
  readonly clientX: number;
  readonly clientY: number;
  readonly button: number;
  readonly buttons: number;
  readonly shiftKey: boolean;
  readonly target: EventTarget | null;
  readonly currentTarget: EventTarget | null;
  readonly preventDefault: () => void;
  readonly stopPropagation: () => void;
  readonly nativeEvent: { readonly offsetX: number; readonly offsetY: number };
}

export function createPointerEvent(
  type: string,
  init: SyntheticPointerInit = {}
): SyntheticPointerEvent {
  const {
    pointerId = 1,
    pointerType = 'touch',
    clientX = 0,
    clientY = 0,
    button = 0,
    buttons = pointerType === 'mouse' ? 1 : 0,
    shiftKey = false,
    target = null
  } = init;

  return {
    type,
    pointerId,
    pointerType,
    clientX,
    clientY,
    button,
    buttons,
    shiftKey,
    target,
    currentTarget: target,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    nativeEvent: { offsetX: clientX, offsetY: clientY }
  };
}

export function pointerDown(
  init: SyntheticPointerInit = {}
): SyntheticPointerEvent {
  return createPointerEvent('pointerdown', init);
}

export function pointerMove(
  init: SyntheticPointerInit = {}
): SyntheticPointerEvent {
  return createPointerEvent('pointermove', init);
}

export function pointerUp(
  init: SyntheticPointerInit = {}
): SyntheticPointerEvent {
  return createPointerEvent('pointerup', init);
}

export function dispatchPointerEvent(
  element: Element,
  type: string,
  init: SyntheticPointerInit = {}
): void {
  const {
    pointerId = 1,
    pointerType = 'touch',
    clientX = 0,
    clientY = 0,
    button = 0,
    buttons = pointerType === 'mouse' ? 1 : 0,
    shiftKey = false
  } = init;

  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    button,
    buttons,
    shiftKey
  }) as MouseEvent & {
    pointerId: number;
    pointerType: SyntheticPointerType;
  };

  Object.defineProperty(event, 'pointerId', { value: pointerId });
  Object.defineProperty(event, 'pointerType', { value: pointerType });

  element.dispatchEvent(event);
}
