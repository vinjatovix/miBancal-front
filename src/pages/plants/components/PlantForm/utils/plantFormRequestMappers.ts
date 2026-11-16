import type {
  CreatePlantRequest,
  Plant,
  UpdatePlantRequest
} from '../../../../../types/Plants/Plant';
import type { PlantFormState } from '../types';
import {
  buildCreatePhenology,
  buildUpdatePhenology
} from './plantFormPhenologyMapper';
import {
  buildResources,
  buildUpdateResources
} from './plantFormResourcesMapper';

export function formStateToCreatePlantRequest(
  state: PlantFormState,
  id?: string
): CreatePlantRequest {
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
    phenology: buildCreatePhenology(state),
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
          state.edible ?? originalPlant?.traits?.ecological?.edible ?? null,
        toxic: state.toxic ?? originalPlant?.traits?.ecological?.toxic ?? null,
        toxicityNotes: state.toxicityNotes.trim() || null
      }
    },
    phenology: buildUpdatePhenology(state, originalPlant),
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
