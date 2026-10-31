/** Tolerância do LRCLIB para considerar a mesma gravação (±2 s). */
export const DURATION_TOLERANCE_SEC = 2

export function durationMismatch(lyricsSec: number, videoMs: number): boolean {
  if (!lyricsSec || !videoMs) return false
  return Math.abs(lyricsSec - videoMs / 1000) > DURATION_TOLERANCE_SEC
}

interface Candidate {
  lrclibId: number
  durationSec: number
  synced: boolean
}

/** A versão com a duração do vídeo (sincronizada primeiro, depois a mais próxima). */
export function findDurationMatch<T extends Candidate>(
  candidates: readonly T[],
  videoMs: number,
  excludeId?: number,
): T | undefined {
  const videoSec = videoMs / 1000
  return candidates
    .filter(
      (c) =>
        c.lrclibId !== excludeId && Math.abs(c.durationSec - videoSec) <= DURATION_TOLERANCE_SEC,
    )
    .sort(
      (a, b) =>
        Number(b.synced) - Number(a.synced) ||
        Math.abs(a.durationSec - videoSec) - Math.abs(b.durationSec - videoSec),
    )[0]
}
