import { describe, expect, it } from 'vitest'
import {
  clampOffset,
  findLineIndex,
  formatOffset,
  lastStartedIndex,
  lineGuard,
  toLyricMs,
  toVideoMs,
} from './sync'

// Tempos da fixture inventada "Paper Moon Radio" (intervalo instrumental entre 26,1 s e 31,55 s).
const LINES = [
  { startMs: 12_340, endMs: 15_800 },
  { startMs: 15_800, endMs: 19_420 },
  { startMs: 22_900, endMs: 26_100 },
  { startMs: 31_550, endMs: 35_020 },
]

describe('offset', () => {
  it('positivo adianta a letra', () => {
    expect(toLyricMs(12_000, 400)).toBe(12_400)
    expect(toVideoMs(12_400, 400)).toBe(12_000)
    expect(toVideoMs(100, 400)).toBe(0)
  })

  it('arredonda ao passo de 0,1 s e limita a ±10 s', () => {
    expect(clampOffset(449)).toBe(400)
    expect(clampOffset(-451)).toBe(-500)
    expect(clampOffset(12_000)).toBe(10_000)
    expect(clampOffset(-99_999)).toBe(-10_000)
  })

  it.each([
    [400, '+0,4 s'],
    [-400, '−0,4 s'],
    [0, '0,0 s'],
    [1_500, '+1,5 s'],
  ])('%i ms → %s', (ms, text) => {
    expect(formatOffset(ms)).toBe(text)
  })
})

describe('findLineIndex', () => {
  it.each([
    [0, -1], // antes do primeiro verso
    [12_340, 0], // início exato
    [15_799, 0],
    [15_800, 1], // fim de um = início do outro
    [20_000, -1], // intervalo entre versos
    [28_000, -1], // intervalo instrumental
    [31_550, 3],
    [40_000, -1], // depois do último
  ])('%i ms → verso %i', (ms, index) => {
    expect(findLineIndex(LINES, ms)).toBe(index)
  })

  it('lista vazia', () => {
    expect(findLineIndex([], 1_000)).toBe(-1)
  })
})

describe('lastStartedIndex', () => {
  it('no intervalo, devolve o último verso que começou (para o ↺ Verso)', () => {
    expect(lastStartedIndex(LINES, 28_000)).toBe(2)
    expect(lastStartedIndex(LINES, 5_000)).toBe(-1)
  })
})

describe('lineGuard', () => {
  const line = LINES[0]

  it('loop volta ao início quando cruza o fim', () => {
    expect(lineGuard(line, 15_700, 15_760, 'loop')).toEqual({ kind: 'seek', lyricMs: 12_340 })
  })

  it('pausa no fim do verso', () => {
    expect(lineGuard(line, 15_700, 15_760, 'pause-at-end')).toEqual({ kind: 'pause' })
  })

  it('não age antes do fim, depois de já ter passado, nem desligado', () => {
    expect(lineGuard(line, 15_000, 15_100, 'loop')).toEqual({ kind: 'none' })
    expect(lineGuard(line, 15_800, 15_900, 'pause-at-end')).toEqual({ kind: 'none' })
    expect(lineGuard(line, 15_700, 15_760, 'off')).toEqual({ kind: 'none' })
    expect(lineGuard(undefined, 15_700, 15_760, 'loop')).toEqual({ kind: 'none' })
  })

  it('um salto grande (seek do usuário) não conta como passagem', () => {
    expect(lineGuard(line, 1_000, 30_000, 'pause-at-end')).toEqual({ kind: 'none' })
  })
})
