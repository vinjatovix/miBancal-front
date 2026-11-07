import { useEffect, useState, type JSX } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import BedCreateDrawer from '../../../components/beds/BedCreateDrawer/BedCreateDrawer';
import BedEditDrawer from '../../../components/beds/BedEditDrawer/BedEditDrawer';
import DeleteBedModal from '../../../components/beds/DeleteBedModal/DeleteBedModal';
import BedRotationControl from '../../../components/beds/layout/BedRotationControl';
import LayoutModeToggle from '../../../components/beds/layout/LayoutModeToggle';
import LayoutSaveBar from '../../../components/beds/layout/LayoutSaveBar';
import LayoutScaleBar from '../../../components/beds/layout/LayoutScaleBar';
import LayoutViewportControls from '../../../components/beds/layout/LayoutViewportControls';
import LocationLayoutCanvas from '../../../components/beds/layout/LocationLayoutCanvas';
import SnapToggle from '../../../components/beds/layout/SnapToggle';
import UnplacedBedsTray from '../../../components/beds/layout/UnplacedBedsTray';
import BedGridControls from '../../../components/beds/visualizer/BedGridControls';
import {
  DEFAULT_ACTIVE_GRID_LAYERS,
  type ActiveGridLayers,
  type BedGridLayerKey
} from '../../../components/beds/visualizer/utils/bedGridConfig';
import { useBedViewport } from '../../../components/beds/visualizer/hooks/useBedViewport';
import { t } from '../../../i18n/core/t';
import { useBedForEdit } from '../../beds/hooks/useBedForEdit';
import { useBedMutations } from '../../beds/hooks/useBedMutations';
import Button from '../../../shared/components/Button/Button';
import DeleteButton from '../../../shared/components/ActionButtons/DeleteButton';
import EditButton from '../../../shared/components/ActionButtons/EditButton';
import { CancelConfirmModal } from '../../../shared/components/Modal/CancelConfirmModal';
import { UnsavedChangesGuard } from '../../../shared/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { locationKeys } from '../../../shared/reactQuery/locationKeys';
import { useToast } from '../../../shared/toast/useToast';
import type { LocationLayoutResponse } from '../../../types/Location/LocationLayout';
import { useLayoutEditor } from './hooks/useLayoutEditor';

import './locationLayoutPage.css';

export interface LocationLayoutViewProps {
  readonly id: string;
  readonly etag: string;
  readonly layout: LocationLayoutResponse;
}

