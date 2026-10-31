/** O que o resto do app precisa de um player. O YouTube implementa; os testes usam um fake. */
export interface PlayerController {
  play(): void
  pause(): void
  seekTo(videoMs: number): void
  setRate(rate: number): void
  getTimeMs(): number
  getDurationMs(): number
  getAvailableRates(): number[]
  destroy(): void
}

export interface PlayerEvents {
  onReady(): void
  onPlayingChange(playing: boolean): void
  onError(message: string): void
}

/** Velocidades oferecidas na interface (spec: 0,5× / 0,75× / 1×). */
export const RATES = [0.5, 0.75, 1] as const
