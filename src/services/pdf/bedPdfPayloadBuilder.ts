import type { ResolvedBed } from '../../components/beds/layout/utils/layoutTypes';
import {
  aabbOf,
  rotatedRectVertices
} from '../../components/beds/layout/utils/layoutGeometry';
import { calculateNetAzimuth } from '../../components/beds/layout/utils/cardinalGeometry';
import type { LocationLayoutResponse } from '../../types/Location/LocationLayout';
import type { CropPlacementItem } from '../../types/PlantInstance/plantPlacementTypes';
import type {
  BedPdfExportOptions,
  BedPdfSheetData,
  LocationOverviewBedItem,
  LocationOverviewBounds,
  LocationOverviewPdfData,
  PdfDocumentPayload
} from '../../types/Export/BedPdfExport';
import { consolidateBedSpecies } from './bedPdfSpeciesConsolidator';
import { formatPdfFilename } from './bedPdfFilename';
import { resolveOrientation } from './utils/pdfGeometry';

export interface ExportLocationPdfParams {
  readonly layout: LocationLayoutResponse;
  readonly placedBeds: readonly ResolvedBed[];
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly options: BedPdfExportOptions;
  readonly effectiveNorthAngle: number | null;
}

function unionBounds(beds: readonly ResolvedBed[]): LocationOverviewBounds {
  return aabbOf(beds.flatMap((bed) => rotatedRectVertices(bed)));
}

function toOverviewBed(bed: ResolvedBed): LocationOverviewBedItem {
  return {
    id: bed.id,
    name: bed.name,
    widthCm: bed.width,
    heightCm: bed.height,
    position: bed.position,
    rotation: bed.rotation
  };
}

function buildOverview(
  layout: LocationLayoutResponse,
  placedBeds: readonly ResolvedBed[],
  effectiveNorthAngle: number | null
): LocationOverviewPdfData | null {
  if (placedBeds.length === 0) return null;
  const bounds = unionBounds(placedBeds);
  return {
    locationId: layout.location.id,
    locationName: layout.location.name,
    beds: placedBeds.map(toOverviewBed),
    northAngle: effectiveNorthAngle,
    orientation: resolveOrientation(
      bounds.maxX - bounds.minX,
      bounds.maxY - bounds.minY
    ),
    bounds
  };
}

function resolveBedNorthAngle(
  effectiveNorthAngle: number | null,
  rotation: number
): number | null {
  if (effectiveNorthAngle === null) return null;
  return effectiveNorthAngle - rotation;
}

function resolveBedAzimuth(
  effectiveNorthAngle: number | null,
  rotation: number
): number | null {
  if (effectiveNorthAngle === null) return null;
  return calculateNetAzimuth(effectiveNorthAngle, rotation);
}

function buildBedSheet(
  bed: ResolvedBed,
  layout: LocationLayoutResponse,
  cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>,
  effectiveNorthAngle: number | null
): BedPdfSheetData {
  const crops = cropsByBed.get(bed.id) ?? [];
  const { summary, markers } = consolidateBedSpecies(crops);
  return {
    bedId: bed.id,
    bedName: bed.name,
    locationName: layout.location.name,
    widthCm: bed.width,
    heightCm: bed.height,
    northAngle: resolveBedNorthAngle(effectiveNorthAngle, bed.rotation),
    bedAzimuth: resolveBedAzimuth(effectiveNorthAngle, bed.rotation),
    orientation: resolveOrientation(bed.width, bed.height),
    markers,
    speciesSummary: summary,
    isEmpty: crops.length === 0
  };
}

function buildBedSheets(
  params: ExportLocationPdfParams
): readonly BedPdfSheetData[] {
  const { options, placedBeds, layout, cropsByBed, effectiveNorthAngle } =
    params;
  const wantsSheets = options.includeBedSheets || options.includePlantList;
  if (!wantsSheets) return [];
  const selected = new Set(options.selectedBedIds);
  return placedBeds
    .filter((bed) => selected.has(bed.id))
    .map((bed) => buildBedSheet(bed, layout, cropsByBed, effectiveNorthAngle));
}

export function buildPdfPayload(
  params: ExportLocationPdfParams,
  generationDate: Date = new Date()
): PdfDocumentPayload {
  const { layout, placedBeds, options, effectiveNorthAngle } = params;
  return {
    filename: formatPdfFilename(layout.location.name, generationDate),
    generationDate,
    locationName: layout.location.name,
    options,
    locationOverview: options.includeLocationLayout
      ? buildOverview(layout, placedBeds, effectiveNorthAngle)
      : null,
    bedSheets: buildBedSheets(params)
  };
}
