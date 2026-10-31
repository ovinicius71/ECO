import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DICTATION_SETTINGS,
  dictationQuery,
  parseDictationSettings,
  seekPointFor,
  settingsFromLabels,
} from './settings'

describe('ajustes do ditado', () => {
  it('ida e volta pela query string', () => {
    const settings = { pauseAtEnd: false, rate: 0.75, correction: 'strict' as const }
    const query = dictationQuery(settings)
    expect(query).toBe('pausa=desligada&velocidade=0.75&correcao=estrita')
    expect(parseDictationSettings(new URLSearchParams(query))).toEqual(settings)
  })

  it('query vazia ou inválida usa o padrão', () => {
    expect(parseDictationSettings(new URLSearchParams(''))).toEqual(DEFAULT_DICTATION_SETTINGS)
    expect(parseDictationSettings(new URLSearchParams('velocidade=3')).rate).toBe(1)
  })

  it('converte os rótulos escolhidos no Setup', () => {
    expect(
      settingsFromLabels({ pause: 'Desligada', speed: '0,5×', correction: 'Estrita' }),
    ).toEqual({ pauseAtEnd: false, rate: 0.5, correction: 'strict' })
    expect(settingsFromLabels({})).toEqual(DEFAULT_DICTATION_SETTINGS)
  })
})

describe('seekPointFor', () => {
  const lines = [
    { startMs: 12_340, endMs: 15_800 },
    { startMs: 15_800, endMs: 19_420 }, // colado no anterior
    { startMs: 31_550, endMs: 35_020 }, // depois de um intervalo
  ]

  it('recua o pedido quando há espaço', () => {
    expect(seekPointFor(lines, 0, 1_000)).toBe(11_340)
    expect(seekPointFor(lines, 2, 300)).toBe(31_250)
  })

  it('não volta além do fim do verso anterior', () => {
    expect(seekPointFor(lines, 1, 300)).toBe(15_800)
  })

  it('nunca negativo e 0 para índice inválido', () => {
    expect(seekPointFor([{ startMs: 200, endMs: 900 }], 0, 1_000)).toBe(0)
    expect(seekPointFor(lines, 9, 300)).toBe(0)
  })
})
