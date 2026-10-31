import { describe, expect, it } from 'vitest'
import { align } from './align'
import { levenshtein } from './levenshtein'

describe('levenshtein', () => {
  it.each([
    ['radio', 'radio', 0],
    ['radio', 'radyo', 1],
    ['plays', 'play', 1],
    ['static', 'stating', 2],
    ['almost', 'most', 2],
    ['', 'echo', 4],
    ['echo', '', 4],
  ])('%s × %s = %i', (a, b, distance) => {
    expect(levenshtein(a, b)).toBe(distance)
    expect(levenshtein(b, a)).toBe(distance)
  })
})

/** Custo 0 se igual, 0,5 se começa igual (só para o teste), 1 caso contrário. */
function alignWords(expected: string[], typed: string[]) {
  return align(expected.length, typed.length, (i, j) => {
    const e = expected[i] ?? ''
    const t = typed[j] ?? ''
    if (e === t) return 0
    return e[0] === t[0] ? 0.5 : 1
  })
}

describe('align', () => {
  it('pareia tudo quando as listas são iguais', () => {
    expect(alignWords(['a', 'b'], ['a', 'b'])).toEqual([
      { kind: 'pair', expected: 0, typed: 0, cost: 0 },
      { kind: 'pair', expected: 1, typed: 1, cost: 0 },
    ])
  })

  it('no empate de custo, prefere o caminho com mais acertos exatos', () => {
    // will≈be + be≈here custa 2, igual a faltando + igual + extra; o segundo acerta "be".
    expect(alignWords(['we', 'will', 'be'], ['we', 'be', 'here'])).toEqual([
      { kind: 'pair', expected: 0, typed: 0, cost: 0 },
      { kind: 'missing', expected: 1 },
      { kind: 'pair', expected: 2, typed: 1, cost: 0 },
      { kind: 'extra', typed: 2 },
    ])
  })

  it('prefere um quase a faltando + extra', () => {
    expect(alignWords(['radio'], ['radyo'])).toEqual([
      { kind: 'pair', expected: 0, typed: 0, cost: 0.5 },
    ])
  })

  it('lida com listas vazias', () => {
    expect(alignWords([], [])).toEqual([])
    expect(alignWords(['a'], [])).toEqual([{ kind: 'missing', expected: 0 }])
    expect(alignWords([], ['a'])).toEqual([{ kind: 'extra', typed: 0 }])
  })

  it('par errado (1) vence faltando + extra (2)', () => {
    expect(alignWords(['x'], ['y'])).toEqual([{ kind: 'pair', expected: 0, typed: 0, cost: 1 }])
  })
})
