import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlayerBar } from './PlayerBar'

function setup(overrides: Partial<Parameters<typeof PlayerBar>[0]> = {}) {
  const props = {
    playing: false,
    currentMs: 24_000,
    durationMs: 221_000,
    rate: 1,
    rates: [0.5, 0.75, 1],
    onTogglePlay: vi.fn(),
    onSeek: vi.fn(),
    onReplayLine: vi.fn(),
    onRateChange: vi.fn(),
    ...overrides,
  }
  render(<PlayerBar {...props} />)
  return props
}

describe('PlayerBar', () => {
  it('play/pausa com nome acessível conforme o estado', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Tocar' }))
    expect(props.onTogglePlay).toHaveBeenCalledOnce()
  })

  it('mostra o tempo e a linha do tempo com texto acessível', () => {
    setup({ playing: true })
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()
    const timeline = screen.getByRole('slider', { name: 'Linha do tempo' })
    expect(timeline).toHaveAttribute('aria-valuetext', '0:24 de 3:41')
    expect(screen.getByText('3:41')).toBeInTheDocument()
  })

  it('arrastar e as setas da linha do tempo fazem seek (setas de 5 s)', () => {
    const props = setup()
    const timeline = screen.getByRole('slider', { name: 'Linha do tempo' })

    fireEvent.change(timeline, { target: { value: '60000' } })
    expect(props.onSeek).toHaveBeenLastCalledWith(60_000)

    fireEvent.keyDown(timeline, { key: 'ArrowRight' })
    expect(props.onSeek).toHaveBeenLastCalledWith(29_000)
    fireEvent.keyDown(timeline, { key: 'ArrowLeft' })
    expect(props.onSeek).toHaveBeenLastCalledWith(19_000)
  })

  it('↺ Verso e a velocidade em ciclo (1× → 0,75× → 0,5× → 1×)', async () => {
    const props = setup({ rate: 1 })
    await userEvent.click(screen.getByRole('button', { name: '↺ Verso' }))
    expect(props.onReplayLine).toHaveBeenCalledOnce()

    await userEvent.click(screen.getByRole('button', { name: /Velocidade 1×/ }))
    expect(props.onRateChange).toHaveBeenLastCalledWith(0.75)
  })

  it('da menor velocidade volta para 1×', async () => {
    const props = setup({ rate: 0.5 })
    await userEvent.click(screen.getByRole('button', { name: /Velocidade 0,5×/ }))
    expect(props.onRateChange).toHaveBeenLastCalledWith(1)
  })

  it('desabilitado enquanto o vídeo carrega', () => {
    setup({ disabled: true })
    expect(screen.getByRole('button', { name: 'Tocar' })).toBeDisabled()
    expect(screen.getByRole('slider')).toBeDisabled()
  })
})
