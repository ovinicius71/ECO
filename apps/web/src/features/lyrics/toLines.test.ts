import { describe, expect, it } from 'vitest'
import { countWords, tokenizeLine, toLines } from './toLines'

describe('tokenizeLine', () => {
  it('mantém o texto original e guarda a forma normalizada', () => {
    expect(tokenizeLine("We'll be dancing,  when")).toEqual([
      { text: "We'll", norm: 'we will' },
      { text: 'be', norm: 'be' },
      { text: 'dancing,', norm: 'dancing' },
      { text: 'when', norm: 'when' },
    ])
  })
})

describe('toLines', () => {
  it('adiciona tokens a cada verso e conta as palavras', () => {
    const lines = toLines([
      { index: 0, startMs: 12340, endMs: 15800, text: 'I left the window open for the rain' },
      { index: 1, startMs: 15800, endMs: 19420, text: 'Counting cars' },
    ])
    expect(lines[1]).toMatchObject({ index: 1, startMs: 15800, text: 'Counting cars' })
    expect(lines[1]?.tokens.map((t) => t.text)).toEqual(['Counting', 'cars'])
    expect(countWords(lines)).toBe(10)
  })
})
