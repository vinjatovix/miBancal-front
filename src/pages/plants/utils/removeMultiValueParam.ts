export function removeMultiValueParam(
  params: URLSearchParams,
  key: string,
  value: string
): URLSearchParams {
  const next = new URLSearchParams(params);
  const remaining = next
    .getAll(key)
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && entry !== value);

  next.delete(key);
  remaining.forEach((entry) => next.append(key, entry));

  return next;
}
