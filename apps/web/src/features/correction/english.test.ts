import { describe, expect, it } from 'vitest'
import { english } from './english'

const tolerant = (word: string) => english.normalize(word, 'tolerant')
const strict = (word: string) => english.normalize(word, 'strict')

describe('english.tokenize', () => {
  it('separa por espaços, ignorando espaços extras', () => {
    expect(english.tokenize('  Hold on,   the night ', 'tolerant')).toEqual([
      'Hold',
      'on,',
      'the',
      'night',
    ])
  })

  it('no tolerante, hífen e travessão separam palavras', () => {
    expect(english.tokenize('well-known — dream', 'tolerant')).toEqual(['well', 'known', 'dream'])
    expect(english.tokenize('well-known', 'strict')).toEqual(['well-known'])
  })
})

describe('english.normalize (tolerante)', () => {
  it.each([
    ['Like', ['like']],
    ['all.', ['all']],
    ['Café', ['cafe']],
    ['(oh)', ['oh']],
    ["runnin'", ['runnin']],
    ["rock'n'roll", ["rock'n'roll"]],
    ['&', []],
  ])('%s → %j', (word, tokens) => {
    expect(tolerant(word)).toEqual(tokens)
  })

  it('expande contrações, com apóstrofo reto ou tipográfico', () => {
    expect(tolerant('I’ll')).toEqual(['i', 'will'])
    expect(tolerant("We'll,")).toEqual(['we', 'will'])
    expect(tolerant("won't")).toEqual(['will', 'not'])
    expect(tolerant('gonna')).toEqual(['going', 'to'])
    expect(tolerant("'cause")).toEqual(['because'])
  })

  it('aceita contração sem apóstrofo só quando não colide com palavra real', () => {
    expect(tolerant('dont')).toEqual(['do', 'not'])
    expect(tolerant('im')).toEqual(['i', 'am'])
    expect(tolerant('ill')).toEqual(['ill'])
    expect(tolerant('well')).toEqual(['well'])
    expect(tolerant('its')).toEqual(['its'])
    expect(tolerant('cause')).toEqual(['cause'])
  })

  it('números por extenso viram dígitos (até 20 e dezenas)', () => {
    expect(tolerant('two')).toEqual(['2'])
    expect(tolerant('Ten')).toEqual(['10'])
    expect(tolerant('twenty')).toEqual(['20'])
    expect(tolerant('ninety')).toEqual(['90'])
    expect(tolerant('hundred')).toEqual(['hundred'])
  })
})

describe('english.normalize (estrito)', () => {
  it('mantém caixa, acento e pontuação; só unifica apóstrofo e forma Unicode', () => {
    expect(strict('Like')).toEqual(['Like'])
    expect(strict('all.')).toEqual(['all.'])
    expect(strict('I’ll')).toEqual(["I'll"])
    expect(strict('Café')).toEqual(['Café'])
  })
})

describe('english.nearThreshold', () => {
  it('1 até 4 letras, 2 acima; 0 no estrito', () => {
    expect(english.nearThreshold('sea', 'tolerant')).toBe(1)
    expect(english.nearThreshold('come', 'tolerant')).toBe(1)
    expect(english.nearThreshold('radio', 'tolerant')).toBe(2)
    expect(english.nearThreshold('static', 'strict')).toBe(0)
  })
})
