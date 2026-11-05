import type {
  CreatePlantRequest,
  Plant,
  PlantResourceInput,
  UpdatePlantRequest
} from '../../../../../types/Plants/Plant';
import type { PlantFormState } from '../types';

function buildResources(state: PlantFormState): PlantResourceInput[] {
  const resources: PlantResourceInput[] = [];

  const imageResource: PlantResourceInput = {
    type: 'image',
    url: state.imageUrl.trim()
  };
  if (state.imageTitle.trim()) imageResource.title = state.imageTitle.trim();
  if (state.imageSource.trim()) imageResource.source = state.imageSource.trim();
  resources.push(imageResource);

  for (const video of state.videoResources) {
    const trimmedUrl = video.url.trim();
    if (trimmedUrl) {
      resources.push({
        type: 'video',
        url: trimmedUrl,
        title: video.title.trim() || undefined
      });
    }
  }

  for (const article of state.articleResources) {
    const trimmedUrl = article.url.trim();
    if (trimmedUrl) {
      resources.push({
        type: 'article',
        url: trimmedUrl,
        title: article.title.trim() || undefined
      });
    }
  }

  return resources;
}

function buildUpdateResources(
  state: PlantFormState,
  originalPlant?: Plant
): PlantResourceInput[] {
  const originalResources = originalPlant?.knowledge?.resources ?? [];
  const resources: PlantResourceInput[] = [];

  const primaryImageUrl = state.imageUrl.trim();
  if (primaryImageUrl) {
    const matchedMainImage = originalResources.find(
      (r) => r.type === 'image' && r.url === primaryImageUrl
    );
    const imageResource: PlantResourceInput = {
      type: 'image',
      url: primaryImageUrl
    };
    if (state.imageTitle.trim()) {
      imageResource.title = state.imageTitle.trim();
    } else if (matchedMainImage?.title) {
      imageResource.title = matchedMainImage.title;
    }
    if (state.imageSource.trim()) {
      imageResource.source = state.imageSource.trim();
    } else if (matchedMainImage?.source) {
      imageResource.source = matchedMainImage.source;
    }
    if (matchedMainImage?.tags && matchedMainImage.tags.length > 0) {
      imageResource.tags = matchedMainImage.tags;
    }
    resources.push(imageResource);
  }

  const firstOriginalImage = originalResources.find((r) => r.type === 'image');
  const additionalOriginalImages = originalResources.filter(
    (r) =>
      r.type === 'image' &&
      r !== firstOriginalImage &&
      r.url !== primaryImageUrl
  );
  for (const extraImg of additionalOriginalImages) {
    resources.push({
      type: 'image',
      url: extraImg.url,
      title: extraImg.title,
      source: extraImg.source,
      tags: extraImg.tags
    });
  }

  for (const video of state.videoResources) {
    const trimmedUrl = video.url.trim();
    if (trimmedUrl) {
      const matched = originalResources.find(
        (r) => r.type === 'video' && r.url === trimmedUrl
      );
      const item: PlantResourceInput = {
        type: 'video',
        url: trimmedUrl,
        title: video.title.trim() || undefined
      };
      if (matched?.source) item.source = matched.source;
      if (matched?.tags && matched.tags.length > 0) item.tags = matched.tags;
      resources.push(item);
    }
  }

  for (const article of state.articleResources) {
    const trimmedUrl = article.url.trim();
    if (trimmedUrl) {
      const matched = originalResources.find(
        (r) => r.type === 'article' && r.url === trimmedUrl
      );
      const item: PlantResourceInput = {
        type: 'article',
        url: trimmedUrl,
        title: article.title.trim() || undefined
      };
      if (matched?.source) item.source = matched.source;
      if (matched?.tags && matched.tags.length > 0) item.tags = matched.tags;
      resources.push(item);
    }
  }

  return resources;
}

