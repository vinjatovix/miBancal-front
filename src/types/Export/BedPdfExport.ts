export interface PdfGridLayer {
  readonly key: string;
  readonly stepCm: number;
}

export interface BedPdfExportOptions {
  readonly includeLocationLayout: boolean;
  readonly includeBedSheets: boolean;
  readonly includePlantList: boolean;
  readonly showDimensions: boolean;
  readonly showGrid: boolean;
  readonly showCompass: boolean;
  readonly gridLayers: readonly PdfGridLayer[];
  readonly selectedBedIds: readonly string[];
}

export interface SpeciesSummaryItem {
  readonly key: string;
  readonly plantId: string;
  readonly commonName: string;
  readonly scientificName: string | null;
  readonly familyName: string | null;
  readonly count: number;
}

export interface CropPlanMarker {
  readonly cropId: string;
  readonly speciesKey: string;
  readonly xCm: number;
  readonly yCm: number;
  readonly vitalRadiusCm: number;
  readonly commonName: string;
}

export type SheetOrientation = 'landscape' | 'portrait';

export interface BedPdfSheetData {
  readonly bedId: string;
  readonly bedName: string;
  readonly locationName: string;
  readonly widthCm: number;
  readonly heightCm: number;
  readonly northAngle: number | null;
  readonly bedAzimuth: number | null;
  readonly orientation: SheetOrientation;
  readonly markers: readonly CropPlanMarker[];
  readonly speciesSummary: readonly SpeciesSummaryItem[];
  readonly isEmpty: boolean;
}

export interface LocationOverviewBedItem {
  readonly id: string;
  readonly name: string;
  readonly widthCm: number;
  readonly heightCm: number;
  readonly position: { readonly x: number; readonly y: number };
  readonly rotation: number;
}

export interface LocationOverviewBounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface LocationOverviewPdfData {
  readonly locationId: string;
  readonly locationName: string;
  readonly beds: readonly LocationOverviewBedItem[];
  readonly northAngle: number | null;
  readonly orientation: SheetOrientation;
  readonly bounds: LocationOverviewBounds;
}

export interface PdfDocumentPayload {
  readonly filename: string;
  readonly generationDate: Date;
  readonly locationName: string;
  readonly options: BedPdfExportOptions;
  readonly locationOverview: LocationOverviewPdfData | null;
  readonly bedSheets: readonly BedPdfSheetData[];
}
