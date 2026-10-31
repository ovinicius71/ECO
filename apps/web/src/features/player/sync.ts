// Lógica pura de sincronia entre o vídeo e a letra (sem React, sem YouTube).

export interface TimedLine {
  startMs: number
  endMs: number
}

/** Folga nas bordas do verso: o `getCurrentTime()` do player não é exato. */
export const EDGE_TOLERANCE_MS = 50
export const OFFSET_STEP_MS = 100
export const OFFSET_LIMIT_MS = 10_000

/**
 * `offsetMs` positivo adianta a letra (o verso aparece antes): é o "+ Adiantar letra" do Setup.
 */
export const toLyricMs = (videoMs: number, offsetMs: number) => videoMs + offsetMs
export const toVideoMs = (lyricMs: number, offsetMs: number) => Math.max(0, lyricMs - offsetMs)

/** Último verso que já começou em `lyricMs`, ou -1 antes do primeiro. */
export function lastStartedIndex(lines: readonly TimedLine[], lyricMs: number): number {
  let low = 0
  let high = lines.length - 1
  let found = -1
  while (low <= high) {
    const mid = (low + high) >> 1
    if (lines[mid]!.startMs <= lyricMs) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return found
}

/** Verso que está tocando em `lyricMs`; -1 antes do primeiro e nos intervalos instrumentais. */
export function findLineIndex(lines: readonly TimedLine[], lyricMs: number): number {
  const index = lastStartedIndex(lines, lyricMs)
  return index >= 0 && lyricMs < lines[index]!.endMs ? index : -1
}

export type LineMode = 'off' | 'loop' | 'pause-at-end'

export type GuardAction = { kind: 'none' } | { kind: 'pause' } | { kind: 'seek'; lyricMs: number }

const NONE: GuardAction = { kind: 'none' }

/**
 * Decide o que fazer quando o tempo cruza o fim do verso-alvo:
 * - `loop` volta ao início do verso;
 * - `pause-at-end` pausa (Ditado).
 * Só dispara na passagem (antes < fim ≤ agora), para não repetir a ação a cada tique.
 */
export function lineGuard(
  line: TimedLine | undefined,
  previousLyricMs: number,
  lyricMs: number,
  mode: LineMode,
): GuardAction {
  if (!line || mode === 'off') return NONE
  const end = line.endMs - EDGE_TOLERANCE_MS
  const crossed = previousLyricMs < end && lyricMs >= end && lyricMs - previousLyricMs < 2_000
  if (!crossed) return NONE
  return mode === 'loop' ? { kind: 'seek', lyricMs: line.startMs } : { kind: 'pause' }
}

export function clampOffset(offsetMs: number): number {
  const stepped = Math.round(offsetMs / OFFSET_STEP_MS) * OFFSET_STEP_MS
  return Math.min(OFFSET_LIMIT_MS, Math.max(-OFFSET_LIMIT_MS, stepped))
}

/** 400 → "+0,4 s"; -400 → "−0,4 s"; 0 → "0,0 s". */
export function formatOffset(offsetMs: number): string {
  const value = (Math.abs(offsetMs) / 1000).toFixed(1).replace('.', ',')
  if (offsetMs > 0) return `+${value} s`
  if (offsetMs < 0) return `−${value} s`
  return `${value} s`
}
