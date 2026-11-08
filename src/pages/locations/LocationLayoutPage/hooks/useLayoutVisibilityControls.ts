import { useCallback, useState } from 'react';

import {
  DEFAULT_ACTIVE_GRID_LAYERS,
  type ActiveGridLayers,
  type BedGridLayerKey
} from '../../../../components/beds/visualizer/utils/bedGridConfig';
import {
  calculateNetAzimuth,
  normalizeAngle
} from '../../../../components/beds/layout/utils/cardinalGeometry';
import { useNorthAngleMutation } from './useNorthAngleMutation';

export interface UseLayoutVisibilityControlsParams {
  readonly locationId: string;
  readonly etag: string;
  readonly locationNorthAngle: number | null;
  readonly selectedRotation: number;
  readonly hasSelectedBed: boolean;
  readonly onRotationChange: (rotation: number) => void;
}

export function useLayoutVisibilityControls({
  locationId,
  etag,
  locationNorthAngle,
  selectedRotation,
  hasSelectedBed,
  onRotationChange
}: UseLayoutVisibilityControlsParams) {
  const northAngleMutation = useNorthAngleMutation({ locationId, etag });
  const [activeGridLayers, setActiveGridLayers] = useState<ActiveGridLayers>(
    DEFAULT_ACTIVE_GRID_LAYERS
  );
  const [showBedNames, setShowBedNames] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showCardinalOrientation, setShowCardinalOrientation] = useState(true);
  const [showPlants, setShowPlants] = useState(true);
  const [calibratedNorth, setCalibratedNorth] = useState<number | null>(null);

  const effectiveNorthAngle = calibratedNorth ?? locationNorthAngle;
  const bedAzimuth = hasSelectedBed
    ? calculateNetAzimuth(effectiveNorthAngle, selectedRotation)
    : null;

  const handleBedRotationChange = useCallback(
    (newAzimuth: number): void => {
      const rotation = normalizeAngle(newAzimuth - (effectiveNorthAngle ?? 0));
      onRotationChange(rotation);
    },
    [onRotationChange, effectiveNorthAngle]
  );

  const handleToggleGridLayer = (key: BedGridLayerKey): void => {
    setActiveGridLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNorth = (): void => {
    if (effectiveNorthAngle === null) return;
    northAngleMutation.mutate(effectiveNorthAngle, {
      onSuccess: () => setCalibratedNorth(null)
    });
  };

  return {
    activeGridLayers,
    showBedNames,
    showDimensions,
    showCardinalOrientation,
    showPlants,
    effectiveNorthAngle,
    bedAzimuth,
    isSavingNorth: northAngleMutation.isPending,
    handleToggleGridLayer,
    handleBedRotationChange,
    setCalibratedNorth,
    handleSaveNorth,
    toolbarProps: {
      activeGridLayers,
      onToggleGridLayer: handleToggleGridLayer,
      showBedNames,
      onToggleShowNames: () => setShowBedNames((prev) => !prev),
      showDimensions,
      onToggleShowDimensions: () => setShowDimensions((prev) => !prev),
      showCardinalOrientation,
      onToggleShowCardinalOrientation: () =>
        setShowCardinalOrientation((prev) => !prev),
      showPlants,
      onToggleShowPlants: () => setShowPlants((prev) => !prev)
    }
  };
}
