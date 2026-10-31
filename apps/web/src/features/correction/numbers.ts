const UNITS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
]
const TENS = ['thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

/** Número por extenso → dígitos (0–20 e dezenas redondas), para `two` = `2`. */
export const NUMBER_WORDS: ReadonlyMap<string, string> = new Map([
  ...UNITS.map((word, n) => [word, String(n)] as const),
  ...TENS.map((word, i) => [word, String((i + 3) * 10)] as const),
])
