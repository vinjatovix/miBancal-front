import type { Bed, UpdateBedRequest } from '../../../types/Bed/Bed';
import type { BedFormData } from './validateBedForm';

export function buildBedPatch(
  original: Bed,
  values: BedFormData
): UpdateBedRequest {
  const patch: Record<string, unknown> = {};

  const nextName = values.name.trim();
  if (nextName !== original.name) {
    patch.name = nextName;
  }

  const nextWidth = Number(values.width);
  if (nextWidth !== original.width) {
    patch.width = nextWidth;
  }

  const nextHeight = Number(values.height);
  if (nextHeight !== original.height) {
    patch.height = nextHeight;
  }

  const nextDepth = Number(values.depth);
  if (nextDepth !== original.depth) {
    patch.depth = nextDepth;
  }

  return patch as UpdateBedRequest;
}
