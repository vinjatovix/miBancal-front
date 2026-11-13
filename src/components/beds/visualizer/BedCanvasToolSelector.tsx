import type { JSX } from 'react';
import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import type {
  PlantingToolMode,
  BrushPatternType
} from '../../../types/PlantInstance/brushSelectionTypes';
import type { AssociationFilterMode } from '../associations/types/cropAssociationTypes';
import './bedCanvasToolSelector.css';

export interface BedCanvasToolSelectorProps {
  readonly activeMode: PlantingToolMode;
  readonly activeBrushPattern: BrushPatternType;
  readonly onSelectMode: (mode: PlantingToolMode) => void;
  readonly onSelectBrushPattern: (pattern: BrushPatternType) => void;
  readonly disabled?: boolean;
  readonly showAssociations?: boolean;
  readonly onToggleAssociations?: () => void;
  readonly associationFilterMode?: AssociationFilterMode;
  readonly onSelectAssociationFilterMode?: (
    mode: AssociationFilterMode
  ) => void;
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
  disabled = false,
  showAssociations = true,
  onToggleAssociations,
  associationFilterMode = 'all',
  onSelectAssociationFilterMode
}: BedCanvasToolSelectorProps): JSX.Element {
  return (
    <div
      className="bed-canvas-tool-selector"
      role="toolbar"
      aria-label={t('bed.placement.tools_toolbar_label')}
    >
      <fieldset
        className="bed-canvas-tool-selector__group"
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
      </fieldset>

      {activeMode === 'brush' ? (
        <fieldset
          className="bed-canvas-tool-selector__patterns"
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
        </fieldset>
      ) : null}

      {onToggleAssociations && (
        <fieldset
          className="bed-canvas-tool-selector__group"
          aria-label={t('bed.associations.layer_toggle')}
        >
          <button
            type="button"
            className={`bed-canvas-tool-selector__button ${
              showAssociations ? 'is-active' : ''
            }`}
            aria-pressed={showAssociations}
            disabled={disabled}
            onClick={onToggleAssociations}
          >
            <Icon
              name={showAssociations ? 'visibility' : 'visibility_off'}
              decorative
            />
            <span>{t('bed.associations.layer_toggle')}</span>
          </button>

          {showAssociations && onSelectAssociationFilterMode && (
            <button
              type="button"
              className={`bed-canvas-tool-selector__button ${
                associationFilterMode === 'detrimental_only' ? 'is-active' : ''
              }`}
              aria-pressed={associationFilterMode === 'detrimental_only'}
              disabled={disabled}
              onClick={() =>
                onSelectAssociationFilterMode(
                  associationFilterMode === 'all' ? 'detrimental_only' : 'all'
                )
              }
            >
              <Icon name="warning" decorative />
              <span>{t('bed.associations.filter_detrimental_only')}</span>
            </button>
          )}
        </fieldset>
      )}
    </div>
  );
}
