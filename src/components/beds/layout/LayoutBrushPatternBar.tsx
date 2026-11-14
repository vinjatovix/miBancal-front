import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import type { BrushPatternType } from '../../../types/PlantInstance/brushSelectionTypes';
import LayoutGlyph, { type LayoutGlyphName } from './LayoutGlyph';

import './layoutBrushPatternBar.css';

export interface LayoutBrushPatternBarProps {
  readonly activePattern: BrushPatternType;
  readonly onSelectPattern: (pattern: BrushPatternType) => void;
  readonly disabled?: boolean;
  readonly isMobile?: boolean;
}

interface PatternOption {
  readonly key: BrushPatternType;
  readonly labelKey: I18nKey;
  readonly glyph: LayoutGlyphName;
}

const PATTERNS: readonly PatternOption[] = [
  {
    key: 'individual',
    labelKey: 'bed.placement.tool_single_plant_short',
    glyph: 'seed'
  },
  {
    key: 'single-row',
    labelKey: 'bed.placement.brush_single_row',
    glyph: 'row-single'
  },
  {
    key: 'double-row',
    labelKey: 'bed.placement.brush_double_row',
    glyph: 'row-double'
  },
  {
    key: 'staggered-triangle',
    labelKey: 'bed.placement.brush_staggered_triangle',
    glyph: 'row-staggered'
  }
];

export default function LayoutBrushPatternBar({
  activePattern,
  onSelectPattern,
  disabled = false,
  isMobile = false
}: LayoutBrushPatternBarProps): JSX.Element {
  return (
    <div
      className={
        isMobile
          ? 'layout-brush-pattern-bar layout-brush-pattern-bar--mobile'
          : 'layout-brush-pattern-bar'
      }
      role="toolbar"
      aria-label={t('bed.placement.tool_brush')}
    >
      {!isMobile && (
        <span className="layout-brush-pattern-bar__label">
          {t('bed.placement.brush_pattern_label')}
        </span>
      )}
      <fieldset
        className="layout-brush-pattern-bar__options"
        aria-label={t('bed.placement.tool_brush')}
      >
        {PATTERNS.map((pattern) => {
          const isActive = activePattern === pattern.key;
          const label = t(pattern.labelKey);
          return (
            <button
              key={pattern.key}
              type="button"
              className={`layout-brush-pattern-bar__option ${
                isActive ? 'is-active' : ''
              }`}
              aria-pressed={isActive}
              aria-label={label}
              title={label}
              disabled={disabled}
              onClick={() => onSelectPattern(pattern.key)}
            >
              <LayoutGlyph name={pattern.glyph} />
              <span className={isMobile ? 'sr-only' : undefined}>{label}</span>
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
