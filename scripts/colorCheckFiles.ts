export const TOKENS_FILE = 'src/styles/tokens.css';
export const ICON_PATHS_FILE = 'src/shared/components/Icon/iconPaths.tsx';

const SOURCE_FILE_PATTERN = /^src\/.+\.(css|ts|tsx)$/;

export function selectColorCheckFiles(paths: readonly string[]): string[] {
  return paths
    .filter(
      (path) =>
        path === 'index.html' ||
        (SOURCE_FILE_PATTERN.test(path) &&
          path !== TOKENS_FILE &&
          path !== ICON_PATHS_FILE)
    )
    .sort();
}
