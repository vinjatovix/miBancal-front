import { useCallback, useEffect, useState, type JSX } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import BedCompassHud from '../../../components/beds/layout/BedCompassHud';
import LayoutScaleBar from '../../../components/beds/layout/LayoutScaleBar';
import LayoutViewportControls from '../../../components/beds/layout/LayoutViewportControls';
import LocationLayoutCanvas from '../../../components/beds/layout/LocationLayoutCanvas';
import UnplacedBedsTray from '../../../components/beds/layout/UnplacedBedsTray';
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
import { locationKeys } from '../../../shared/reactQuery/locationKeys';
import { useToast } from '../../../shared/toast/useToast';
import type { LocationLayoutResponse } from '../../../types/Location/LocationLayout';
import {
  calculateNetAzimuth,
  normalizeAngle
} from '../../../components/beds/layout/utils/cardinalGeometry';
import LocationLayoutDialogs from './components/LocationLayoutDialogs';
import LocationLayoutToolbar from './components/LocationLayoutToolbar';
import { useLayoutEditor } from './hooks/useLayoutEditor';
import { useNorthAngleMutation } from './hooks/useNorthAngleMutation';

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
  const northAngleMutation = useNorthAngleMutation({ locationId: id, etag });
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
  const [showCardinalOrientation, setShowCardinalOrientation] = useState(true);
  const [calibratedNorth, setCalibratedNorth] = useState<number | null>(null);

  const isPosition = editor.mode === 'position';
  const selectedBed = editor.placedBeds.find(
    (bed) => bed.id === editor.selectedId
  );
  const selectedBedId = selectedBed?.id ?? null;
  const effectiveNorthAngle = calibratedNorth ?? layout.location.northAngle;
  const bedAzimuth = selectedBed
    ? calculateNetAzimuth(effectiveNorthAngle, editor.selectedRotation)
    : null;

  const { setSelectedRotation } = editor;
  const handleBedRotationChange = useCallback(
    (newAzimuth: number): void => {
      const rotation = normalizeAngle(newAzimuth - (effectiveNorthAngle ?? 0));
      setSelectedRotation(rotation);
    },
    [setSelectedRotation, effectiveNorthAngle]
  );

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

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedBedId || !selectedBedEtag) return;
    try {
      await remove.mutateAsync({
        id: selectedBedId,
        etag: selectedBedEtag,
        locationId: id
      });
      showSuccessToast(
        t('bed.delete.success', { name: selectedBed?.name ?? '' })
      );
      setIsDeleteOpen(false);
      handleDeselectBed();
    } catch (error) {
      showErrorToast(error, t('bed.delete.error'));
    }
  };

  const handleSaveNorth = (): void => {
    if (effectiveNorthAngle === null) return;
    northAngleMutation.mutate(effectiveNorthAngle, {
      onSuccess: () => setCalibratedNorth(null)
    });
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

      <LocationLayoutToolbar
        isPosition={isPosition}
        onToggleMode={editor.toggleMode}
        gridSnapEnabled={editor.gridSnapEnabled}
        onToggleGridSnap={editor.toggleGridSnap}
        neighborSnapEnabled={editor.neighborSnapEnabled}
        onToggleNeighborSnap={editor.toggleNeighborSnap}
        selectedRotation={editor.selectedRotation}
        onRotationChange={editor.setSelectedRotation}
        selectedBed={selectedBed}
        onUnplaceSelected={editor.unplaceSelected}
        dirty={editor.dirty}
        saving={editor.saving}
        onSave={editor.save}
        onDiscard={editor.discard}
        activeGridLayers={activeGridLayers}
        onToggleGridLayer={handleToggleGridLayer}
        showBedNames={showBedNames}
        onToggleShowNames={() => setShowBedNames((prev) => !prev)}
        showDimensions={showDimensions}
        onToggleShowDimensions={() => setShowDimensions((prev) => !prev)}
        showCardinalOrientation={showCardinalOrientation}
        onToggleShowCardinalOrientation={() =>
          setShowCardinalOrientation((prev) => !prev)
        }
        onOpenEdit={() => setIsEditOpen(true)}
        canDeleteSelectedBed={canDeleteSelectedBed}
        isDeletingBed={remove.isPending}
        onOpenDelete={() => setIsDeleteOpen(true)}
      />

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
            northAngle={effectiveNorthAngle}
            showCardinalOrientation={showCardinalOrientation}
            floorWidth={layout.location.width}
            floorHeight={layout.location.height}
            onSelectBed={editor.selectBed}
            onDeselect={handleDeselectBed}
            onBedMove={editor.moveBed}
            onBedRotate={editor.rotateBedBy}
          />
          <LayoutScaleBar viewBox={editor.viewBox} zoom={viewport.zoom} />
          <div className="location-layout-page__hud">
            <LayoutViewportControls viewport={viewport} />
            <BedCompassHud
              northAngle={effectiveNorthAngle}
              bedAzimuth={bedAzimuth}
              mode={editor.mode}
              onBedRotationChange={handleBedRotationChange}
              onNorthAngleChange={setCalibratedNorth}
              onSaveNorthAngle={handleSaveNorth}
              isSavingNorth={northAngleMutation.isPending}
            />
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

      <LocationLayoutDialogs
        locationId={id}
        selectedBedId={selectedBedId}
        selectedBedName={selectedBed?.name ?? ''}
        isCreateOpen={isCreateOpen}
        isEditOpen={isEditOpen}
        isDeleteOpen={isDeleteOpen}
        isDeleting={remove.isPending}
        discardOpen={editor.discardOpen}
        dirty={editor.dirty}
        onCloseCreate={() => setIsCreateOpen(false)}
        onCloseEdit={() => setIsEditOpen(false)}
        onCloseDelete={() => setIsDeleteOpen(false)}
        onCreated={handleBedCreated}
        onUpdated={() =>
          void queryClient.invalidateQueries({
            queryKey: locationKeys.layout(id)
          })
        }
        onConfirmDelete={() => void handleConfirmDelete()}
        onConfirmDiscard={editor.confirmDiscard}
        onCancelDiscard={editor.cancelDiscard}
      />
    </main>
  );
}
