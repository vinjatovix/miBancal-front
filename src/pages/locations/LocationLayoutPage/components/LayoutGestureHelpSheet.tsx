import type { JSX } from 'react';

import { t } from '../../../../i18n/core/t';
import Modal from '../../../../shared/components/Modal/Modal';

import './layoutGestureHelpSheet.css';

export interface LayoutGestureHelpSheetProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const GESTURE_KEYS = [
  'location.layout.touch.gesture_tap',
  'location.layout.touch.gesture_long_press',
  'location.layout.touch.gesture_pinch',
  'location.layout.touch.gesture_two_finger_pan',
  'location.layout.touch.gesture_marquee',
  'location.layout.touch.gesture_brush'
] as const;

export default function LayoutGestureHelpSheet({
  isOpen,
  onClose
}: LayoutGestureHelpSheetProps): JSX.Element {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('location.layout.touch.help_title')}
      closeLabel={t('location.layout.touch.help_close')}
      overlayClassName="layout-gesture-help-sheet__overlay"
      className="layout-gesture-help-sheet"
    >
      <ul className="layout-gesture-help-sheet__list">
        {GESTURE_KEYS.map((key) => (
          <li key={key} className="layout-gesture-help-sheet__item">
            {t(key)}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
