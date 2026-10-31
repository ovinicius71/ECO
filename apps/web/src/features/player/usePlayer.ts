import { useEffect, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { createPlayerEngine, type PlayerState } from './engine'
import type { LineMode, TimedLine } from './sync'
import { createYouTubePlayer } from './youtube'

interface UsePlayerOptions {
  videoId: string
  lines: readonly TimedLine[]
  offsetMs?: number
  mode?: LineMode
  /** Controles nativos do YouTube (Setup) ou só a PlayerBar do Eco (prática). */
  controls?: boolean
}

/** Cria o player do YouTube dentro de `containerRef` e devolve o engine. */
export function usePlayer({ videoId, lines, offsetMs, mode, controls = false }: UsePlayerOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [engine] = useState(() => createPlayerEngine(lines, { offsetMs, mode }))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false
    createYouTubePlayer(container, videoId, engine.events, { controls })
      .then((controller) => {
        if (cancelled) controller.destroy()
        else engine.attach(controller)
      })
      .catch((error: unknown) => {
        if (!cancelled)
          engine.events.onError(error instanceof Error ? error.message : String(error))
      })
    return () => {
      cancelled = true
      engine.detach()
    }
  }, [engine, videoId, controls])

  useEffect(() => {
    engine.setLines(lines)
  }, [engine, lines])

  return { containerRef, engine }
}

/** Lê uma parte do estado do player (re-renderiza só quando ela muda). */
export function usePlayerState<T>(
  engine: ReturnType<typeof createPlayerEngine>,
  selector: (state: PlayerState) => T,
): T {
  return useStore(engine.store, selector)
}
