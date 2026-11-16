const PRIVATE_PREFIXES = ['/admin', '/settings'] as const;

const PRIVATE_EXACT_PATHS = [
  '/plants/new',
  '/families/new',
  '/anomalies/new',
  '/garden-inputs/new'
] as const;

export function isPrivateRoute(pathname: string): boolean {
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  for (const prefix of PRIVATE_PREFIXES) {
    if (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) {
      return true;
    }
  }

  return (PRIVATE_EXACT_PATHS as readonly string[]).includes(normalizedPath);
}
