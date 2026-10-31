import { describe, expect, it } from 'vitest'
import { scoreLine } from './scoreLine'
import type { WordResult } from './types'

// Versos inventados (fixture "Paper Moon Radio"), nunca letras reais.
const statuses = (words: WordResult[]) =>
  Object.fromEntries(words.map((w) => [w.expected, w.status]))

const byWord = (words: WordResult[], expected: string) => words.find((w) => w.expected === expected)

describe('scoreLine — casos obrigatórios da spec (§5)', () => {
  it('radio/plays quase; resto ok; nota 6/7', () => {
    const r = scoreLine(
      'Like a radio that plays it all',
      'like a radyo that play it all',
      'tolerant',
    )
    expect(statuses(r.words)).toEqual({
      Like: 'ok',
      a: 'ok',
      radio: 'near',
      that: 'ok',
      plays: 'near',
      it: 'ok',
      all: 'ok',
    })
    expect(r.score).toBeCloseTo(6 / 7)
  })

  it('pontuação e caixa são ignoradas no tolerante', () => {
    const r = scoreLine(
      'Like a radio that plays it all',
      'Like a radio that plays it all.',
      'tolerant',
    )
    expect(r.words.every((w) => w.status === 'ok')).toBe(true)
    expect(r.score).toBe(1)
  })

  it('no estrito, a caixa conta', () => {
    const r = scoreLine(
      'Like a radio that plays it all',
      'like a radio that plays it all',
      'strict',
    )
    expect(byWord(r.words, 'Like')?.status).toBe('wrong')
    expect(r.words.filter((w) => w.status !== 'ok')).toHaveLength(1)
  })

  it('"ill" para "I’ll" é quase (apóstrofo faltando)', () => {
    const r = scoreLine('I’ll be the echo', 'ill be the echo', 'tolerant')
    expect(byWord(r.words, 'I’ll')).toEqual({
      expected: 'I’ll',
      typed: 'ill',
      status: 'near',
      hint: 'contraction',
    })
    expect(r.words.slice(1).every((w) => w.status === 'ok')).toBe(true)
  })

  it('contração expandida pelo usuário vale como certa', () => {
    const r = scoreLine('I’ll be the echo', 'i will be the echo', 'tolerant')
    expect(r.words.every((w) => w.status === 'ok')).toBe(true)
    expect(r.extras).toEqual([])
  })

  it('"all most" para "almost": quase com dica de junção, sem extras', () => {
    const r = scoreLine(
      'Hold on, the night is almost gone',
      'hold on the night is all most gone',
      'tolerant',
    )
    expect(byWord(r.words, 'almost')).toEqual({
      expected: 'almost',
      typed: 'all most',
      status: 'near',
      hint: 'merge',
    })
    expect(r.extras).toEqual([])
  })

  it('"comes" para "come" é quase', () => {
    const r = scoreLine(
      'Counting cars that never come my way',
      'counting cars that never comes my way',
      'tolerant',
    )
    expect(byWord(r.words, 'come')?.status).toBe('near')
  })

  it('static/sea: quase no tolerante (limite 2 e 1), errado no estrito', () => {
    const expected = 'So call my name across the static sea'
    const typed = 'so call my name across the stating see'

    const tolerant = scoreLine(expected, typed, 'tolerant')
    expect(byWord(tolerant.words, 'static')?.status).toBe('near')
    expect(byWord(tolerant.words, 'sea')?.status).toBe('near')

    const strict = scoreLine(expected, typed, 'strict')
    expect(byWord(strict.words, 'static')?.status).toBe('wrong')
    expect(byWord(strict.words, 'sea')?.status).toBe('wrong')
  })

  it('"We’ll" sem o "will" é quase; "the" faltando', () => {
    const r = scoreLine(
      'We’ll be dancing when the lights come on',
      'we be dancing when lights come on',
      'tolerant',
    )
    expect(byWord(r.words, 'We’ll')).toMatchObject({ status: 'near', typed: 'we' })
    expect(byWord(r.words, 'the')).toEqual({ expected: 'the', status: 'missing' })
  })

  it('"2" para "two" está certo, com dica de número', () => {
    const r = scoreLine('two hearts', '2 hearts', 'tolerant')
    expect(r.words[0]).toEqual({ expected: 'two', typed: '2', status: 'ok', hint: 'number' })
    expect(r.score).toBe(1)
  })
})

describe('scoreLine — extras e nota', () => {
  it('extras aparecem, mas não descontam no tolerante', () => {
    const r = scoreLine('I left the window open', 'I left the big window open now', 'tolerant')
    expect(r.extras).toEqual(['big', 'now'])
    expect(r.score).toBe(1)
  })

  it('no estrito, cada extra desconta 0,25 e a nota não fica negativa', () => {
    expect(scoreLine('open', 'open wide', 'strict').score).toBeCloseTo(0.75)
    expect(scoreLine('open', 'x y z w v', 'strict').score).toBe(0)
  })

  it('nada digitado: tudo faltando, nota 0', () => {
    const r = scoreLine('for the rain', '', 'tolerant')
    expect(r.words.map((w) => w.status)).toEqual(['missing', 'missing', 'missing'])
    expect(r.score).toBe(0)
  })

  it('verso sem palavras (instrumental) vale 1', () => {
    expect(scoreLine('', '', 'tolerant')).toEqual({ words: [], extras: [], score: 1 })
  })

  it('no empate, prefere acertar a palavra a parear errado', () => {
    const r = scoreLine('we will be', 'we be here', 'tolerant')
    expect(statuses(r.words)).toEqual({ we: 'ok', will: 'missing', be: 'ok' })
    expect(r.extras).toEqual(['here'])
  })
})

describe('scoreLine — junção, separação e contrações', () => {
  it('separação: "everybody" para "every body" marca as duas com dica', () => {
    const r = scoreLine('every body moves', 'everybody moves', 'tolerant')
    expect(r.words.slice(0, 2)).toEqual([
      { expected: 'every', typed: 'everybody', status: 'near', hint: 'split' },
      { expected: 'body', status: 'near', hint: 'split' },
    ])
  })

  it('junção no estrito vira erro, mas mantém a dica (só com concatenação exata)', () => {
    const exact = scoreLine('everybody moves', 'every body moves', 'strict')
    expect(exact.words[0]).toMatchObject({ status: 'wrong', hint: 'merge', typed: 'every body' })

    const almost = scoreLine('almost gone', 'all most gone', 'strict')
    expect(almost.words[0]).toMatchObject({ status: 'wrong', typed: 'most' })
    expect(almost.words[0]?.hint).toBeUndefined()
  })

  it('limitação conhecida: números normalizados não entram na junção ("any one" × "anyone")', () => {
    const r = scoreLine('any one of us', 'anyone of us', 'tolerant')
    expect(r.words[0]?.hint).toBeUndefined()
  })

  it('contração sem apóstrofo vale no tolerante quando não é ambígua', () => {
    expect(scoreLine("Don't let go", 'dont let go', 'tolerant').score).toBe(1)
  })

  it('palavra esperada só de pontuação é ignorada no tolerante', () => {
    const r = scoreLine('rain & thunder', 'rain thunder', 'tolerant')
    expect(r.words.map((w) => w.expected)).toEqual(['rain', 'thunder'])
    expect(r.score).toBe(1)
  })

  it('o estrito aceita apóstrofo reto no lugar do tipográfico', () => {
    expect(scoreLine('I’ll be the echo', "I'll be the echo", 'strict').score).toBe(1)
  })
})
