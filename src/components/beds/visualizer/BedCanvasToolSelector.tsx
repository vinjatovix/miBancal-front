import type { JSX } from 'react';
import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import type {
  PlantingToolMode,
  BrushPatternType
} from '../../../types/PlantInstance/brushSelectionTypes';
import './bedCanvasToolSelector.css';

export interface BedCanvasToolSelectorProps {
  readonly activeMode: PlantingToolMode;
  readonly activeBrushPattern: BrushPatternType;
  readonly onSelectMode: (mode: PlantingToolMode) => void;
  readonly onSelectBrushPattern: (pattern: BrushPatternType) => void;
  readonly disabled?: boolean;
}

const BRUSH_PATTERNS: readonly BrushPatternType[] = [
  'single-row',
  'double-row',
  'staggered-triangle'
];

export function BedCanvasToolSelector({
  activeMode,
  activeBrushPattern,
  onSelectMode,
  onSelectBrushPattern,
  disabled = false
}: BedCanvasToolSelectorProps): JSX.Element {
  return (
    <div
      className="bed-canvas-tool-selector"
      role="toolbar"
      aria-label={t('bed.placement.tools_toolbar_label')}
    >
      <div
        className="bed-canvas-tool-selector__group"
        role="group"
        aria-label={t('bed.placement.tools_toolbar_label')}
      >
        <button
          type="button"
          className={`bed-canvas-tool-selector__button ${
            activeMode === 'select' ? 'is-active' : ''
          }`}
          aria-pressed={activeMode === 'select'}
          disabled={disabled}
          onClick={() => onSelectMode('select')}
        >
          <Icon name="explore" decorative />
          <span>{t('bed.placement.tool_select')}</span>
        </button>

        <button
          type="button"
          className={`bed-canvas-tool-selector__button ${
            activeMode === 'plant-single' ? 'is-active' : ''
          }`}
          aria-pressed={activeMode === 'plant-single'}
          disabled={disabled}
          onClick={() => onSelectMode('plant-single')}
        >
          <Icon name="seedling" decorative />
          <span>{t('bed.placement.tool_single_plant')}</span>
        </button>

        <button
          type="button"
          className={`bed-canvas-tool-selector__button ${
            activeMode === 'brush' ? 'is-active' : ''
          }`}
          aria-pressed={activeMode === 'brush'}
          disabled={disabled}
          onClick={() => onSelectMode('brush')}
        >
          <Icon name="grain" decorative />
          <span>{t('bed.placement.tool_brush')}</span>
        </button>
      </div>

      {activeMode === 'brush' ? (
        <div
          className="bed-canvas-tool-selector__patterns"
          role="group"
          aria-label={t('bed.placement.tool_brush')}
        >
          {BRUSH_PATTERNS.map((pattern) => {
            const isPatternActive = activeBrushPattern === pattern;
            const labelKey =
              pattern === 'single-row'
                ? 'bed.placement.brush_single_row'
                : pattern === 'double-row'
                  ? 'bed.placement.brush_double_row'
                  : 'bed.placement.brush_staggered_triangle';

            return (
              <button
                key={pattern}
                type="button"
                className={`bed-canvas-tool-selector__pattern-button ${
                  isPatternActive ? 'is-active' : ''
                }`}
                aria-pressed={isPatternActive}
                disabled={disabled}
                onClick={() => onSelectBrushPattern(pattern)}
              >
                <span>{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
