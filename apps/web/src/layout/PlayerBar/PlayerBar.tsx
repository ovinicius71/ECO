import type { CSSProperties, KeyboardEvent } from 'react'
import { Icon } from '@/components/Icon/Icon'
import { formatDuration, formatRate } from '@/lib/utils/time'
import styles from './PlayerBar.module.css'

interface PlayerBarProps {
  playing: boolean
  currentMs: number
  durationMs: number
  rate: number
  /** Velocidades disponíveis, em ordem crescente. */
  rates: readonly number[]
  disabled?: boolean
  onTogglePlay: () => void
  onSeek: (videoMs: number) => void
  onReplayLine: () => void
  onRateChange: (rate: number) => void
}

const SEEK_STEP_MS = 5_000

/** Barra do player da prática: play, linha do tempo com ◆, tempo, ↺ Verso e velocidade. */
export function PlayerBar({
  playing,
  currentMs,
  durationMs,
  rate,
  rates,
  disabled = false,
  onTogglePlay,
  onSeek,
  onReplayLine,
  onRateChange,
}: PlayerBarProps) {
  const progress = durationMs > 0 ? Math.min(100, (currentMs / durationMs) * 100) : 0
  const current = formatDuration(currentMs / 1000)
  const total = formatDuration(durationMs / 1000)

  // Ciclo 1× → 0,75× → 0,5× → 1×: o primeiro clique deixa mais devagar.
  const slower = [...rates].reverse()
  const nextRate = slower[(slower.indexOf(rate) + 1) % slower.length] ?? rate

  function onTimelineKey(event: KeyboardEvent<HTMLInputElement>) {
    const step = { ArrowRight: SEEK_STEP_MS, ArrowLeft: -SEEK_STEP_MS }[event.key]
    if (step === undefined) return
    event.preventDefault()
    onSeek(Math.min(durationMs, Math.max(0, currentMs + step)))
  }

  return (
    <div role="group" aria-label="Controles do player" className={styles.bar}>
      <button
        type="button"
        className={styles.play}
        aria-label={playing ? 'Pausar' : 'Tocar'}
        disabled={disabled}
        onClick={onTogglePlay}
      >
        <Icon name={playing ? 'pause' : 'playSolid'} size={18} />
      </button>
      <span className={styles.time}>{current}</span>
      <input
        type="range"
        className={styles.timeline}
        style={{ '--progress': `${progress}%` } as CSSProperties}
        min={0}
        max={Math.max(durationMs, 1)}
        step={1000}
        value={Math.min(currentMs, durationMs)}
        disabled={disabled}
        aria-label="Linha do tempo"
        aria-valuetext={`${current} de ${total}`}
        onChange={(event) => onSeek(Number(event.target.value))}
        onKeyDown={onTimelineKey}
      />
      <span className={styles.duration}>{total}</span>
      <button type="button" className={styles.chip} disabled={disabled} onClick={onReplayLine}>
        ↺ Verso
      </button>
      <button
        type="button"
        className={`${styles.chip} ${styles.rate}`}
        disabled={disabled || rates.length < 2}
        aria-label={`Velocidade ${formatRate(rate)}. Mudar para ${formatRate(nextRate)}`}
        onClick={() => onRateChange(nextRate)}
      >
        {formatRate(rate)}
      </button>
    </div>
  )
}
