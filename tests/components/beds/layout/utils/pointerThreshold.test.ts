import { describe, expect, it } from 'vitest';

import {
  MOUSE_MOVE_THRESHOLD_PX,
  TOUCH_MOVE_THRESHOLD_PX,
  moveThresholdForPointerType,
  moveThresholdPx,
  pointerKind
} from '../../../../../src/components/beds/layout/utils/pointerThreshold';

describe('pointerThreshold', () => {
  describe('pointerKind', () => {
    it('maps mouse pointer type to mouse kind', () => {
      expect(pointerKind('mouse')).toBe('mouse');
    });

    it('maps touch pointer type to touch kind', () => {
      expect(pointerKind('touch')).toBe('touch');
    });

    it('treats pen as touch for threshold purposes', () => {
      expect(pointerKind('pen')).toBe('touch');
    });

    it('defaults unknown or empty pointer types to touch', () => {
      expect(pointerKind('')).toBe('touch');
      expect(pointerKind('unknown')).toBe('touch');
    });
  });

  describe('moveThresholdPx', () => {
    it('uses the coarse touch threshold for touch', () => {
      expect(moveThresholdPx('touch')).toBe(TOUCH_MOVE_THRESHOLD_PX);
    });

    it('uses the fine mouse threshold for mouse', () => {
      expect(moveThresholdPx('mouse')).toBe(MOUSE_MOVE_THRESHOLD_PX);
    });
  });

  describe('thresholds', () => {
    it('keeps the mouse threshold at the legacy 4px value', () => {
      expect(MOUSE_MOVE_THRESHOLD_PX).toBe(4);
    });

    it('keeps the touch threshold within the 10-12px range', () => {
      expect(TOUCH_MOVE_THRESHOLD_PX).toBeGreaterThanOrEqual(10);
      expect(TOUCH_MOVE_THRESHOLD_PX).toBeLessThanOrEqual(12);
    });
  });

  describe('moveThresholdForPointerType', () => {
    it('derives the touch threshold directly from a pen pointer type', () => {
      expect(moveThresholdForPointerType('pen')).toBe(TOUCH_MOVE_THRESHOLD_PX);
    });

    it('derives the mouse threshold from a mouse pointer type', () => {
      expect(moveThresholdForPointerType('mouse')).toBe(
        MOUSE_MOVE_THRESHOLD_PX
      );
    });
  });
});
