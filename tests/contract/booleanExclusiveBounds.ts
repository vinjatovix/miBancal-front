const EXCLUSIVE_BOUNDS = [
  ['exclusiveMinimum', 'minimum'],
  ['exclusiveMaximum', 'maximum']
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function convertBound(
  node: Record<string, unknown>,
  exclusive: string,
  inclusive: string
): void {
  const isExclusive = node[exclusive];
  if (typeof isExclusive !== 'boolean') return;
  delete node[exclusive];
  if (!isExclusive) return;
  node[exclusive] = node[inclusive];
  delete node[inclusive];
}

function convertNullableRef(node: Record<string, unknown>): void {
  if (node.nullable !== true) return;
  if (!node.type && typeof node.$ref === 'string') {
    const ref = node.$ref;
    delete node.$ref;
    delete node.nullable;
    node.anyOf = [{ $ref: ref }, { type: 'null' }];
    return;
  }
  if (!node.type) {
    delete node.nullable;
  }
}

export function convertBooleanExclusiveBounds(node: unknown): void {
  if (Array.isArray(node)) {
    node.forEach(convertBooleanExclusiveBounds);
    return;
  }
  if (!isRecord(node)) return;
  Object.values(node).forEach(convertBooleanExclusiveBounds);
  EXCLUSIVE_BOUNDS.forEach(([exclusive, inclusive]) =>
    convertBound(node, exclusive, inclusive)
  );
  convertNullableRef(node);
}
