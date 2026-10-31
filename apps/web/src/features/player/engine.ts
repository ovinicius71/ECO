import { createStore, type StoreApi } from 'zustand/vanilla'
import { RATES, type PlayerController, type PlayerEvents } from './controller'
import {
  clampOffset,
  findLineIndex,
  lastStartedIndex,
  lineGuard,
  toLyricMs,
  toVideoMs,
  type LineMode,
  type TimedLine,
} from './sync'

export interface PlayerState {
  status: 'loading' | 'ready' | 'error'
  error?: string
  playing: boolean
  videoMs: number
  durationMs: number
  rate: number
  /** Velocidades de RATES que este vídeo aceita. */
  rates: number[]
  /** Verso tocando agora; -1 antes do primeiro e nos intervalos. */
  lineIndex: number
  offsetMs: number
  mode: LineMode
}

interface EngineOptions {
  offsetMs?: number
  mode?: LineMode
  /** O relógio do store só atualiza a cada `clockStepMs` (o verso atualiza na hora). */
  clockStepMs?: number
  schedule?: (callback: () => void) => number
  cancel?: (id: number) => void
}

export interface PlayerEngine {
  store: StoreApi<PlayerState>
  events: PlayerEvents
  attach(controller: PlayerController): void
  /** Solta o player atual (o engine pode receber outro depois, ex.: StrictMode). */
  detach(): void
  setLines(lines: readonly TimedLine[]): void
  /** Lê o tempo do player. `exact` grava o tempo mesmo dentro do passo do relógio. */
  tick(exact?: boolean): void
  play(): void
  pause(): void
  togglePlay(): void
  seek(videoMs: number): void
  /** ↺ Verso: volta ao início do verso atual (ou do último, num intervalo) e toca. */
  replayLine(): void
  setRate(rate: number): void
  stepRate(direction: 1 | -1): void
  setOffset(offsetMs: number): void
  setMode(mode: LineMode): void
}

/** Junta o player, o tempo, a letra e o loop/pausa. Sem React: os testes usam um player fake. */
export function createPlayerEngine(
  initialLines: readonly TimedLine[],
  options: EngineOptions = {},
): PlayerEngine {
  const {
    clockStepMs = 250,
    schedule = (cb) => requestAnimationFrame(cb),
    cancel = (id) => cancelAnimationFrame(id),
  } = options

  let lines = initialLines
  let controller: PlayerController | null = null
  let frame: number | null = null
  let previousLyricMs = 0

  const store = createStore<PlayerState>(() => ({
    status: 'loading',
    playing: false,
    videoMs: 0,
    durationMs: 0,
    rate: 1,
    rates: [...RATES],
    lineIndex: -1,
    offsetMs: clampOffset(options.offsetMs ?? 0),
    mode: options.mode ?? 'off',
  }))

  const lyricNow = () => toLyricMs(controller?.getTimeMs() ?? 0, store.getState().offsetMs)

  function stopLoop() {
    if (frame !== null) cancel(frame)
    frame = null
  }

  function loop() {
    engine.tick()
    frame = store.getState().playing ? schedule(loop) : null
  }

  function jumpTo(videoMs: number) {
    controller?.seekTo(videoMs)
    // Salto do usuário: o guarda não deve ver isso como "passou do fim do verso".
    previousLyricMs = toLyricMs(videoMs, store.getState().offsetMs)
    store.setState({
      videoMs,
      lineIndex: findLineIndex(lines, previousLyricMs),
    })
  }

  const engine: PlayerEngine = {
    store,

    events: {
      onReady() {
        const available = controller?.getAvailableRates() ?? [1]
        store.setState({
          status: 'ready',
          durationMs: controller?.getDurationMs() ?? 0,
          rates: RATES.filter((rate) => available.includes(rate)),
        })
      },
      onPlayingChange(playing) {
        store.setState({ playing })
        if (playing && frame === null) frame = schedule(loop)
        if (!playing) {
          stopLoop()
          // Parado, o tempo exato importa (ex.: o Ditado decide se o verso terminou).
          engine.tick(true)
        }
      },
      onError(message) {
        store.setState({ status: 'error', error: message, playing: false })
        stopLoop()
      },
    },

    attach(next) {
      controller = next
    },

    detach() {
      stopLoop()
      controller?.destroy()
      controller = null
      store.setState({ status: 'loading', playing: false })
    },

    setLines(next) {
      lines = next
      store.setState({ lineIndex: findLineIndex(lines, lyricNow()) })
    },

    tick(exact = false) {
      if (!controller) return
      const state = store.getState()
      const videoMs = controller.getTimeMs()
      const lyricMs = toLyricMs(videoMs, state.offsetMs)

      const target = lines[lastStartedIndex(lines, previousLyricMs)]
      const action = lineGuard(target, previousLyricMs, lyricMs, state.mode)
      previousLyricMs = lyricMs

      if (action.kind === 'seek') {
        jumpTo(toVideoMs(action.lyricMs, state.offsetMs))
        return
      }
      if (action.kind === 'pause') controller.pause()

      const lineIndex = findLineIndex(lines, lyricMs)
      const durationMs = state.durationMs || controller.getDurationMs()
      if (
        exact ||
        lineIndex !== state.lineIndex ||
        Math.abs(videoMs - state.videoMs) >= clockStepMs ||
        durationMs !== state.durationMs
      ) {
        store.setState({ videoMs, lineIndex, durationMs })
      }
    },

    play: () => controller?.play(),
    pause: () => controller?.pause(),
    togglePlay() {
      if (store.getState().playing) engine.pause()
      else engine.play()
    },

    seek: (videoMs) => jumpTo(Math.max(0, videoMs)),

    replayLine() {
      const index = Math.max(0, lastStartedIndex(lines, lyricNow()))
      const line = lines[index]
      if (!line) return
      jumpTo(toVideoMs(line.startMs, store.getState().offsetMs))
      engine.play()
    },

    setRate(rate) {
      if (!store.getState().rates.includes(rate)) return
      controller?.setRate(rate)
      store.setState({ rate })
    },

    stepRate(direction) {
      const { rates, rate } = store.getState()
      const next = rates[rates.indexOf(rate) + direction]
      if (next !== undefined) engine.setRate(next)
    },

    setOffset(offsetMs) {
      const clamped = clampOffset(offsetMs)
      previousLyricMs = lyricNow() - store.getState().offsetMs + clamped
      store.setState({ offsetMs: clamped })
      engine.tick()
    },

    setMode: (mode) => store.setState({ mode }),
  }

  return engine
}