export function formStateToCreatePlantRequest(
  state: PlantFormState,
  id?: string
): CreatePlantRequest {
  const pollination = state.pollinationType
    ? {
        types: [
          state.pollinationType as
            | 'insect'
            | 'wind'
            | 'self'
            | 'water'
            | 'bird'
            | 'bat'
        ],
        agents:
          state.pollinationAgents.length > 0
            ? state.pollinationAgents
            : undefined
      }
    : undefined;

  return {
    id: id || crypto.randomUUID(),
    identity: {
      name: {
        primary: state.primaryName.trim(),
        aliases: state.aliases
      },
      scientificName: state.scientificName.trim(),
      family: state.familyId.trim()
    },
    traits: {
      lifecycle: state.lifecycle,
      size: {
        height: { min: Number(state.heightMin), max: Number(state.heightMax) },
        spread: { min: Number(state.spreadMin), max: Number(state.spreadMax) }
      },
      spacingCm: {
        min: Number(state.spacingMin),
        max: Number(state.spacingMax)
      },
      ecological: {
        edible: state.edible ?? undefined,
        toxic: state.toxic ?? undefined,
        toxicityNotes: state.toxicityNotes.trim() || undefined
      }
    },
    phenology: {
      sowing: {
        months: state.sowingMonths,
        seedsPerHole: {
          min: Number(state.seedsPerHoleMin),
          max: Number(state.seedsPerHoleMax)
        },
        germinationDays: {
          min: Number(state.germinationDaysMin),
          max: Number(state.germinationDaysMax)
        },
        methods: {
          direct: {
            depthCm: {
              min: Number(state.directDepthMin),
              max: Number(state.directDepthMax)
            }
          },
          starter: state.starterEnabled
            ? {
                depthCm: {
                  min: Number(state.starterDepthMin),
                  max: Number(state.starterDepthMax)
                }
              }
            : undefined
        }
      },
      flowering:
        state.floweringMonths.length > 0 || pollination
          ? {
              months: state.floweringMonths,
              pollination
            }
          : undefined,
      harvest:
        state.harvestMonths.length > 0 || state.harvestDescription.trim()
          ? {
              months: state.harvestMonths,
              description: state.harvestDescription.trim() || undefined
            }
          : undefined
    },
    knowledge: {
      soil: {
        ph: { min: Number(state.soilPhMin), max: Number(state.soilPhMax) },
        availableDepthCm: {
          min: Number(state.soilDepthMin),
          max: Number(state.soilDepthMax)
        }
      },
      rootSystem: {
        type: state.rootType as Plant['knowledge']['rootSystem']['type'],
        depthCm: {
          min: Number(state.rootDepthMin),
          max: Number(state.rootDepthMax)
        },
        spreadCm: {
          min: Number(state.rootSpreadMin),
          max: Number(state.rootSpreadMax)
        }
      },
      watering: {
        frequency: state.wateringFrequency.trim(),
        conditions:
          state.wateringConditions.length > 0
            ? state.wateringConditions
            : undefined
      },
      light: {
        hoursMin: Number(state.lightHoursMin),
        type: state.lightType.trim(),
        preference:
          (state.lightPreference as 'morning' | 'afternoon' | 'all_day') ||
          undefined
      },
      propagation: {
        methods: {}
      },
      ecology:
        state.strategicBenefits.length > 0
          ? { strategicBenefits: state.strategicBenefits }
          : undefined,
      resources: buildResources(state),
      notes: state.notes.length > 0 ? state.notes : undefined
    }
  };
}

export function formStateToUpdatePlantRequest(
  state: PlantFormState,
  originalPlant?: Plant
): UpdatePlantRequest {
  const originalTypes = originalPlant?.phenology?.flowering?.pollination?.types;
  const typesToSave =
    originalTypes &&
    originalTypes.length > 0 &&
    originalTypes[0] === state.pollinationType
      ? originalTypes
      : [
          state.pollinationType as
            | 'insect'
            | 'wind'
            | 'self'
            | 'water'
            | 'bird'
            | 'bat'
        ];

  const pollination = state.pollinationType
    ? {
        types: typesToSave,
        agents:
          state.pollinationAgents.length > 0 ? state.pollinationAgents : null
      }
    : null;

  return {
    identity: {
      name: {
        primary: state.primaryName.trim(),
        aliases: state.aliases
      },
      scientificName: state.scientificName.trim(),
      family: state.familyId.trim()
    },
    traits: {
      lifecycle: state.lifecycle,
      size: {
        height: { min: Number(state.heightMin), max: Number(state.heightMax) },
        spread: { min: Number(state.spreadMin), max: Number(state.spreadMax) }
      },
      spacingCm: {
        min: Number(state.spacingMin),
        max: Number(state.spacingMax)
      },
      ecological: {
        edible:
          state.edible !== null
            ? state.edible
            : (originalPlant?.traits?.ecological?.edible ?? null),
        toxic:
          state.toxic !== null
            ? state.toxic
            : (originalPlant?.traits?.ecological?.toxic ?? null),
        toxicityNotes: state.toxicityNotes.trim() || null
      }
    },
    phenology: {
      sowing: {
        months: state.sowingMonths,
        seedsPerHole: {
          min: Number(state.seedsPerHoleMin),
          max: Number(state.seedsPerHoleMax)
        },
        germinationDays: {
          min: Number(state.germinationDaysMin),
          max: Number(state.germinationDaysMax)
        },
        methods: {
          direct: {
            depthCm: {
              min: Number(state.directDepthMin),
              max: Number(state.directDepthMax)
            }
          },
          starter: state.starterEnabled
            ? {
                depthCm: {
                  min: Number(state.starterDepthMin),
                  max: Number(state.starterDepthMax)
                }
              }
            : null
        }
      },
      flowering: {
        months: state.floweringMonths,
        pollination
      },
      harvest: {
        months: state.harvestMonths,
        description: state.harvestDescription.trim() || null
      }
    },
    knowledge: {
      soil: {
        ph: { min: Number(state.soilPhMin), max: Number(state.soilPhMax) },
        availableDepthCm: {
          min: Number(state.soilDepthMin),
          max: Number(state.soilDepthMax)
        }
      },
      rootSystem: {
        type: state.rootType as Plant['knowledge']['rootSystem']['type'],
        depthCm: {
          min: Number(state.rootDepthMin),
          max: Number(state.rootDepthMax)
        },
        spreadCm: {
          min: Number(state.rootSpreadMin),
          max: Number(state.rootSpreadMax)
        }
      },
      watering: {
        frequency: state.wateringFrequency.trim(),
        conditions:
          state.wateringConditions.length > 0 ? state.wateringConditions : null
      },
      light: {
        hoursMin: Number(state.lightHoursMin),
        type: state.lightType.trim(),
        preference:
          (state.lightPreference as 'morning' | 'afternoon' | 'all_day') || null
      },
      ecology: {
        strategicBenefits:
          state.strategicBenefits.length > 0 ? state.strategicBenefits : null
      },
      resources: buildUpdateResources(state, originalPlant),
      notes: state.notes.length > 0 ? state.notes : null
    }
  };
}
