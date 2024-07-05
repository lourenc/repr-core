const SPECIAL_CHARS = [
  '\\',
  '_',
  '*',
  '[',
  ']',
  '(',
  ')',
  '~',
  '`',
  '>',
  '<',
  '&',
  '#',
  '+',
  '-',
  '=',
  '|',
  '{',
  '}',
  '.',
  '!',
];

export function escapeSpecialCharacters(str: string) {
  let text = str;

  for (const char of SPECIAL_CHARS) {
    text = text.replaceAll(char, `\\${char}`);
  }

  return text;
}
