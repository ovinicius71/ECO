import type { LineScore, WordResult } from '@/features/correction'

/**
 * Nota curta para "versos para rever", a partir do resultado da correção (sem inventar
 * gramática). Mostra o primeiro problema do verso; null se o verso está todo certo.
 */
export function reviewNote(words: readonly WordResult[]): string | null {
  const word = words.find((w) => w.status !== 'ok')
  if (!word) return null
  const typed = word.typed ? `“${word.typed}”` : ''
  if (word.hint === 'merge') return `Você escreveu ${typed} — “${word.expected}” é uma palavra só.`
  if (word.hint === 'split') return `Você escreveu ${typed} — são duas palavras.`
  switch (word.status) {
    case 'near':
      return `Você escreveu ${typed} — quase: “${word.expected}”.`
    case 'wrong':
      return `Você escreveu ${typed} no lugar de “${word.expected}”.`
    default:
      return `Faltou “${word.expected}”.`
  }
}

export type BarKind = 'ok' | 'near' | 'error'

/** Cor da barra do verso: erro se houver errada/faltando; quase se só houver quase. */
export function barKind(result: LineScore, skipped: boolean): BarKind {
  if (skipped || result.words.some((w) => w.status === 'wrong' || w.status === 'missing')) {
    return 'error'
  }
  return result.words.some((w) => w.status === 'near') ? 'near' : 'ok'
}
