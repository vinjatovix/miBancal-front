const TARGET_EXTENSION_PATTERN = /\.(ts|tsx|css|json)$/;

export function selectEmojiCheckFiles(paths: readonly string[]): string[] {
  return paths
    .filter((path) => {
      if (!path.startsWith('src/')) return false;
      if (!TARGET_EXTENSION_PATTERN.test(path)) return false;
      if (path.includes('.test.')) return false;
      if (path.includes('/fixtures/')) return false;
      return true;
    })
    .sort();
}
