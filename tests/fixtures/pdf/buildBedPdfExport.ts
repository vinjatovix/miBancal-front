import type { ResolvedBed } from '../../../src/components/beds/layout/utils/layoutTypes';
import type { ExportLocationPdfParams } from '../../../src/services/pdf/bedPdfExport.service';
import type { BedPdfExportOptions } from '../../../src/types/Export/BedPdfExport';
import type { LocationLayoutResponse } from '../../../src/types/Location/LocationLayout';

export function buildBedPdfExportOptions(
  overrides: Partial<BedPdfExportOptions> = {}
): BedPdfExportOptions {
  return {
    includeLocationLayout: true,
    includeBedSheets: true,
    includePlantList: true,
    showDimensions: true,
    showGrid: true,
    showCompass: true,
    gridLayers: [{ key: 'sfg', stepCm: 30 }],
    selectedBedIds: ['bed-1'],
    ...overrides
  };
}

export function buildResolvedBed(
  overrides: Partial<ResolvedBed> = {}
): ResolvedBed {
  return {
    id: 'bed-1',
    name: 'Bancal Sur',
    width: 400,
    height: 200,
    position: { x: 0, y: 0 },
    rotation: 0,
    ...overrides
  };
}

export function buildPdfLocationLayout(): LocationLayoutResponse {
  return {
    location: {
      id: 'loc-1',
      name: 'Huerto Norte',
      northAngle: 0,
      width: 1000,
      height: 800
    },
    placedBeds: [],
    unplacedBeds: [],
    companionGraph: []
  };
}

export function buildExportLocationPdfParams(
  overrides: Partial<ExportLocationPdfParams> = {}
): ExportLocationPdfParams {
  return {
    layout: buildPdfLocationLayout(),
    placedBeds: [buildResolvedBed()],
    cropsByBed: new Map(),
    options: buildBedPdfExportOptions(),
    effectiveNorthAngle: 0,
    ...overrides
  };
}
