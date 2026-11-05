import type { Range } from '../Range';
import type { Seasons } from '../Season';

export type RootSystem =
  | 'fibrous'
  | 'taproot'
  | 'adventitious'
  | 'rhizome'
  | 'tuber'
  | 'fasciculate';

export type PlantEcologicalTraits = {
  edible?: boolean;
  toxic?: boolean;
  toxicityNotes?: string;
};

export interface PlantResourceInput {
  type: 'image' | 'article' | 'video';
  url: string;
  title?: string;
  source?: string;
  tags?: string[];
}

export type PartialRange = {
  min?: number;
  max?: number;
};

export interface CreatePlantRequest {
  id: string;
  identity: {
    name: {
      primary: string;
      aliases?: string[];
    };
    scientificName: string;
    family: string;
  };
  traits: {
    lifecycle: 'annual' | 'biennial' | 'perennial';
    size: {
      height: Range;
      spread: Range;
    };
    spacingCm: Range;
    ecological?: PlantEcologicalTraits;
  };
  phenology: {
    sowing: {
      months: number[];
      seedsPerHole: Range;
      germinationDays: Range;
      methods: {
        direct: {
          depthCm: Range;
        };
        starter?: {
          depthCm: Range;
        };
      };
    };
    flowering?: {
      months?: number[];
      pollination?: {
        types: Array<'insect' | 'wind' | 'self' | 'water' | 'bird' | 'bat'>;
        agents?: string[];
      };
    };
    harvest?: {
      months?: number[];
      description?: string;
    };
  };
  knowledge: {
    soil: {
      ph: Range;
      availableDepthCm: Range;
    };
    rootSystem: {
      type: RootSystem;
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
    ecology?: {
      strategicBenefits?: string[];
    };
    resources: PlantResourceInput[];
    notes?: string[];
  };
}

export interface UpdatePlantRequest {
  identity?: {
    name?: {
      primary?: string;
      aliases?: string[] | null;
    };
    scientificName?: string;
    family?: string;
  };
  traits?: {
    lifecycle?: 'annual' | 'biennial' | 'perennial';
    size?: {
      height?: PartialRange;
      spread?: PartialRange;
    };
    spacingCm?: PartialRange;
    ecological?: {
      edible?: boolean | null;
      toxic?: boolean | null;
      toxicityNotes?: string | null;
    } | null;
  };
  phenology?: {
    sowing?: {
      months?: number[];
      seedsPerHole?: PartialRange;
      germinationDays?: PartialRange;
      methods?: {
        direct?: {
          depthCm?: PartialRange;
        };
        starter?: {
          depthCm?: PartialRange;
        } | null;
      };
    };
    flowering?: {
      months?: number[] | null;
      pollination?: {
        types?: Array<
          'insect' | 'wind' | 'self' | 'water' | 'bird' | 'bat'
        > | null;
        agents?: string[] | null;
      } | null;
    } | null;
    harvest?: {
      months?: number[] | null;
      description?: string | null;
    } | null;
  };
  knowledge?: {
    soil?: {
      ph?: PartialRange;
      availableDepthCm?: PartialRange;
    };
    rootSystem?: {
      type?: RootSystem;
      depthCm?: PartialRange;
      spreadCm?: PartialRange;
    };
    watering?: {
      frequency?: string;
      amountMm?: number | null;
      conditions?: string[] | null;
    };
    light?: {
      hoursMin?: number;
      type?: string;
      preference?: 'morning' | 'afternoon' | 'all_day' | null;
    };
    propagation?: {
      methods?: Record<
        string,
        {
          seasons?: Seasons;
          estimatedTimeWeeks?: Range;
          bestPractices?: string[];
        }
      >;
    };
    ecology?: {
      strategicBenefits?: string[] | null;
    } | null;
    resources?: PlantResourceInput[];
    notes?: string[] | null;
  };
}
