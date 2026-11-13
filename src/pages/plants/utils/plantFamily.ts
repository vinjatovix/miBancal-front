export type PlantFamilyView =
  | { kind: 'linked'; name: string; slug: string }
  | { kind: 'unavailable' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function readPlantFamily(family: unknown): PlantFamilyView | undefined {
  if (typeof family === 'string') {
    return { kind: 'unavailable' };
  }

  if (isRecord(family)) {
    const { name, slug } = family;
    if (
      typeof name === 'string' &&
      name.trim().length > 0 &&
      typeof slug === 'string' &&
      slug.trim().length > 0
    ) {
      return {
        kind: 'linked',
        name,
        slug
      };
    }
  }

  return undefined;
}
