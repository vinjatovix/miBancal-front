export interface EmojiFinding {
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly character: string;
}

const EMOJI_PATTERN =
  /(?:[\u0023\u002A\u0030-\u0039]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*|[\u2190-\u21FF]|(?![\u00B0])\p{So})/gu;

export function findEmojiCharacters(
  filePath: string,
  content: string
): EmojiFinding[] {
  const lines = content.split('\n');
  const findings: EmojiFinding[] = [];

  lines.forEach((lineText, lineIndex) => {
    const matches = [...lineText.matchAll(EMOJI_PATTERN)];
    for (const match of matches) {
      if (match.index !== undefined) {
        findings.push({
          filePath,
          line: lineIndex + 1,
          column: match.index + 1,
          character: match[0]
        });
      }
    }
  });

  return findings;
}
