import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPlayerEngine, type PlayerEngine } from './engine'
import { useOffsetPersistence } from './useOffsetPersistence'

function Harness({ engine, save }: { engine: PlayerEngine; save: () => Promise<void> }) {
  useOffsetPersistence(engine, 'abcdefghijk', save)
  return null
}

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('useOffsetPersistence', () => {
  it('salva o último valor depois de 500 ms parado', () => {
    const engine = createPlayerEngine([], { schedule: () => 1, cancel: () => {} })
    const save = vi.fn(async () => {})
    render(<Harness engine={engine} save={save} />)

    act(() => {
      engine.setOffset(100)
      engine.setOffset(200)
      engine.setOffset(300)
    })
    vi.advanceTimersByTime(499)
    expect(save).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(save).toHaveBeenCalledExactlyOnceWith('abcdefghijk', 300)
  })
})
