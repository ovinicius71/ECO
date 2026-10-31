import { describe, expect, it } from 'vitest'
import {
  dictationReducer,
  dictationStats,
  firstLettersHint,
  initialDictation,
  scoreAttempts,
  type DictationAction,
  type DictationState,
} from './session'

// Versos inventados (fixture "Paper Moon Radio").
const LINES = [
  { text: 'Like a radio that plays it all' },
  { text: 'Hold on, the night is almost gone' },
  { text: 'So call my name across the static sea' },
]

const run = (actions: DictationAction[], state: DictationState = initialDictation(LINES.length)) =>
  actions.reduce(dictationReducer, state)

describe('dictationReducer', () => {
  it('começa pronto e só responde depois do start', () => {
    const ready = initialDictation(3)
    expect(ready.phase).toBe('ready')
    expect(dictationReducer(ready, { type: 'submit', typed: 'x' })).toBe(ready)
    expect(run([{ type: 'start' }]).phase).toBe('answering')
  })

  it('verso a verso: confirma, mostra a correção e avança', () => {
    const state = run([
      { type: 'start' },
      { type: 'replay' },
      { type: 'replay' },
      { type: 'hint' },
      { type: 'submit', typed: 'like a radyo that play it all' },
    ])
    expect(state.phase).toBe('checked')
    expect(state.attempts).toEqual([
      {
        lineIndex: 0,
        typed: 'like a radyo that play it all',
        skipped: false,
        replays: 2,
        hintUsed: true,
      },
    ])

    const next = dictationReducer(state, { type: 'next' })
    expect(next).toMatchObject({ phase: 'answering', target: 1, replays: 0, hintUsed: false })
  })

  it('pular registra o verso vazio e vai direto ao próximo', () => {
    const state = run([{ type: 'start' }, { type: 'skip' }])
    expect(state).toMatchObject({ phase: 'answering', target: 1 })
    expect(state.attempts[0]).toMatchObject({ lineIndex: 0, skipped: true, typed: '' })
  })

  it('termina depois do último verso e reinicia do zero', () => {
    const finished = run([
      { type: 'start' },
      { type: 'submit', typed: 'a' },
      { type: 'next' },
      { type: 'skip' },
      { type: 'submit', typed: 'c' },
      { type: 'next' },
    ])
    expect(finished.phase).toBe('finished')
    expect(finished.attempts.map((a) => a.lineIndex)).toEqual([0, 1, 2])

    expect(dictationReducer(finished, { type: 'restart' })).toEqual(initialDictation(3))
  })

  it('pratica só os versos escolhidos, na ordem dada', () => {
    const state = run(
      [{ type: 'start' }, { type: 'skip' }, { type: 'submit', typed: 'x' }, { type: 'next' }],
      initialDictation([2, 0]),
    )
    expect(state.phase).toBe('finished')
    expect(state.attempts.map((a) => a.lineIndex)).toEqual([2, 0])
    expect(dictationReducer(state, { type: 'restart' }).order).toEqual([2, 0])
  })

  it('ignora ações fora de hora', () => {
    const checked = run([{ type: 'start' }, { type: 'submit', typed: 'x' }])
    expect(dictationReducer(checked, { type: 'replay' })).toBe(checked)
    expect(dictationReducer(checked, { type: 'skip' })).toBe(checked)
    expect(dictationReducer(initialDictation(0), { type: 'start' }).phase).toBe('ready')
  })
})

describe('scoreAttempts e dictationStats', () => {
  const attempts = run([
    { type: 'start' },
    { type: 'replay' },
    { type: 'submit', typed: 'like a radyo that play it all' },
    { type: 'next' },
    { type: 'hint' },
    { type: 'skip' },
  ]).attempts

  it('corrige com o modo atual e pulado vale 0', () => {
    const scored = scoreAttempts(attempts, LINES, 'tolerant')
    expect(scored[0]?.result.score).toBeCloseTo(6 / 7)
    expect(scored[1]?.result.score).toBe(0)
  })

  it('trocar para estrita recalcula', () => {
    const strict = scoreAttempts(attempts, LINES, 'strict')
    expect(strict[0]?.result.score).toBeLessThan(6 / 7)
  })

  it('estatísticas da sessão', () => {
    const stats = dictationStats(scoreAttempts(attempts, LINES, 'tolerant'))
    expect(stats.accuracy).toBeCloseTo(6 / 7 / 2)
    expect(stats.words).toEqual({ ok: 5, near: 2, wrong: 0, missing: 7, total: 14 })
    expect(stats).toMatchObject({ replays: 1, hints: 1, skipped: 1 })
  })

  it('sem tentativas, sem precisão', () => {
    expect(dictationStats([]).accuracy).toBeNull()
  })
})

describe('firstLettersHint', () => {
  it('1ª letra de cada palavra, mantendo palavras de uma letra', () => {
    expect(firstLettersHint('Like a radio that plays it all')).toBe('L… a r… t… p… i… a…')
    expect(firstLettersHint('Hold on, the night')).toBe('H… o… t… n…')
    expect(firstLettersHint("I'll be")).toBe('I… b…')
  })
})
