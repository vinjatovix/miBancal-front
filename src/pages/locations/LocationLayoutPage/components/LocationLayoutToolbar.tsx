import type { JSX } from 'react';

import BedRotationControl from '../../../../components/beds/layout/BedRotationControl';
import LayoutModeToggle from '../../../../components/beds/layout/LayoutModeToggle';
import LayoutSaveBar from '../../../../components/beds/layout/LayoutSaveBar';
import SnapToggle from '../../../../components/beds/layout/SnapToggle';
import BedGridControls from '../../../../components/beds/visualizer/BedGridControls';
import type {
  ActiveGridLayers,
  BedGridLayerKey
} from '../../../../components/beds/visualizer/utils/bedGridConfig';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import { t } from '../../../../i18n/core/t';
import Button from '../../../../shared/components/Button/Button';
import DeleteButton from '../../../../shared/components/ActionButtons/DeleteButton';
import EditButton from '../../../../shared/components/ActionButtons/EditButton';

export interface LocationLayoutToolbarProps {
  readonly isPosition: boolean;
  readonly onToggleMode: () => void;
  readonly gridSnapEnabled: boolean;
  readonly onToggleGridSnap: () => void;
  readonly neighborSnapEnabled: boolean;
  readonly onToggleNeighborSnap: () => void;
  readonly selectedRotation: number;
  readonly onRotationChange: (rotation: number) => void;
  readonly selectedBed?: ResolvedBed;
  readonly onUnplaceSelected: () => void;
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly onSave: () => void;
  readonly onDiscard: () => void;
  readonly activeGridLayers: ActiveGridLayers;
  readonly onToggleGridLayer: (key: BedGridLayerKey) => void;
  readonly showBedNames: boolean;
  readonly onToggleShowNames: () => void;
  readonly showDimensions: boolean;
  readonly onToggleShowDimensions: () => void;
  readonly showCardinalOrientation: boolean;
  readonly onToggleShowCardinalOrientation: () => void;
  readonly onOpenEdit: () => void;
  readonly canDeleteSelectedBed: boolean;
  readonly isDeletingBed: boolean;
  readonly onOpenDelete: () => void;
}

export default function LocationLayoutToolbar({
  isPosition,
  onToggleMode,
  gridSnapEnabled,
  onToggleGridSnap,
  neighborSnapEnabled,
  onToggleNeighborSnap,
  selectedRotation,
  onRotationChange,
  selectedBed,
  onUnplaceSelected,
  dirty,
  saving,
  onSave,
  onDiscard,
  activeGridLayers,
  onToggleGridLayer,
  showBedNames,
  onToggleShowNames,
  showDimensions,
  onToggleShowDimensions,
  showCardinalOrientation,
  onToggleShowCardinalOrientation,
  onOpenEdit,
  canDeleteSelectedBed,
  isDeletingBed,
  onOpenDelete
}: LocationLayoutToolbarProps): JSX.Element {
  return (
    <div
      className="location-layout-page__toolbar"
      role="toolbar"
      aria-label={t('bed.layout.mode_group_label')}
    >
      <LayoutModeToggle active={isPosition} onToggle={onToggleMode} />
      <span
        className="location-layout-page__toolbar-divider"
        aria-hidden="true"
      />
      {isPosition ? (
        <>
          <div className="location-layout-page__toolbar-group">
            <SnapToggle
              enabled={gridSnapEnabled}
              onToggle={onToggleGridSnap}
              label={t('bed.layout.grid_snap_label')}
            />
            <SnapToggle
              enabled={neighborSnapEnabled}
              onToggle={onToggleNeighborSnap}
              label={t('bed.layout.neighbor_snap_label')}
            />
            <BedRotationControl
              value={selectedRotation}
              onChange={onRotationChange}
              disabled={!selectedBed}
            />
            {selectedBed && (
              <Button variant="neutral" onClick={onUnplaceSelected}>
                {t('bed.layout.unplace_action', { name: selectedBed.name })}
              </Button>
            )}
          </div>
          <div className="location-layout-page__toolbar-spacer" />
          <LayoutSaveBar
            dirty={dirty}
            saving={saving}
            onSave={onSave}
            onDiscard={onDiscard}
          />
        </>
      ) : (
        <>
          <BedGridControls
            activeLayers={activeGridLayers}
            onToggleLayer={onToggleGridLayer}
          />
          <div className="location-layout-page__toolbar-group">
            <SnapToggle
              enabled={showBedNames}
              onToggle={onToggleShowNames}
              label={t('bed.layout.show_names_label')}
            />
            <SnapToggle
              enabled={showDimensions}
              onToggle={onToggleShowDimensions}
              label={t('bed.layout.show_dimensions_label')}
            />
            <Button
              variant={showCardinalOrientation ? 'secondary' : 'neutral'}
              icon="explore"
              aria-pressed={showCardinalOrientation}
              onClick={onToggleShowCardinalOrientation}
            >
              {t('bed.layout.show_cardinal_label')}
            </Button>
          </div>
          {selectedBed && (
            <>
              <div className="location-layout-page__toolbar-spacer" />
              <div className="location-layout-page__bed-actions">
                <Button variant="secondary">
                  {t('bed.layout.manage_plants', { name: selectedBed.name })}
                </Button>
                <EditButton
                  ariaLabel={t('bed.layout.edit_bed', {
                    name: selectedBed.name
                  })}
                  onClick={onOpenEdit}
                />
                {canDeleteSelectedBed && (
                  <DeleteButton
                    ariaLabel={t('bed.layout.delete_bed', {
                      name: selectedBed.name
                    })}
                    isDeleting={isDeletingBed}
                    onClick={onOpenDelete}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
