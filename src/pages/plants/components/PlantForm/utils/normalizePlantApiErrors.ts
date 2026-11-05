export interface NormalizedPlantErrors {
  fieldErrors: Record<string, string>;
  unmappedErrors: string[];
}

const DIRECT_FORM_ERROR_KEYS = new Set<string>([
  'primaryName',
  'scientificName',
  'familyId',
  'height',
  'spread',
  'spacing',
  'sowingMonths',
  'seedsPerHole',
  'germinationDays',
  'directDepth',
  'starterDepth',
  'soilPh',
  'soilDepth',
  'rootDepth',
  'rootSpread',
  'imageUrl'
]);

function mapApiKeyToFormField(key: string): string | null {
  if (DIRECT_FORM_ERROR_KEYS.has(key)) return key;
  if (/^videoUrl_\d+$/.test(key)) return key;
  if (/^articleUrl_\d+$/.test(key)) return key;

  if (key === 'identity.name.primary' || key === 'identity.name') {
    return 'primaryName';
  }
  if (key === 'identity.scientificName') return 'scientificName';
  if (key === 'identity.family') return 'familyId';

  if (key.startsWith('traits.size.height')) return 'height';
  if (key.startsWith('traits.size.spread')) return 'spread';
  if (key.startsWith('traits.spacingCm')) return 'spacing';

  if (key.startsWith('phenology.sowing.months')) return 'sowingMonths';
  if (key.startsWith('phenology.sowing.seedsPerHole')) return 'seedsPerHole';
  if (key.startsWith('phenology.sowing.germinationDays'))
    return 'germinationDays';
  if (key.startsWith('phenology.sowing.methods.direct')) return 'directDepth';
  if (key.startsWith('phenology.sowing.methods.starter')) return 'starterDepth';

  if (
    key === 'knowledge.resources' ||
    key.startsWith('knowledge.resources.0.')
  ) {
    return 'imageUrl';
  }
  if (key.startsWith('knowledge.soil.ph')) return 'soilPh';
  if (key.startsWith('knowledge.soil.availableDepthCm')) return 'soilDepth';
  if (key.startsWith('knowledge.rootSystem.depthCm')) return 'rootDepth';
  if (key.startsWith('knowledge.rootSystem.spreadCm')) return 'rootSpread';

  return null;
}

export function normalizePlantApiErrors(
  errors: Record<string, string>
): NormalizedPlantErrors {
  const fieldErrors: Record<string, string> = {};
  const unmappedErrors: string[] = [];

  for (const [key, msg] of Object.entries(errors)) {
    const fieldKey = mapApiKeyToFormField(key);
    if (fieldKey) {
      fieldErrors[fieldKey] = msg;
    } else {
      unmappedErrors.push(msg);
    }
  }

  return { fieldErrors, unmappedErrors };
}
