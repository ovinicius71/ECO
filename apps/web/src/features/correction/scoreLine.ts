import { align } from './align'
import { english } from './english'
import { levenshtein } from './levenshtein'
import type {
  CorrectionMode,
  LanguageAdapter,
  LineScore,
  WordHint,
  WordResult,
  WordStatus,
} from './types'

interface Word {
  text: string
  tokens: string[]
}

interface Token {
  value: string
  /** Índice da palavra original de onde o token veio. */
  word: number
}

interface TokenResult {
  status: WordStatus
  /** Índices dos tokens digitados ligados a este token esperado. */
  typed: number[]
  hint?: 'merge' | 'split'
}

const POINTS: Record<WordStatus, number> = { ok: 1, near: 0.5, wrong: 0, missing: 0 }
const STRICT_EXTRA_PENALTY = 0.25

function split(text: string, mode: CorrectionMode, adapter: LanguageAdapter) {
  const words: Word[] = adapter
    .tokenize(text, mode)
    .map((word) => ({ text: word, tokens: adapter.normalize(word, mode) }))
    .filter((word) => word.tokens.length > 0)
  const tokens: Token[] = words.flatMap((word, index) =>
    word.tokens.map((value) => ({ value, word: index })),
  )
  return { words, tokens }
}

/**
 * Compara o verso esperado com o digitado (docs/spec/correcao.md).
 * O status sai por palavra **original** esperada; a nota é a média dos pontos dessas palavras.
 */
export function scoreLine(
  expected: string,
  typed: string,
  mode: CorrectionMode,
  adapter: LanguageAdapter = english,
): LineScore {
  const exp = split(expected, mode, adapter)
  const typ = split(typed, mode, adapter)

  const ops = align(exp.tokens.length, typ.tokens.length, (i, j) => {
    const e = exp.tokens[i]!.value
    const t = typ.tokens[j]!.value
    if (e === t) return 0
    const threshold = adapter.nearThreshold(e, mode)
    return threshold > 0 && levenshtein(e, t) <= threshold ? 0.5 : 1
  })

  const results: TokenResult[] = exp.tokens.map(() => ({ status: 'missing', typed: [] }))
  const extra = new Set<number>()
  for (const op of ops) {
    if (op.kind === 'pair') {
      const status = op.cost === 0 ? 'ok' : op.cost < 1 ? 'near' : 'wrong'
      results[op.expected] = { status, typed: [op.typed] }
    } else if (op.kind === 'extra') {
      extra.add(op.typed)
    }
  }

  // Junção conta se a concatenação for igual ou "quase" (all+most≈almost); no estrito, só igual.
  const joins = (joined: string, target: string) =>
    levenshtein(joined, target) <= adapter.nearThreshold(target, mode)
  detectJoins(exp.tokens, typ.tokens, results, extra, joins, mode === 'tolerant' ? 'near' : 'wrong')

  const words = exp.words.map((word, index) => {
    const own = results.filter((_, e) => exp.tokens[e]!.word === index)
    const typedWords = [...new Set(own.flatMap((r) => r.typed).map((t) => typ.tokens[t]!.word))]
    const typedText = typedWords.map((w) => typ.words[w]!.text).join(' ') || undefined
    return toWordResult(word, own, typedText)
  })

  const extras = typ.words
    .filter((_, index) => typ.tokens.every((t, j) => t.word !== index || extra.has(j)))
    .map((word) => word.text)

  if (words.length === 0) return { words, extras, score: 1 }
  let points = words.reduce((sum, word) => sum + POINTS[word.status], 0)
  if (mode === 'strict') points -= STRICT_EXTRA_PENALTY * extras.length
  return { words, extras, score: Math.max(0, points) / words.length }
}

/**
 * Junção e separação, que o alinhamento sozinho não reconhece:
 * - merge: "all most" digitado para "almost" (um par + um extra vizinho);
 * - split: "everybody" digitado para "every body" (um par + um faltando vizinho).
 */
function detectJoins(
  exp: Token[],
  typ: Token[],
  results: TokenResult[],
  extra: Set<number>,
  joins: (joined: string, target: string) => boolean,
  status: WordStatus,
) {
  results.forEach((result, e) => {
    if (result.status === 'ok' || result.hint || result.typed.length !== 1) return
    const t = result.typed[0]!

    for (const other of [t - 1, t + 1]) {
      if (!extra.has(other)) continue
      const [first, second] = other < t ? [other, t] : [t, other]
      if (joins(typ[first]!.value + typ[second]!.value, exp[e]!.value)) {
        results[e] = { status, typed: [first, second], hint: 'merge' }
        extra.delete(other)
        return
      }
    }

    for (const other of [e - 1, e + 1]) {
      if (results[other]?.status !== 'missing') continue
      const [first, second] = other < e ? [other, e] : [e, other]
      if (joins(exp[first]!.value + exp[second]!.value, typ[t]!.value)) {
        results[first] = { status, typed: [t], hint: 'split' }
        results[second] = { status, typed: [], hint: 'split' }
        return
      }
    }
  })
}

/** Status da palavra original a partir dos seus tokens (contrações têm vários). */
function combine(statuses: WordStatus[]): WordStatus {
  if (statuses.every((s) => s === 'ok')) return 'ok'
  if (statuses.some((s) => s === 'ok' || s === 'near')) return 'near'
  return statuses.every((s) => s === 'missing') ? 'missing' : 'wrong'
}

const hasDigit = (text: string) => /\p{N}/u.test(text)

function toWordResult(word: Word, own: TokenResult[], typed: string | undefined): WordResult {
  const status = combine(own.map((r) => r.status))
  let hint: WordHint | undefined = own.find((r) => r.hint)?.hint
  if (!hint && word.tokens.length > 1 && (status === 'near' || status === 'wrong')) {
    hint = 'contraction'
  }
  if (!hint && status === 'ok' && typed && hasDigit(word.text) !== hasDigit(typed)) hint = 'number'

  const result: WordResult = { expected: word.text, status }
  if (typed) result.typed = typed
  if (hint) result.hint = hint
  return result
}
