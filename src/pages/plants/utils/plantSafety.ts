import type { Plant } from '../../../types/Plants/Plant';

export type SafetyFlag = 'yes' | 'no' | 'unknown';

export type PlantSafety = {
  edible: SafetyFlag;
  toxic: SafetyFlag;
  toxicityNotes?: string;
  hasData: boolean;
};

function toFlag(value: boolean | undefined): SafetyFlag {
  if (value === undefined) {
    return 'unknown';
  }
  return value ? 'yes' : 'no';
}

export function readPlantSafety(
  plant: { traits?: Partial<Plant['traits']> } | null | undefined
): PlantSafety {
  const { edible, toxic, toxicityNotes } = plant?.traits?.ecological ?? {};
  const safety: PlantSafety = {
    edible: toFlag(edible),
    toxic: toFlag(toxic),
    hasData:
      edible !== undefined || toxic !== undefined || toxicityNotes !== undefined
  };

  return toxicityNotes === undefined ? safety : { ...safety, toxicityNotes };
}
