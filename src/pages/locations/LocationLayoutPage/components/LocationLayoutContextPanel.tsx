import type { JSX } from 'react';

import BedPropertiesPanel from '../../../../components/beds/layout/BedPropertiesPanel';
import UnplacedBedsTray from '../../../../components/beds/layout/UnplacedBedsTray';
import PlantPlacementPalette from '../../../../components/beds/visualizer/PlantPlacementPalette';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import type { LayoutEditor } from '../hooks/useLayoutEditor';
import type { useLayoutPlantPlacement } from '../hooks/useLayoutPlantPlacement';
import type { useLocationBedActions } from '../hooks/useLocationBedActions';
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
  readonly bedActions: ReturnType<typeof useLocationBedActions>;
}

export default function LocationLayoutContextPanel({
  mode,
  isPlanting,
  isPosition,
  selectedBed,
  editor,
  placement,
  bedActions
}: LocationLayoutContextPanelProps): JSX.Element {
  let panelVariant: ContextPanelVariant = 'none';
  let panelContent: JSX.Element | null = null;

  if (isPlanting) {
    panelVariant = 'palette';
    panelContent = (
      <PlantPlacementPalette
        isOpen
        onSelectPlant={placement.selectPalettePlant}
        onDragPlant={placement.dragPalettePlant}
        activePlacingPlantId={placement.activePlantId}
        activePlacingPlantName={placement.activePlantName}
        onCancelPlacing={placement.cancelPalettePlant}
      />
    );
  } else if (isPosition && selectedBed) {
    panelVariant = 'properties';
    panelContent = (
      <BedPropertiesPanel
        bed={selectedBed}
        onRenameInline={(newName) =>
          editor.renameBedInline(selectedBed.id, newName)
        }
        onOpenFullEdit={() => bedActions.setIsEditOpen(true)}
        onRotationChange={editor.setSelectedRotation}
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

  const panelOpen = panelVariant !== 'none';

  return (
    <LayoutContextPanel
      mode={mode}
      open={panelOpen}
      variant={panelVariant}
      onRequestClose={() => {
        if (isPlanting) placement.cancelPalettePlant();
        else if (isPosition && selectedBed) editor.deselectBed();
      }}
    >
      {panelContent}
    </LayoutContextPanel>
  );
}
