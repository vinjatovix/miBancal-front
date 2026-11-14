import type { JSX } from 'react';

import { t } from '../../../../i18n/core/t';
import type { LayoutMode } from '../../../../components/beds/layout/utils/layoutTypes';
import type { PlantingToolMode } from '../../../../types/PlantInstance/brushSelectionTypes';

import './layoutGestureHints.css';

export interface LayoutGestureHintsProps {
  readonly mode: LayoutMode;
  readonly toolMode: PlantingToolMode;
  readonly onOpenHelp: () => void;
}

type HintKey =
  | 'location.layout.touch.hint_read'
  | 'location.layout.touch.hint_position'
  | 'location.layout.touch.hint_plant_select'
  | 'location.layout.touch.hint_plant_brush'
  | 'location.layout.touch.hint_plant_single';

function hintKey(mode: LayoutMode, toolMode: PlantingToolMode): HintKey {
  if (mode === 'read') return 'location.layout.touch.hint_read';
  if (mode === 'position') return 'location.layout.touch.hint_position';
  if (toolMode === 'select') return 'location.layout.touch.hint_plant_select';
  if (toolMode === 'brush') return 'location.layout.touch.hint_plant_brush';
  return 'location.layout.touch.hint_plant_single';
}

export default function LayoutGestureHints({
  mode,
  toolMode,
  onOpenHelp
}: LayoutGestureHintsProps): JSX.Element {
  return (
    <div className="layout-gesture-hints">
      <output className="layout-gesture-hints__text">
        {t(hintKey(mode, toolMode))}
      </output>
      <button
        type="button"
        className="layout-gesture-hints__help"
        onClick={onOpenHelp}
        aria-label={t('location.layout.touch.help_button')}
      >
        ?
      </button>
    </div>
  );
}
