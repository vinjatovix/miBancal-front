export interface VideoResourceItem {
  id: string;
  url: string;
  title: string;
}

export interface ArticleResourceItem {
  id: string;
  url: string;
  title: string;
}

export interface PlantFormState {
  primaryName: string;
  aliases: string[];
  scientificName: string;
  familyId: string;

  lifecycle: 'annual' | 'biennial' | 'perennial';
  heightMin: string;
  heightMax: string;
  spreadMin: string;
  spreadMax: string;
  spacingMin: string;
  spacingMax: string;
  edible: boolean | null;
  toxic: boolean | null;
  toxicityNotes: string;

  sowingMonths: number[];
  seedsPerHoleMin: string;
  seedsPerHoleMax: string;
  germinationDaysMin: string;
  germinationDaysMax: string;
  directDepthMin: string;
  directDepthMax: string;
  starterEnabled: boolean;
  starterDepthMin: string;
  starterDepthMax: string;
  floweringMonths: number[];
  pollinationType: string;
  pollinationAgents: string[];
  harvestMonths: number[];
  harvestDescription: string;

  soilPhMin: string;
  soilPhMax: string;
  soilDepthMin: string;
  soilDepthMax: string;
  rootType: string;
  rootDepthMin: string;
  rootDepthMax: string;
  rootSpreadMin: string;
  rootSpreadMax: string;
  wateringFrequency: string;
  wateringConditions: string[];
  lightHoursMin: string;
  lightType: string;
  lightPreference: string;
  strategicBenefits: string[];

  imageUrl: string;
  imageTitle: string;
  imageSource: string;
  videoResources: VideoResourceItem[];
  articleResources: ArticleResourceItem[];

  notes: string[];
}
