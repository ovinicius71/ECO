import { scoreLine, type CorrectionMode, type LineScore } from '@/features/correction'

// Estado de uma sessão de Ditado (lógica pura, sem player e sem React).

export interface DictationAttempt {
  lineIndex: number
  typed: string
  skipped: boolean
  replays: number
  hintUsed: boolean
}

export type DictationPhase = 'ready' | 'answering' | 'checked' | 'finished'

export interface DictationState {
  phase: DictationPhase
  /** Posição em `order` do verso que o usuário está respondendo (não é o verso tocando). */
  target: number
  /** Índices dos versos da música a praticar, em ordem (todos, ou só os escolhidos). */
  order: number[]
  lineCount: number
  attempts: DictationAttempt[]
  /** "Ouvir de novo" e dica do verso-alvo atual. */
  replays: number
  hintUsed: boolean
}

export type DictationAction =
  | { type: 'start' }
  | { type: 'replay' }
  | { type: 'hint' }
  | { type: 'submit'; typed: string }
  | { type: 'skip' }
  | { type: 'next' }
  | { type: 'restart' }

/** `lines`: quantos versos a música tem, ou a lista dos índices a praticar. */
export function initialDictation(lines: number | readonly number[]): DictationState {
  const order = typeof lines === 'number' ? Array.from({ length: lines }, (_, i) => i) : [...lines]
  return {
    phase: 'ready',
    target: 0,
    order,
    lineCount: order.length,
    attempts: [],
    replays: 0,
    hintUsed: false,
  }
}

/** Índice (na música) do verso que está sendo respondido. */
export const targetLine = (state: DictationState) => state.order[state.target] ?? 0

function record(state: DictationState, typed: string, skipped: boolean): DictationAttempt[] {
  return [
    ...state.attempts,
    {
      lineIndex: targetLine(state),
      typed,
      skipped,
      replays: state.replays,
      hintUsed: state.hintUsed,
    },
  ]
}

function advance(state: DictationState, attempts: DictationAttempt[]): DictationState {
  const target = state.target + 1
  if (target >= state.lineCount) return { ...state, attempts, phase: 'finished' }
  return { ...state, attempts, target, phase: 'answering', replays: 0, hintUsed: false }
}

export function dictationReducer(state: DictationState, action: DictationAction): DictationState {
  switch (action.type) {
    case 'start':
      return state.phase === 'ready' && state.lineCount > 0
        ? { ...state, phase: 'answering' }
        : state
    case 'replay':
      return state.phase === 'answering' ? { ...state, replays: state.replays + 1 } : state
    case 'hint':
      return state.phase === 'answering' ? { ...state, hintUsed: true } : state
    case 'submit':
      return state.phase === 'answering'
        ? { ...state, attempts: record(state, action.typed, false), phase: 'checked' }
        : state
    case 'skip':
      return state.phase === 'answering' ? advance(state, record(state, '', true)) : state
    case 'next':
      return state.phase === 'checked' ? advance(state, state.attempts) : state
    case 'restart':
      return initialDictation(state.order)
  }
}

export interface ScoredAttempt extends DictationAttempt {
  result: LineScore
}

/** Corrige todas as tentativas com o modo atual (trocar tolerante/estrita recalcula tudo). */
export function scoreAttempts(
  attempts: readonly DictationAttempt[],
  lines: readonly { text: string }[],
  mode: CorrectionMode,
): ScoredAttempt[] {
  return attempts.map((attempt) => {
    const expected = lines[attempt.lineIndex]?.text ?? ''
    const result = scoreLine(expected, attempt.typed, mode)
    // Pular vale 0, mesmo se o verso não tiver palavras.
    return { ...attempt, result: attempt.skipped ? { ...result, score: 0 } : result }
  })
}

export interface DictationStats {
  /** Média das notas dos versos respondidos (pulados contam 0); null sem tentativas. */
  accuracy: number | null
  words: { ok: number; near: number; wrong: number; missing: number; total: number }
  replays: number
  hints: number
  skipped: number
}

export function dictationStats(scored: readonly ScoredAttempt[]): DictationStats {
  const words = { ok: 0, near: 0, wrong: 0, missing: 0, total: 0 }
  for (const attempt of scored) {
    for (const word of attempt.result.words) {
      words[word.status] += 1
      words.total += 1
    }
  }
  const sum = scored.reduce((total, attempt) => total + attempt.result.score, 0)
  return {
    accuracy: scored.length ? sum / scored.length : null,
    words,
    replays: scored.reduce((total, attempt) => total + attempt.replays, 0),
    hints: scored.filter((attempt) => attempt.hintUsed).length,
    skipped: scored.filter((attempt) => attempt.skipped).length,
  }
}

/** Dica: 1ª letra de cada palavra ("Like a radio" → "L… a r…"). */
export function firstLettersHint(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const letters = [...word.replace(/[^\p{L}\p{N}']/gu, '')]
      if (letters.length <= 1) return letters.join('') || word
      return `${letters[0]}…`
    })
    .join(' ')
}
