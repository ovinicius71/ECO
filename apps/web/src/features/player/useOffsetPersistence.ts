import { useEffect } from 'react'
import { updateSongOffset } from '@/lib/db/songs'
import type { PlayerEngine } from './engine'

const DEBOUNCE_MS = 500

/** Salva no navegador o offset da música quando ele muda (com debounce). */
export function useOffsetPersistence(
  engine: PlayerEngine,
  videoId: string,
  save = updateSongOffset,
) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = engine.store.subscribe((state, previous) => {
      if (state.offsetMs === previous.offsetMs) return
      clearTimeout(timer)
      timer = setTimeout(() => void save(videoId, state.offsetMs), DEBOUNCE_MS)
    })
    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [engine, videoId, save])
}
