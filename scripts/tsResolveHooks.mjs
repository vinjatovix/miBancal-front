const HAS_EXTENSION = /\.[a-z0-9]+$/i;

export async function resolve(specifier, context, nextResolve) {
  const isRelative = specifier.startsWith('./') || specifier.startsWith('../');
  if (!isRelative || HAS_EXTENSION.test(specifier)) {
    return nextResolve(specifier, context);
  }

  try {
    return await nextResolve(`${specifier}.ts`, context);
  } catch {
    try {
      return await nextResolve(`${specifier}/index.ts`, context);
    } catch {
      return nextResolve(specifier, context);
    }
  }
}
