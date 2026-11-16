export type PlantPdfSection =
  | 'image'
  | 'quickFacts'
  | 'calendar'
  | 'safety'
  | 'cultivation'
  | 'ecology'
  | 'notes'
  | 'resources';

export interface PlantPdfExportOptions {
  readonly includeImage: boolean;
  readonly includeQuickFacts: boolean;
  readonly includeCalendar: boolean;
  readonly includeSafety: boolean;
  readonly includeCultivation: boolean;
  readonly includeEcology: boolean;
  readonly includeNotes: boolean;
  readonly includeResources: boolean;
  readonly imageDataUrl: string | null;
}

export type ResourceQrType = 'article' | 'video' | 'image';

export interface ResourceQrEntry {
  readonly url: string;
  readonly title: string;
  readonly type: ResourceQrType;
  readonly domain: string;
}

export interface PlantPdfResourcesSection {
  readonly entries: readonly ResourceQrEntry[];
}

export interface PlantPdfContentRow {
  readonly label: string;
  readonly value: string;
}

export interface PlantPdfContentBlock {
  readonly section: PlantPdfSection;
  readonly title: string;
  readonly rows: readonly PlantPdfContentRow[];
}

export interface PlantPdfHeader {
  readonly commonName: string;
  readonly scientificName: string | null;
  readonly familyName: string | null;
  readonly generationDateLabel: string;
}

export interface PlantPdfPayload {
  readonly filename: string;
  readonly generationDate: Date;
  readonly header: PlantPdfHeader;
  readonly imageDataUrl: string | null;
  readonly sections: readonly PlantPdfContentBlock[];
  readonly resources: PlantPdfResourcesSection | null;
}
