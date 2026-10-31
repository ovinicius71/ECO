import { describe, expect, it } from 'vitest'
import { formatDuration, formatRate } from './time'

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [9.6, '0:10'],
    [221, '3:41'],
    [3725, '1:02:05'],
    [-5, '0:00'],
  ])('%s s → %s', (sec, text) => {
    expect(formatDuration(sec)).toBe(text)
  })
})

describe('formatRate', () => {
  it('usa vírgula e ×', () => {
    expect(formatRate(0.75)).toBe('0,75×')
    expect(formatRate(1)).toBe('1×')
  })
})
