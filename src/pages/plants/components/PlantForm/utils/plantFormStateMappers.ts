import type { Plant } from '../../../../../types/Plants/Plant';
import type {
  ArticleResourceItem,
  PlantFormState,
  VideoResourceItem
} from '../types';

export function initialPlantFormState(): PlantFormState {
  return {
    primaryName: '',
    aliases: [],
    scientificName: '',
    familyId: '',
    lifecycle: 'annual',
    heightMin: '50',
    heightMax: '100',
    spreadMin: '30',
    spreadMax: '50',
    spacingMin: '30',
    spacingMax: '40',
    edible: true,
    toxic: false,
    toxicityNotes: '',
    sowingMonths: [],
    seedsPerHoleMin: '1',
    seedsPerHoleMax: '2',
    germinationDaysMin: '5',
    germinationDaysMax: '10',
    directDepthMin: '1',
    directDepthMax: '2',
    starterEnabled: false,
    starterDepthMin: '',
    starterDepthMax: '',
    floweringMonths: [],
    pollinationType: '',
    pollinationAgents: [],
    harvestMonths: [],
    harvestDescription: '',
    soilPhMin: '6.0',
    soilPhMax: '7.0',
    soilDepthMin: '30',
    soilDepthMax: '45',
    rootType: 'fibrous',
    rootDepthMin: '20',
    rootDepthMax: '40',
    rootSpreadMin: '20',
    rootSpreadMax: '30',
    wateringFrequency: 'regular',
    wateringConditions: [],
    lightHoursMin: '6',
    lightType: 'full_sun',
    lightPreference: '',
    strategicBenefits: [],
    imageUrl: '',
    imageTitle: '',
    imageSource: '',
    videoResources: [],
    articleResources: [],
    notes: []
  };
}

export function canonicalPlantToFormState(plant: Plant): PlantFormState {
  const defaults = initialPlantFormState();
  const familyId =
    typeof plant.identity.family === 'string'
      ? plant.identity.family
      : (plant.identity.family?.id ?? '');

  const knowledge = plant.knowledge;
  const imageRes = knowledge?.resources?.find((r) => r.type === 'image');

  const videoResources: VideoResourceItem[] = (knowledge?.resources ?? [])
    .filter((r) => r.type === 'video')
    .map((r, index) => ({
      id: `video-${index}-${r.url}`,
      url: r.url,
      title: r.title ?? ''
    }));

  const articleResources: ArticleResourceItem[] = (knowledge?.resources ?? [])
    .filter((r) => r.type === 'article')
    .map((r, index) => ({
      id: `article-${index}-${r.url}`,
      url: r.url,
      title: r.title ?? ''
    }));

  const pollination = plant.phenology.flowering?.pollination;
  const pollinationTypes =
    pollination?.types ?? (pollination?.type ? [pollination.type] : []);
  const pollinationType = pollinationTypes[0] ?? '';

  return {
    primaryName: plant.identity.name.primary,
    aliases: plant.identity.name.aliases ?? [],
    scientificName: plant.identity.scientificName ?? '',
    familyId,
    lifecycle: plant.traits.lifecycle,
    heightMin: String(plant.traits.size.height.min),
    heightMax: String(plant.traits.size.height.max),
    spreadMin: String(plant.traits.size.spread.min),
    spreadMax: String(plant.traits.size.spread.max),
    spacingMin: String(plant.traits.spacingCm.min),
    spacingMax: String(plant.traits.spacingCm.max),
    edible:
      plant.traits.ecological?.edible !== undefined
        ? plant.traits.ecological.edible
        : null,
    toxic:
      plant.traits.ecological?.toxic !== undefined
        ? plant.traits.ecological.toxic
        : null,
    toxicityNotes: plant.traits.ecological?.toxicityNotes ?? '',
    sowingMonths: plant.phenology.sowing.months,
    seedsPerHoleMin: String(plant.phenology.sowing.seedsPerHole.min),
    seedsPerHoleMax: String(plant.phenology.sowing.seedsPerHole.max),
    germinationDaysMin: String(plant.phenology.sowing.germinationDays.min),
    germinationDaysMax: String(plant.phenology.sowing.germinationDays.max),
    directDepthMin: String(plant.phenology.sowing.methods.direct.depthCm.min),
    directDepthMax: String(plant.phenology.sowing.methods.direct.depthCm.max),
    starterEnabled: Boolean(plant.phenology.sowing.methods.starter),
    starterDepthMin: plant.phenology.sowing.methods.starter
      ? String(plant.phenology.sowing.methods.starter.depthCm.min)
      : '',
    starterDepthMax: plant.phenology.sowing.methods.starter
      ? String(plant.phenology.sowing.methods.starter.depthCm.max)
      : '',
    floweringMonths: plant.phenology.flowering?.months ?? [],
    pollinationType,
    pollinationAgents: pollination?.agents ?? [],
    harvestMonths: plant.phenology.harvest?.months ?? [],
    harvestDescription: plant.phenology.harvest?.description ?? '',
    soilPhMin:
      knowledge?.soil?.ph?.min != null
        ? String(knowledge.soil.ph.min)
        : defaults.soilPhMin,
    soilPhMax:
      knowledge?.soil?.ph?.max != null
        ? String(knowledge.soil.ph.max)
        : defaults.soilPhMax,
    soilDepthMin:
      knowledge?.soil?.availableDepthCm?.min != null
        ? String(knowledge.soil.availableDepthCm.min)
        : defaults.soilDepthMin,
    soilDepthMax:
      knowledge?.soil?.availableDepthCm?.max != null
        ? String(knowledge.soil.availableDepthCm.max)
        : defaults.soilDepthMax,
    rootType: knowledge?.rootSystem?.type ?? defaults.rootType,
    rootDepthMin:
      knowledge?.rootSystem?.depthCm?.min != null
        ? String(knowledge.rootSystem.depthCm.min)
        : defaults.rootDepthMin,
    rootDepthMax:
      knowledge?.rootSystem?.depthCm?.max != null
        ? String(knowledge.rootSystem.depthCm.max)
        : defaults.rootDepthMax,
    rootSpreadMin:
      knowledge?.rootSystem?.spreadCm?.min != null
        ? String(knowledge.rootSystem.spreadCm.min)
        : defaults.rootSpreadMin,
    rootSpreadMax:
      knowledge?.rootSystem?.spreadCm?.max != null
        ? String(knowledge.rootSystem.spreadCm.max)
        : defaults.rootSpreadMax,
    wateringFrequency:
      knowledge?.watering?.frequency ?? defaults.wateringFrequency,
    wateringConditions: knowledge?.watering?.conditions ?? [],
    lightHoursMin:
      knowledge?.light?.hoursMin != null
        ? String(knowledge.light.hoursMin)
        : defaults.lightHoursMin,
    lightType: knowledge?.light?.type ?? defaults.lightType,
    lightPreference: knowledge?.light?.preference ?? '',
    strategicBenefits: knowledge?.ecology?.strategicBenefits ?? [],
    imageUrl: plant.image?.url ?? imageRes?.url ?? '',
    imageTitle: plant.image?.title ?? imageRes?.title ?? '',
    imageSource: plant.image?.source ?? imageRes?.source ?? '',
    videoResources,
    articleResources,
    notes: knowledge?.notes ?? []
  };
}
