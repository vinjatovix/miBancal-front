export function pickAllowed<T extends string>(
  values: readonly string[],
  allowed: readonly T[]
): T | undefined {
  return values
    .map((value) => value.trim())
    .find((value): value is T =>
      (allowed as readonly string[]).includes(value)
    );
}
