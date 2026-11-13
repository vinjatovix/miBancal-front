import { useCallback, useEffect, useRef, useState } from 'react';

import {
  moveThresholdForPointerType,
  pointerKind
} from '../utils/pointerThreshold';

export type GesturePhase =
  | 'idle'
  | 'pending'
  | 'pressing'
  | 'panning'
  | 'dragging'
  | 'navigating';

export interface GesturePoint {
  readonly x: number;
  readonly y: number;
}

export interface LayoutTouchPointer {
  readonly pointerId: number;
  readonly pointerType: string;
  readonly clientX: number;
  readonly clientY: number;
}

export interface UseLayoutTouchGesturesParams {
  readonly longPressMs?: number;
  readonly getTargetId?: (point: GesturePoint) => string | null;
  readonly canDragTarget?: (targetId: string | null) => boolean;
  readonly onTap?: (point: GesturePoint, targetId: string | null) => void;
  readonly onPanStart?: (point: GesturePoint) => void;
  readonly onPanMove?: (point: GesturePoint) => void;
  readonly onPanEnd?: (point: GesturePoint) => void;
  readonly onDragStart?: (point: GesturePoint, targetId: string | null) => void;
  readonly onDragMove?: (point: GesturePoint) => void;
  readonly onDragEnd?: (point: GesturePoint) => void;
  readonly onDragCancel?: () => void;
  readonly onNavigateStart?: () => void;
  readonly onNavigateEnd?: () => void;
}

export interface LayoutTouchGestures {
  readonly phase: GesturePhase;
  readonly onPointerDown: (event: LayoutTouchPointer) => void;
  readonly onPointerMove: (event: LayoutTouchPointer) => void;
  readonly onPointerUp: (event: LayoutTouchPointer) => void;
}

interface Machine {
  phase: GesturePhase;
  pointers: Map<number, GesturePoint>;
  startPoint: GesturePoint | null;
  targetId: string | null;
  pointerType: string;
  longPressTimer: ReturnType<typeof setTimeout> | null;
}

const DEFAULT_LONG_PRESS_MS = 300;

