import type { JSX } from 'react';

import LayoutGlyph, { type LayoutGlyphName } from '../layout/LayoutGlyph';
import { t } from '../../../i18n/core/t';
import type { PlantingToolMode } from '../../../types/PlantInstance/brushSelectionTypes';

import './plantingToolSelector.css';

export interface PlantingToolSelectorProps {
  readonly activeMode: PlantingToolMode;
  readonly onSelectMode: (mode: PlantingToolMode) => void;
  readonly disabled?: boolean;
}

interface ToolOption {
  readonly key: PlantingToolMode;
  readonly glyph: LayoutGlyphName;
  readonly label: string;
  readonly fullLabel: string;
  readonly shortcut: string;
}

const TOOLS: readonly ToolOption[] = [
  {
    key: 'select',
    glyph: 'cursor',
    label: t('bed.placement.tool_select_short'),
    fullLabel: t('bed.placement.tool_select'),
    shortcut: t('bed.layout.key_v')
  },
  {
    key: 'plant-single',
    glyph: 'seed',
    label: t('bed.placement.tool_single_plant_short'),
    fullLabel: t('bed.placement.tool_single_plant'),
    shortcut: t('bed.layout.key_p')
  },
  {
    key: 'brush',
    glyph: 'brush',
    label: t('bed.placement.tool_brush_short'),
    fullLabel: t('bed.placement.tool_brush'),
    shortcut: t('bed.layout.key_b')
  }
];

export default function PlantingToolSelector({
  activeMode,
  onSelectMode,
  disabled = false
}: PlantingToolSelectorProps): JSX.Element {
  return (
    <div
      className="planting-tool-selector"
      role="toolbar"
      aria-label={t('bed.placement.tools_toolbar_label')}
    >
      {TOOLS.map((tool) => {
        const isActive = activeMode === tool.key;
        const name = `${tool.fullLabel} (${tool.shortcut})`;
        return (
          <button
            key={tool.key}
            type="button"
            className={`planting-tool-selector__button ${
              isActive ? 'is-active' : ''
            }`}
            aria-pressed={isActive}
            aria-label={name}
            title={name}
            disabled={disabled}
            onClick={() => onSelectMode(tool.key)}
          >
            <LayoutGlyph name={tool.glyph} />
            <span className="planting-tool-selector__label">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
