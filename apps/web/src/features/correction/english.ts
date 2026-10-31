import { CONTRACTION_MAP } from './contractions'
import { NUMBER_WORDS } from './numbers'
import type { LanguageAdapter } from './types'

const DASHES = /[-‐-―−]/g
const TYPOGRAPHIC_APOSTROPHES = /[‘’ʼ]/g
const PUNCTUATION = /[^\p{L}\p{N}\s']/gu
/** Apóstrofo que não está entre duas letras: `runnin'`, `'90s`. */
const LOOSE_APOSTROPHE = /(?<!\p{L})'|'(?!\p{L})/gu

function fold(text: string): string {
  return text
    .normalize('NFKC')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(TYPOGRAPHIC_APOSTROPHES, "'")
}

/** Regras de docs/spec/correcao.md §2 para o inglês. */
export const english: LanguageAdapter = {
  tokenize(text, mode) {
    // No tolerante, hífen e travessão separam palavras: `well-known` = `well known`.
    const spaced = mode === 'tolerant' ? text.replace(DASHES, ' ') : text
    return spaced.split(/\s+/).filter(Boolean)
  },

  normalize(word, mode) {
    // O estrito só unifica o apóstrofo (o teclado não digita ’) e a forma dos acentos.
    if (mode === 'strict') return [word.normalize('NFC').replace(TYPOGRAPHIC_APOSTROPHES, "'")]

    const bare = fold(word).replace(PUNCTUATION, '')
    const expanded = CONTRACTION_MAP.get(bare) ?? bare
    return expanded
      .replace(LOOSE_APOSTROPHE, '')
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => NUMBER_WORDS.get(token) ?? token)
  },

  bare(word) {
    return fold(word).replace(PUNCTUATION, '').replaceAll("'", '')
  },

  nearThreshold(token, mode) {
    if (mode === 'strict') return 0
    return token.length <= 4 ? 1 : 2
  },
}
