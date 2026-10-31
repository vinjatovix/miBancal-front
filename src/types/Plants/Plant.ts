import type { Metadata } from '../Metadata';
import type { Range } from '../Range';
import type { Seasons } from '../Season';
import type { PlantFamilyRef } from '../FamilySummary';
import type { SupportResource } from '../SupportResource';
import type { PlantEcologicalTraits } from './PlantMutation';

export type PlantStatus = 'ACTIVE' | 'DELETED';

export type PlantImage = {
  url: string;
  title?: string;
  source?: string;
};

export interface Plant {
  id: string;
  slug?: string;
  version?: number;
  likesCount: number;

  identity: {
    name: {
      primary: string;
      aliases: string[];
    };
    scientificName?: string;
    genus?: string;
    family: PlantFamilyRef;
  };

  traits: {
    lifecycle: 'annual' | 'perennial' | 'biennial';
    size: {
      height: {
        min: number;
        max: number;
      };
      spread: {
        min: number;
        max: number;
      };
    };
    spacingCm: {
      min: number;
      max: number;
    };
    ecological?: PlantEcologicalTraits;
  };

  phenology: {
    sowing: {
      seedsPerHole: Range;
      germinationDays: Range;
      months: number[];
      methods: {
        direct: {
          depthCm: Range;
        };
        starter?: {
          depthCm: Range;
        };
      };
    };
    flowering: {
      months: number[];
      pollination?: {
        type?: 'insect' | 'wind' | 'self' | 'water' | 'bird' | 'bat';
        types?: Array<'insect' | 'wind' | 'self' | 'water' | 'bird' | 'bat'>;
        agents?: string[];
      };
    };
    harvest: {
      months: number[];
      description?: string;
    };
  };

  knowledge: {
    soil: {
      ph: Range;
      availableDepthCm: Range;
    };
    rootSystem: {
      type:
        | 'fibrous'
        | 'taproot'
        | 'adventitious'
        | 'rhizome'
        | 'tuber'
        | 'fasciculate';
      depthCm: Range;
      spreadCm: Range;
    };
    watering: {
      frequency: string;
      amountMm?: number;
      conditions?: string[];
    };
    light: {
      hoursMin: number;
      type: string;
      preference?: 'morning' | 'afternoon' | 'all_day';
    };
    pruning?: Array<{
      type: string;
      intensity: string;
      seasons: Seasons;
      frequencyPerYear: number;
      bestPractices?: string[];
    }>;
    propagation: {
      methods: Record<
        string,
        {
          seasons?: Seasons;
          estimatedTimeWeeks?: Range;
          bestPractices?: string[];
        }
      >;
    };
    ecology: {
      strategicBenefits: string[];
    };
    resources?: SupportResource[];
    notes?: string[];
  };
  image: PlantImage;
  metadata: Metadata;
  status: PlantStatus;
  deletedAt: Date | null;
}

export type FamilyPlantItem = Pick<Plant, 'id' | 'identity' | 'slug'> & {
  status?: PlantStatus;
};

export type PlantListItem = FamilyPlantItem &
  Pick<Plant, 'traits' | 'image' | 'likesCount'>;

export type PlantLifecycle = Plant['traits']['lifecycle'];

export type LightType = Plant['knowledge']['light']['type'];

export type SowingMethod = keyof Plant['phenology']['sowing']['methods'];

export type {
  CreatePlantRequest,
  PartialRange,
  PlantEcologicalTraits,
  PlantResourceInput,
  RootSystem,
  UpdatePlantRequest
} from './PlantMutation';
