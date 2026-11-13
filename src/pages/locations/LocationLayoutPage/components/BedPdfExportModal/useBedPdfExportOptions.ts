import { useCallback, useMemo, useState } from 'react';

import type { ResolvedBed } from '../../../../../components/beds/layout/utils/layoutTypes';
import {
  BED_GRID_LAYERS,
  type ActiveGridLayers
} from '../../../../../components/beds/visualizer/utils/bedGridConfig';
import type {
  BedPdfExportOptions,
  PdfGridLayer
} from '../../../../../types/Export/BedPdfExport';

export type BedPdfExportFlag = Exclude<
  keyof BedPdfExportOptions,
  'selectedBedIds' | 'gridLayers'
>;

export function resolvePdfGridLayers(
  activeLayers: ActiveGridLayers
): readonly PdfGridLayer[] {
  return BED_GRID_LAYERS.filter((layer) => activeLayers[layer.key]).map(
    (layer) => ({ key: layer.key, stepCm: layer.step })
  );
}

export interface UseBedPdfExportOptionsResult {
  readonly options: BedPdfExportOptions;
  readonly canDownload: boolean;
  toggleFlag(flag: BedPdfExportFlag): void;
  toggleBed(bedId: string): void;
  selectAllBeds(): void;
  deselectAllBeds(): void;
}

function buildDefaults(
  placedBeds: readonly ResolvedBed[],
  activeGridLayers: ActiveGridLayers
): BedPdfExportOptions {
  const gridLayers = resolvePdfGridLayers(activeGridLayers);
  return {
    includeLocationLayout: true,
    includeBedSheets: true,
    includePlantList: true,
    showDimensions: true,
    showGrid: gridLayers.length > 0,
    showCompass: true,
    gridLayers,
    selectedBedIds: placedBeds.map((bed) => bed.id)
  };
}

function isDownloadEnabled(
  options: BedPdfExportOptions,
  placedBedsCount: number
): boolean {
  if (placedBedsCount === 0) return false;
  if (options.includeLocationLayout) return true;
  const hasBedContent = options.includeBedSheets || options.includePlantList;
  return options.selectedBedIds.length > 0 && hasBedContent;
}

export function useBedPdfExportOptions(
  placedBeds: readonly ResolvedBed[],
  isOpen: boolean,
  activeGridLayers: ActiveGridLayers
): UseBedPdfExportOptionsResult {
  const [options, setOptions] = useState<BedPdfExportOptions>(() =>
    buildDefaults(placedBeds, activeGridLayers)
  );
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setOptions(buildDefaults(placedBeds, activeGridLayers));
    }
  }

  const toggleFlag = useCallback((flag: BedPdfExportFlag) => {
    setOptions((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const toggleBed = useCallback((bedId: string) => {
    setOptions((prev) => {
      const selected = new Set(prev.selectedBedIds);
      if (selected.has(bedId)) {
        selected.delete(bedId);
      } else {
        selected.add(bedId);
      }
      return { ...prev, selectedBedIds: [...selected] };
    });
  }, []);

  const selectAllBeds = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      selectedBedIds: placedBeds.map((bed) => bed.id)
    }));
  }, [placedBeds]);

  const deselectAllBeds = useCallback(() => {
    setOptions((prev) => ({ ...prev, selectedBedIds: [] }));
  }, []);

  const canDownload = useMemo(
    () => isDownloadEnabled(options, placedBeds.length),
    [options, placedBeds.length]
  );

  return {
    options,
    canDownload,
    toggleFlag,
    toggleBed,
    selectAllBeds,
    deselectAllBeds
  };
}
