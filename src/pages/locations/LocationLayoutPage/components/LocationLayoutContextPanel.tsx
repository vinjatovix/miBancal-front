import { useState, type JSX } from 'react';

import UnplacedBedsTray from '../../../../components/beds/layout/UnplacedBedsTray';
import PlantPlacementPalette from '../../../../components/beds/visualizer/PlantPlacementPalette';
import Button from '../../../../shared/components/Button/Button';
import Icon from '../../../../shared/components/Icon/Icon';
import { t } from '../../../../i18n/core/t';
import useMediaQuery from '../../../../shared/hooks/useMediaQuery';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import type { LayoutEditor } from '../hooks/useLayoutEditor';
import type { useLayoutPlantPlacement } from '../hooks/useLayoutPlantPlacement';
import LayoutContextPanel, {
  type ContextPanelVariant
} from './LayoutContextPanel';

export interface LocationLayoutContextPanelProps {
  readonly mode: LayoutEditor['mode'];
  readonly isPlanting: boolean;
  readonly isPosition: boolean;
  readonly selectedBed?: ResolvedBed;
  readonly editor: LayoutEditor;
  readonly placement: ReturnType<typeof useLayoutPlantPlacement>;
  readonly isMobile?: boolean;
}

export default function LocationLayoutContextPanel({
  mode,
  isPlanting,
  isPosition,
  selectedBed,
  editor,
  placement,
  isMobile = false
}: LocationLayoutContextPanelProps): JSX.Element {
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isMobileSheet = isMobile && !isLandscape;
  const [catalogDismissed, setCatalogDismissed] = useState(false);

  let panelVariant: ContextPanelVariant = 'none';
  let panelContent: JSX.Element | null = null;

  if (isPlanting) {
    panelVariant = 'palette';
    panelContent = (
      <PlantPlacementPalette
        isOpen
        onClose={() => setCatalogDismissed(true)}
        onSelectPlant={(plant) => {
          placement.selectPalettePlant(plant);
          if (isMobile) {
            setCatalogDismissed(true);
          }
        }}
        onDragPlant={placement.dragPalettePlant}
        activePlacingPlantId={placement.activePlantId}
        activePlacingPlantName={placement.activePlantName}
        onCancelPlacing={placement.cancelPalettePlant}
      />
    );
  } else if (editor.unplacedBeds.length > 0) {
    panelVariant = 'tray';
    panelContent = (
      <UnplacedBedsTray
        beds={editor.unplacedBeds}
        mode={editor.mode}
        onPlace={editor.placeBed}
      />
    );
  }

  const suppressOnMobile = isMobile && panelVariant === 'tray';
  const catalogCollapsed = isMobile && isPlanting && catalogDismissed;
  const panelOpen =
    panelVariant !== 'none' && !suppressOnMobile && !catalogCollapsed;

  return (
    <>
      <LayoutContextPanel
        mode={mode}
        open={panelOpen}
        variant={panelVariant}
        isMobileSheet={isMobileSheet}
        onRequestClose={() => {
          if (isPlanting) {
            if (isMobile) {
              setCatalogDismissed(true);
              return;
            }
            placement.cancelPalettePlant();
          } else if (isPosition && selectedBed) editor.deselectBed();
        }}
      >
        {panelContent}
      </LayoutContextPanel>
      {catalogCollapsed && (
        <div className="layout-catalog-reopen">
          {placement.activePlantId && (
            <span className="layout-catalog-reopen__active">
              <span className="layout-catalog-reopen__active-name">
                {t('bed.placement.placing_active_short', {
                  name: placement.activePlantName ?? ''
                })}
              </span>
              <button
                type="button"
                className="layout-catalog-reopen__cancel"
                onClick={placement.cancelPalettePlant}
                aria-label={t('bed.placement.placing_cancel')}
              >
                <Icon name="close" decorative />
              </button>
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            icon="seedling"
            aria-label={t('bed.placement.palette_title')}
            onClick={() => setCatalogDismissed(false)}
          />
        </div>
      )}
    </>
  );
}
