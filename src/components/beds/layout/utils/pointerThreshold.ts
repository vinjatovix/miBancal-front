export type PointerKind = 'mouse' | 'touch';

export const MOUSE_MOVE_THRESHOLD_PX = 4;
export const TOUCH_MOVE_THRESHOLD_PX = 12;

export function pointerKind(pointerType: string): PointerKind {
  return pointerType === 'mouse' ? 'mouse' : 'touch';
}

export function moveThresholdPx(kind: PointerKind): number {
  return kind === 'mouse' ? MOUSE_MOVE_THRESHOLD_PX : TOUCH_MOVE_THRESHOLD_PX;
}

export function moveThresholdForPointerType(pointerType: string): number {
  return moveThresholdPx(pointerKind(pointerType));
}
