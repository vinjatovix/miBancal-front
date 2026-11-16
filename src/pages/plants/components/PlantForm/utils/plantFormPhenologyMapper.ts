import type {
  CreatePlantRequest,
  Plant,
  UpdatePlantRequest
} from '../../../../../types/Plants/Plant';
import type { PlantFormState } from '../types';

function buildCreatePollination(state: PlantFormState) {
  if (!state.pollinationType) return undefined;
  return {
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
      state.pollinationAgents.length > 0 ? state.pollinationAgents : undefined
  };
}

export function buildCreatePhenology(
  state: PlantFormState
): CreatePlantRequest['phenology'] {
  const pollination = buildCreatePollination(state);
  return {
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
  };
}

function buildUpdatePollination(state: PlantFormState, originalPlant?: Plant) {
  if (!state.pollinationType) return null;
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

  return {
    types: typesToSave,
    agents: state.pollinationAgents.length > 0 ? state.pollinationAgents : null
  };
}

export function buildUpdatePhenology(
  state: PlantFormState,
  originalPlant?: Plant
): UpdatePlantRequest['phenology'] {
  const pollination = buildUpdatePollination(state, originalPlant);

  return {
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
  };
}
