interface LocationLike {
  readonly pathname: string;
  readonly search?: string;
  readonly hash?: string;
}

function isLocationLike(value: unknown): value is LocationLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pathname' in value &&
    typeof (value as LocationLike).pathname === 'string'
  );
}

function isLoopPath(pathname: string): boolean {
  return pathname === '/login' || pathname === '/register';
}

function isValidRelativePath(pathname: string): boolean {
  return (
    pathname.startsWith('/') &&
    !pathname.startsWith('//') &&
    !pathname.includes('\\')
  );
}

export function resolveRedirectDestination(input: unknown): string {
  const target =
    typeof input === 'object' && input !== null && 'from' in input
      ? (input as { from?: unknown }).from
      : input;

  if (typeof target === 'string') {
    if (!isValidRelativePath(target)) {
      return '/';
    }
    const pathOnly = target.split(/[?#]/)[0];
    if (isLoopPath(pathOnly)) {
      return '/';
    }
    return target;
  }

  if (isLocationLike(target)) {
    if (!isValidRelativePath(target.pathname) || isLoopPath(target.pathname)) {
      return '/';
    }
    return `${target.pathname}${target.search ?? ''}${target.hash ?? ''}`;
  }

  return '/';
}
