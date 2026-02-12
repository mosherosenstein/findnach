const NIKKUD_AND_TROPE = /[\u0591-\u05C7]/g;
const PUNCTUATION_AND_SYMBOLS = /[^\u0590-\u05FF\s]/g;

const FINAL_TO_STANDARD: Record<string, string> = {
  ך: 'כ',
  ם: 'מ',
  ן: 'נ',
  ף: 'פ',
  ץ: 'צ',
};

export function normalizeHebrewText(input: string): string {
  return input
    .replace(NIKKUD_AND_TROPE, '')
    .replace(PUNCTUATION_AND_SYMBOLS, ' ')
    .split('')
    .map((ch) => FINAL_TO_STANDARD[ch] ?? ch)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}
