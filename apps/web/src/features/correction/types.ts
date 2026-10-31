export type CorrectionMode = 'tolerant' | 'strict'

export type WordStatus = 'ok' | 'near' | 'wrong' | 'missing'

export type WordHint = 'merge' | 'split' | 'number' | 'contraction'

export interface WordResult {
  /** Palavra esperada, como aparece na letra. */
  expected: string
  /** O que o usuário digitou no lugar dela (palavras originais). */
  typed?: string
  status: WordStatus
  hint?: WordHint
}

export interface LineScore {
  words: WordResult[]
  /** Palavras digitadas que não correspondem a nenhuma esperada. */
  extras: string[]
  /** 0..1 */
  score: number
}

/** O que muda por idioma. O japonês (Parte 14) implementa o mesmo contrato. */
export interface LanguageAdapter {
  /** Separa o verso nas palavras originais, como aparecem na tela. */
  tokenize(text: string, mode: CorrectionMode): string[]
  /** Transforma uma palavra original em 0+ tokens comparáveis (contrações viram vários). */
  normalize(word: string, mode: CorrectionMode): string[]
  /** Maior distância de edição que ainda conta como "quase" para este token esperado. */
  nearThreshold(token: string, mode: CorrectionMode): number
}