export default function LocationLayoutView({
  id,
  etag,
  layout
}: LocationLayoutViewProps): JSX.Element {
  const editor = useLayoutEditor(id, etag, layout);
  const viewport = useBedViewport();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();
  const { remove } = useBedMutations();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeGridLayers, setActiveGridLayers] = useState<ActiveGridLayers>(
    DEFAULT_ACTIVE_GRID_LAYERS
  );
  const [showBedNames, setShowBedNames] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);

  const isPosition = editor.mode === 'position';
  const selectedBed = editor.placedBeds.find(
    (bed) => bed.id === editor.selectedId
  );
  const selectedBedId = selectedBed?.id ?? null;

  const { bed: selectedBedDetail, etag: selectedBedEtag } = useBedForEdit(
    !isPosition ? selectedBedId : null
  );
  const canDeleteSelectedBed =
    selectedBedDetail !== undefined &&
    selectedBedDetail.plantInstances.length === 0;

  const bedParam = searchParams.get('bed');
  const { selectBed } = editor;

  useEffect(() => {
    if (bedParam) {
      selectBed(bedParam);
    }
  }, [bedParam, selectBed]);

  const handleToggleGridLayer = (key: BedGridLayerKey): void => {
    setActiveGridLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeselectBed = (): void => {
    editor.deselectBed();
    if (searchParams.has('bed')) {
      setSearchParams(
        (prev) => {
          prev.delete('bed');
          return prev;
        },
        { replace: true }
      );
    }
  };

  const handleBedCreated = (newBedId: string): void => {
    void queryClient.invalidateQueries({ queryKey: locationKeys.layout(id) });
    setIsCreateOpen(false);
    setSearchParams(
      (prev) => {
        prev.set('bed', newBedId);
        return prev;
      },
      { replace: true }
    );
  };

  const handleBedUpdated = (): void => {
    void queryClient.invalidateQueries({ queryKey: locationKeys.layout(id) });
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedBedId || !selectedBedEtag) return;
    const bedName = selectedBed?.name ?? '';
    try {
      await remove.mutateAsync({
        id: selectedBedId,
        etag: selectedBedEtag,
        locationId: id
      });
      showSuccessToast(t('bed.delete.success', { name: bedName }));
      setIsDeleteOpen(false);
      handleDeselectBed();
    } catch (error) {
      showErrorToast(error, t('bed.delete.error'));
    }
  };

  return (
    <main className="location-layout-page">
      <header className="location-layout-page__header">
        <div className="location-layout-page__heading">
          <h1 className="location-layout-page__title">
            {t('bed.layout.title', { name: layout.location.name })}
          </h1>
          <p className="location-layout-page__subtitle">
            {t('bed.layout.subtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          {t('bed.layout.new_bed')}
        </Button>
      </header>

      <div
        className="location-layout-page__toolbar"
        role="toolbar"
        aria-label={t('bed.layout.mode_group_label')}
      >
        <LayoutModeToggle active={isPosition} onToggle={editor.toggleMode} />
        <span
          className="location-layout-page__toolbar-divider"
          aria-hidden="true"
        />
        {isPosition ? (
          <>
            <div className="location-layout-page__toolbar-group">
              <SnapToggle
                enabled={editor.gridSnapEnabled}
                onToggle={editor.toggleGridSnap}
                label={t('bed.layout.grid_snap_label')}
              />
              <SnapToggle
                enabled={editor.neighborSnapEnabled}
                onToggle={editor.toggleNeighborSnap}
                label={t('bed.layout.neighbor_snap_label')}
              />
              <BedRotationControl
                value={editor.selectedRotation}
                onChange={editor.setSelectedRotation}
                disabled={!editor.selectedId}
              />
              {selectedBed && (
                <Button variant="neutral" onClick={editor.unplaceSelected}>
                  {t('bed.layout.unplace_action', { name: selectedBed.name })}
                </Button>
              )}
            </div>
            <div className="location-layout-page__toolbar-spacer" />
            <LayoutSaveBar
              dirty={editor.dirty}
              saving={editor.saving}
              onSave={editor.save}
              onDiscard={editor.discard}
            />
          </>
        ) : (
          <>
            <BedGridControls
              activeLayers={activeGridLayers}
              onToggleLayer={handleToggleGridLayer}
            />
            <div className="location-layout-page__toolbar-group">
              <SnapToggle
                enabled={showBedNames}
                onToggle={() => setShowBedNames((prev) => !prev)}
                label={t('bed.layout.show_names_label')}
              />
              <SnapToggle
                enabled={showDimensions}
                onToggle={() => setShowDimensions((prev) => !prev)}
                label={t('bed.layout.show_dimensions_label')}
              />
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
                    onClick={() => setIsEditOpen(true)}
                  />
                  {canDeleteSelectedBed && (
                    <DeleteButton
                      ariaLabel={t('bed.layout.delete_bed', {
                        name: selectedBed.name
                      })}
                      isDeleting={remove.isPending}
                      onClick={() => setIsDeleteOpen(true)}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="location-layout-page__workspace">
        <div className="location-layout-page__canvas">
          <LocationLayoutCanvas
            beds={editor.placedBeds}
            viewBox={editor.viewBox}
            label={t('bed.layout.canvas_label', {
              name: layout.location.name
            })}
            mode={editor.mode}
            selectedId={editor.selectedId}
            viewport={viewport}
            gridLayers={isPosition ? null : activeGridLayers}
            showNames={showBedNames}
            showDimensions={showDimensions}
            floorWidth={layout.location.width}
            floorHeight={layout.location.height}
            onSelectBed={editor.selectBed}
            onDeselect={handleDeselectBed}
            onBedMove={editor.moveBed}
            onBedRotate={editor.rotateBedBy}
          />
          <LayoutScaleBar viewBox={editor.viewBox} zoom={viewport.zoom} />
          <div className="location-layout-page__viewport">
            <LayoutViewportControls viewport={viewport} />
          </div>
        </div>
        {editor.unplacedBeds.length > 0 && (
          <UnplacedBedsTray
            beds={editor.unplacedBeds}
            mode={editor.mode}
            onPlace={editor.placeBed}
          />
        )}
      </div>

      <BedCreateDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleBedCreated}
        initialLocationId={id}
      />

      <BedEditDrawer
        isOpen={isEditOpen}
        bedId={selectedBedId}
        onClose={() => setIsEditOpen(false)}
        onSaved={handleBedUpdated}
      />

      <DeleteBedModal
        isOpen={isDeleteOpen}
        bedName={selectedBed?.name ?? ''}
        isDeleting={remove.isPending}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />

      <CancelConfirmModal
        isOpen={editor.discardOpen}
        onConfirm={editor.confirmDiscard}
        onCancel={editor.cancelDiscard}
        title={t('bed.layout.discard_title')}
        prompt={t('bed.layout.discard_message')}
        confirmText={t('bed.layout.discard_confirm')}
        cancelText={t('bed.layout.discard_cancel')}
      />
      <UnsavedChangesGuard
        when={editor.dirty}
        prompt={t('bed.layout.discard_message')}
      />
    </main>
  );
}
