import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PlayerEngine } from './engine'
import { usePracticeShortcuts } from './usePracticeShortcuts'

function fakeEngine() {
  return {
    togglePlay: vi.fn(),
    stepRate: vi.fn(),
    replayLine: vi.fn(),
  } as unknown as PlayerEngine
}

function Harness({
  engine,
  options,
}: {
  engine: PlayerEngine
  options?: Parameters<typeof usePracticeShortcuts>[1]
}) {
  usePracticeShortcuts(engine, options)
  return (
    <>
      <input aria-label="resposta" />
      <button type="button">outro</button>
    </>
  )
}

describe('usePracticeShortcuts', () => {
  it('Ctrl+Espaço e Ctrl+↓/↑', async () => {
    const engine = fakeEngine()
    render(<Harness engine={engine} />)

    await userEvent.keyboard('{Control>}{ }{/Control}')
    expect(engine.togglePlay).toHaveBeenCalledOnce()

    await userEvent.keyboard('{Control>}{ArrowDown}{/Control}{Control>}{ArrowUp}{/Control}')
    expect(engine.stepRate).toHaveBeenNthCalledWith(1, -1)
    expect(engine.stepRate).toHaveBeenNthCalledWith(2, 1)
  })

  it('Tab repete o verso quando se está digitando, mas não rouba o foco dos botões', async () => {
    const engine = fakeEngine()
    const { getByLabelText, getByRole } = render(<Harness engine={engine} />)

    getByLabelText('resposta').focus()
    await userEvent.tab()
    expect(engine.replayLine).toHaveBeenCalledOnce()
    expect(getByLabelText('resposta')).toHaveFocus()

    getByRole('button', { name: 'outro' }).focus()
    await userEvent.tab()
    expect(engine.replayLine).toHaveBeenCalledOnce()

    getByLabelText('resposta').focus()
    await userEvent.tab({ shift: true })
    expect(engine.replayLine).toHaveBeenCalledOnce()
  })

  it('aceita um "repetir" próprio e a dica com Ctrl+H', async () => {
    const engine = fakeEngine()
    const onReplay = vi.fn()
    const onHint = vi.fn()
    const { getByLabelText } = render(<Harness engine={engine} options={{ onReplay, onHint }} />)

    getByLabelText('resposta').focus()
    await userEvent.tab()
    await userEvent.keyboard('{Control>}h{/Control}')
    expect(onReplay).toHaveBeenCalledOnce()
    expect(engine.replayLine).not.toHaveBeenCalled()
    expect(onHint).toHaveBeenCalledOnce()
  })
})
