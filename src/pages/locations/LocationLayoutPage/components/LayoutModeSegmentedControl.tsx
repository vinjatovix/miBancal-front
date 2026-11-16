import { useCallback, useRef, type JSX, type KeyboardEvent } from 'react';

import LayoutGlyph, {
  type LayoutGlyphName
} from '../../../../components/beds/layout/LayoutGlyph';
import type { LayoutMode } from '../../../../components/beds/layout/utils/layoutTypes';
import { t } from '../../../../i18n/core/t';

import './layoutModeSegmentedControl.css';

export interface LayoutModeSegmentedControlProps {
  readonly mode: LayoutMode;
  readonly onChange: (mode: LayoutMode) => void;
  readonly disabled?: boolean;
}

interface ModeOption {
  readonly key: LayoutMode;
  readonly label: string;
  readonly glyph: LayoutGlyphName;
}

const MODES: readonly ModeOption[] = [
  { key: 'read', label: t('bed.layout.mode_view'), glyph: 'eye' },
  {
    key: 'position',
    label: t('bed.layout.mode_position_short'),
    glyph: 'move'
  },
  { key: 'plants', label: t('bed.layout.mode_plants'), glyph: 'seed' }
];

export default function LayoutModeSegmentedControl({
  mode,
  onChange,
  disabled = false
}: LayoutModeSegmentedControlProps): JSX.Element {
  const radioRefs = useRef<Map<LayoutMode, HTMLButtonElement>>(new Map());

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number): void => {
      let nextIndex: number;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % MODES.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + MODES.length) % MODES.length;
      } else {
        return;
      }
      const nextMode = MODES[nextIndex].key;
      onChange(nextMode);
      radioRefs.current.get(nextMode)?.focus();
    },
    [onChange]
  );

  return (
    <div
      className="layout-mode-segmented-control"
      role="radiogroup"
      aria-label={t('bed.layout.designer_mode_group')}
    >
      {MODES.map((item, index) => {
        const isChecked = mode === item.key;
        return (
          <button
            key={item.key}
            ref={(el) => {
              if (el) radioRefs.current.set(item.key, el);
              else radioRefs.current.delete(item.key);
            }}
            type="button"
            role="radio"
            aria-checked={isChecked}
            tabIndex={isChecked ? 0 : -1}
            disabled={disabled}
            className={`layout-mode-segmented-control__item ${
              isChecked ? 'is-active' : ''
            }`}
            onClick={() => onChange(item.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <LayoutGlyph name={item.glyph} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
