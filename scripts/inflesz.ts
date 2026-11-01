const STRONG_VOWELS = new Set(['a', 'e', 'o', 'á', 'é', 'ó']);
const ACCENTED_WEAK_VOWELS = new Set(['í', 'ú']);
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú', 'ü']);

const WORD_PATTERN = /[a-záéíóúüñ]+/gi;
const SENTENCE_PATTERN = /[.!?…]+/g;
const INTERPOLATION_PATTERN = /\{[^}]*\}/g;

function stripInterpolations(text: string): string {
  return text.replace(INTERPOLATION_PATTERN, ' ');
}

function isHiatus(current: string, next: string): boolean {
  if (STRONG_VOWELS.has(current) && STRONG_VOWELS.has(next)) {
    return true;
  }
  return ACCENTED_WEAK_VOWELS.has(current) || ACCENTED_WEAK_VOWELS.has(next);
}

function syllablesInGroup(group: string): number {
  let count = 1;
  for (let index = 0; index < group.length - 1; index += 1) {
    if (isHiatus(group[index], group[index + 1])) {
      count += 1;
    }
  }
  return count;
}

export function syllables(word: string): number {
  const lower = word.toLowerCase();
  let total = 0;
  let group = '';

  for (const character of lower) {
    if (VOWELS.has(character)) {
      group += character;
    } else if (group.length > 0) {
      total += syllablesInGroup(group);
      group = '';
    }
  }
  if (group.length > 0) {
    total += syllablesInGroup(group);
  }

  return Math.max(1, total);
}

export function wordList(text: string): string[] {
  return stripInterpolations(text).match(WORD_PATTERN) ?? [];
}

export function words(text: string): number {
  return wordList(text).length;
}

export function sentences(text: string): number {
  const matches = stripInterpolations(text).match(SENTENCE_PATTERN);
  return Math.max(1, matches ? matches.length : 0);
}

export function inflesz(text: string): number {
  const tokens = wordList(text);
  if (tokens.length === 0) {
    return 0;
  }
  const totalSyllables = tokens.reduce(
    (sum, token) => sum + syllables(token),
    0
  );
  const wordCount = tokens.length;
  const sentenceCount = sentences(text);

  return (
    206.835 - 62.3 * (totalSyllables / wordCount) - wordCount / sentenceCount
  );
}
