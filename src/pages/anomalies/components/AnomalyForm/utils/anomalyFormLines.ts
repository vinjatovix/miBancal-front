export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function uniqueLines(text: string): string[] {
  return [...new Set(splitLines(text))];
}