function distance(a: GesturePoint, b: GesturePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function useLayoutTouchGestures(
  params: UseLayoutTouchGesturesParams
): LayoutTouchGestures {
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  });

  const [phase, setPhase] = useState<GesturePhase>('idle');
  const machineRef = useRef<Machine>({
    phase: 'idle',
    pointers: new Map(),
    startPoint: null,
    targetId: null,
    pointerType: 'touch',
    longPressTimer: null
  });

  const updatePhase = useCallback((next: GesturePhase): void => {
    machineRef.current.phase = next;
    setPhase(next);
  }, []);

  const clearLongPress = useCallback((): void => {
    const machine = machineRef.current;
    if (machine.longPressTimer !== null) {
      clearTimeout(machine.longPressTimer);
      machine.longPressTimer = null;
    }
  }, []);

  const resetMachine = useCallback((): void => {
    const machine = machineRef.current;
    machine.startPoint = null;
    machine.targetId = null;
    machine.longPressTimer = null;
  }, []);

  const startDrag = useCallback(
    (point: GesturePoint): void => {
      const machine = machineRef.current;
      clearLongPress();
      updatePhase('dragging');
      paramsRef.current.onDragStart?.(
        machine.startPoint ?? point,
        machine.targetId
      );
      paramsRef.current.onDragMove?.(point);
    },
    [clearLongPress, updatePhase]
  );

  const startPan = useCallback(
    (point: GesturePoint): void => {
      const machine = machineRef.current;
      clearLongPress();
      updatePhase('panning');
      paramsRef.current.onPanStart?.(machine.startPoint ?? point);
      paramsRef.current.onPanMove?.(point);
    },
    [clearLongPress, updatePhase]
  );

  const handlePendingMove = useCallback(
    (point: GesturePoint, moved: number, threshold: number): void => {
      if (moved <= threshold) return;
      const machine = machineRef.current;
      const canDrag =
        paramsRef.current.canDragTarget?.(machine.targetId) ?? false;
      if (pointerKind(machine.pointerType) === 'mouse' && canDrag) {
        startDrag(point);
        return;
      }
      startPan(point);
    },
    [startDrag, startPan]
  );

  const handleSecondPointer = useCallback((): void => {
    const machine = machineRef.current;
    clearLongPress();
    if (machine.phase === 'dragging') {
      paramsRef.current.onDragCancel?.();
    }
    updatePhase('navigating');
    paramsRef.current.onNavigateStart?.();
  }, [clearLongPress, updatePhase]);

  const onPointerDown = useCallback(
    (event: LayoutTouchPointer): void => {
      const machine = machineRef.current;
      const point = { x: event.clientX, y: event.clientY };
      machine.pointers.set(event.pointerId, point);
      if (machine.pointers.size >= 2) {
        handleSecondPointer();
        return;
      }
      machine.startPoint = point;
      machine.targetId = paramsRef.current.getTargetId?.(point) ?? null;
      machine.pointerType = event.pointerType;
      updatePhase('pending');
      const canDrag =
        paramsRef.current.canDragTarget?.(machine.targetId) ?? false;
      if (pointerKind(event.pointerType) === 'touch' && canDrag) {
        const delay = paramsRef.current.longPressMs ?? DEFAULT_LONG_PRESS_MS;
        machine.longPressTimer = setTimeout(() => {
          machine.longPressTimer = null;
          if (machine.phase === 'pending') updatePhase('pressing');
        }, delay);
      }
    },
    [handleSecondPointer, updatePhase]
  );

  const onPointerMove = useCallback(
    (event: LayoutTouchPointer): void => {
      const machine = machineRef.current;
      if (!machine.pointers.has(event.pointerId)) return;
      const point = { x: event.clientX, y: event.clientY };
      machine.pointers.set(event.pointerId, point);
      if (machine.phase === 'navigating' || machine.pointers.size !== 1) return;
      if (!machine.startPoint) return;
      const moved = distance(point, machine.startPoint);
      const threshold = moveThresholdForPointerType(machine.pointerType);
      if (machine.phase === 'pending') {
        handlePendingMove(point, moved, threshold);
      } else if (machine.phase === 'pressing') {
        if (moved > threshold) startDrag(point);
      } else if (machine.phase === 'panning') {
        paramsRef.current.onPanMove?.(point);
      } else if (machine.phase === 'dragging') {
        paramsRef.current.onDragMove?.(point);
      }
    },
    [handlePendingMove, startDrag]
  );

  const finishGesture = useCallback(
    (endPhase: GesturePhase, upPoint: GesturePoint): void => {
      const machine = machineRef.current;
      const api = paramsRef.current;
      if (endPhase === 'pending' || endPhase === 'pressing') {
        const start = machine.startPoint;
        const threshold = moveThresholdForPointerType(machine.pointerType);
        if (start && distance(upPoint, start) <= threshold) {
          api.onTap?.(start, machine.targetId);
        }
      } else if (endPhase === 'panning') {
        api.onPanEnd?.(upPoint);
      } else if (endPhase === 'dragging') {
        api.onDragEnd?.(upPoint);
      } else if (endPhase === 'navigating') {
        api.onNavigateEnd?.();
      }
      updatePhase('idle');
    },
    [updatePhase]
  );

  const onPointerUp = useCallback(
    (event: LayoutTouchPointer): void => {
      const machine = machineRef.current;
      if (!machine.pointers.has(event.pointerId)) return;
      machine.pointers.delete(event.pointerId);
      clearLongPress();
      if (machine.pointers.size > 0) return;
      finishGesture(machine.phase, { x: event.clientX, y: event.clientY });
      resetMachine();
    },
    [clearLongPress, finishGesture, resetMachine]
  );

  useEffect(() => clearLongPress, [clearLongPress]);

  return { phase, onPointerDown, onPointerMove, onPointerUp };
}
