import { english } from '@/features/correction'
import type { Line, Token } from '@/types/song'

interface RawLine {
  index: number
  startMs: number
  endMs: number
  text: string
}

/** Palavras do verso como aparecem na tela, com a forma normalizada para busca/comparação. */
export function tokenizeLine(text: string): Token[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ text: word, norm: english.normalize(word, 'tolerant').join(' ') }))
}

export function toLines(raw: readonly RawLine[]): Line[] {
  return raw.map((line) => ({ ...line, tokens: tokenizeLine(line.text) }))
}

export function countWords(lines: readonly Line[]): number {
  return lines.reduce((sum, line) => sum + line.tokens.length, 0)
}
