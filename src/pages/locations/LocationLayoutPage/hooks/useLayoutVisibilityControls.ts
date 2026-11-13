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

  const handleToggleGrids = useCallback((): void => {
    setActiveGridLayers((prev) => {
      const anyActive = Object.values(prev).some(Boolean);
      if (anyActive) {
        return {
          sfg: false,
          intermediate: false,
          decimeters: false,
          fine: false
        };
      }
      return DEFAULT_ACTIVE_GRID_LAYERS;
    });
  }, []);

  const handleSaveNorth = (): void => {
    if (effectiveNorthAngle === null) return;
    northAngleMutation.mutate(effectiveNorthAngle, {
      onSuccess: () => setCalibratedNorth(null)
    });
  };

  const showGrids = Object.values(activeGridLayers).some(Boolean);

  return {
    activeGridLayers,
    showGrids,
    showBedNames,
    showDimensions,
    showCardinalOrientation,
    showPlants,
    effectiveNorthAngle,
    bedAzimuth,
    isSavingNorth: northAngleMutation.isPending,
    handleToggleGridLayer,
    handleToggleGrids,
    handleToggleShowNames: () => setShowBedNames((prev) => !prev),
    handleToggleShowDimensions: () => setShowDimensions((prev) => !prev),
    handleToggleShowCardinalOrientation: () =>
      setShowCardinalOrientation((prev) => !prev),
    handleToggleShowPlants: () => setShowPlants((prev) => !prev),
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
