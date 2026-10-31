import { describe, expect, it, vi } from 'vitest'
import type { PlayerController } from './controller'
import { createPlayerEngine } from './engine'

const LINES = [
  { startMs: 12_340, endMs: 15_800 },
  { startMs: 15_800, endMs: 19_420 },
  { startMs: 31_550, endMs: 35_020 },
]

/** Player falso: o tempo é controlado pelo teste. */
function fakePlayer(rates = [0.25, 0.5, 0.75, 1, 1.5]) {
  let timeMs = 0
  const controller: PlayerController = {
    play: vi.fn(),
    pause: vi.fn(),
    seekTo: vi.fn((ms: number) => {
      timeMs = ms
    }),
    setRate: vi.fn(),
    getTimeMs: () => timeMs,
    getDurationMs: () => 221_000,
    getAvailableRates: () => rates,
    destroy: vi.fn(),
  }
  return {
    controller,
    at(ms: number) {
      timeMs = ms
    },
  }
}

function setup(options: Parameters<typeof createPlayerEngine>[1] = {}, rates?: number[]) {
  const engine = createPlayerEngine(LINES, { schedule: () => 1, cancel: () => {}, ...options })
  const player = fakePlayer(rates)
  engine.attach(player.controller)
  engine.events.onReady()
  const state = () => engine.store.getState()
  const playAt = (ms: number) => {
    player.at(ms)
    engine.tick()
  }
  return { engine, player, state, playAt }
}

describe('createPlayerEngine', () => {
  it('fica pronto com a duração e só as velocidades da interface que o vídeo aceita', () => {
    const { state } = setup({}, [1, 0.75, 2])
    expect(state()).toMatchObject({ status: 'ready', durationMs: 221_000, rates: [0.75, 1] })
  })

  it('acompanha o verso atual pelo tempo, com o offset', () => {
    const { state, playAt, engine } = setup()
    playAt(13_000)
    expect(state().lineIndex).toBe(0)
    playAt(20_000)
    expect(state().lineIndex).toBe(-1)

    engine.setOffset(12_000) // limitado a +10 s → letra em 30 s
    expect(state().offsetMs).toBe(10_000)
    expect(state().lineIndex).toBe(-1)
    playAt(22_000) // letra em 32 s
    expect(state().lineIndex).toBe(2)
  })

  it('o relógio do store anda em passos, mas a troca de verso é imediata', () => {
    const { state, playAt } = setup({ clockStepMs: 250 })
    playAt(12_000)
    playAt(12_100)
    expect(state().videoMs).toBe(12_000)
    playAt(12_400) // entra no verso 0
    expect(state()).toMatchObject({ videoMs: 12_400, lineIndex: 0 })
  })

  it('pausa no fim do verso', () => {
    const { player, playAt } = setup({ mode: 'pause-at-end' })
    playAt(15_700)
    playAt(15_760)
    expect(player.controller.pause).toHaveBeenCalledOnce()
  })

  it('loop volta ao início do verso (respeitando o offset)', () => {
    const { engine, player, playAt, state } = setup({ mode: 'loop', offsetMs: 300 })
    playAt(15_400) // letra 15,7 s
    playAt(15_460) // letra 15,76 s: cruzou o fim
    expect(player.controller.seekTo).toHaveBeenLastCalledWith(12_040)
    expect(state().lineIndex).toBe(0)

    engine.setMode('off')
    playAt(15_400)
    playAt(15_460)
    expect(player.controller.seekTo).toHaveBeenCalledOnce()
  })

  it('↺ Verso volta ao início do verso atual, ou do último num intervalo, e toca', () => {
    const { engine, player, playAt } = setup()
    playAt(17_000)
    engine.replayLine()
    expect(player.controller.seekTo).toHaveBeenLastCalledWith(15_800)
    expect(player.controller.play).toHaveBeenCalled()

    playAt(25_000) // intervalo depois do verso 1
    engine.replayLine()
    expect(player.controller.seekTo).toHaveBeenLastCalledWith(15_800)
  })

  it('o seek do usuário não dispara a pausa do fim do verso', () => {
    const { engine, player, playAt } = setup({ mode: 'pause-at-end' })
    playAt(15_000)
    engine.seek(16_000)
    playAt(16_050)
    expect(player.controller.pause).not.toHaveBeenCalled()
  })

  it('velocidade: só aceita as disponíveis e o passo para nos limites', () => {
    const { engine, player, state } = setup()
    engine.stepRate(1)
    expect(state().rate).toBe(1)
    engine.stepRate(-1)
    engine.stepRate(-1)
    engine.stepRate(-1)
    expect(state().rate).toBe(0.5)
    expect(player.controller.setRate).toHaveBeenLastCalledWith(0.5)
    engine.setRate(2)
    expect(state().rate).toBe(0.5)
  })

  it('play/pause alterna pelo estado e o laço só roda tocando', () => {
    const schedule = vi.fn(() => 1)
    const { engine, player } = setup({ schedule })
    engine.togglePlay()
    expect(player.controller.play).toHaveBeenCalledOnce()

    engine.events.onPlayingChange(true)
    expect(schedule).toHaveBeenCalledOnce()
    engine.togglePlay()
    expect(player.controller.pause).toHaveBeenCalledOnce()
  })

  it('erro do player e detach', () => {
    const { engine, player, state } = setup()
    engine.events.onError('Este vídeo não permite reprodução fora do YouTube.')
    expect(state()).toMatchObject({ status: 'error', playing: false })

    engine.detach()
    expect(player.controller.destroy).toHaveBeenCalledOnce()
    expect(state().status).toBe('loading')
  })

  it('trocar a letra recalcula o verso atual', () => {
    const { engine, playAt, state } = setup()
    playAt(13_000)
    engine.setLines([{ startMs: 0, endMs: 5_000 }])
    expect(state().lineIndex).toBe(-1)
  })
})
