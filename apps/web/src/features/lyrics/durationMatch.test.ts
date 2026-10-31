import { describe, expect, it } from 'vitest'
import { durationMismatch, findDurationMatch } from './durationMatch'

describe('durationMismatch', () => {
  it.each([
    [221, 221_000, false],
    [221, 223_000, false], // dentro de ±2 s
    [215, 221_000, true],
    [0, 221_000, false], // sem duração da letra: não dá para comparar
    [221, 0, false], // player ainda sem duração
  ])('letra %i s × vídeo %i ms → %s', (lyricsSec, videoMs, expected) => {
    expect(durationMismatch(lyricsSec, videoMs)).toBe(expected)
  })
})

describe('findDurationMatch', () => {
  const candidates = [
    { lrclibId: 1, durationSec: 215, synced: true },
    { lrclibId: 2, durationSec: 222, synced: false },
    { lrclibId: 3, durationSec: 222.5, synced: true },
    { lrclibId: 4, durationSec: 221, synced: true },
  ]

  it('prefere sincronizada e depois a duração mais próxima', () => {
    expect(findDurationMatch(candidates, 221_000)?.lrclibId).toBe(4)
  })

  it('ignora a versão atual e as fora da tolerância', () => {
    expect(findDurationMatch(candidates, 221_000, 4)?.lrclibId).toBe(3)
    expect(findDurationMatch(candidates, 300_000)).toBeUndefined()
  })
})
