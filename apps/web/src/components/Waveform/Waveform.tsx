import { useMemo } from 'react'
import styles from './Waveform.module.css'

interface WaveformProps {
  /** Texto que define o desenho das barras (o mesmo verso dá sempre as mesmas barras). */
  seed: string
  /** Quanto do verso já tocou, de 0 a 1. */
  progress: number
  /** Nome acessível, ex.: "Progresso do verso 4". */
  label: string
  bars?: number
}

/** Hash FNV-1a → gerador simples: alturas estáveis por verso. */
function heights(seed: string, count: number): number[] {
  let state = 2166136261
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619)
  return Array.from({ length: count }, (_, i) => {
    state = Math.imul(state ^ (state >>> 15), 2246822507) >>> 0
    const noise = (state % 1000) / 1000
    const envelope = Math.sin((Math.PI * (i + 0.5)) / count) // sobe e desce como um verso
    return Math.round(12 + 84 * envelope * (0.45 + 0.55 * noise))
  })
}

/**
 * Barras no estilo de forma de onda, preenchidas em tinta conforme o verso toca.
 * É **decorativo**: a IFrame API não dá acesso ao áudio (design/README.md, desvios aprovados).
 */
export function Waveform({ seed, progress, label, bars = 64 }: WaveformProps) {
  const values = useMemo(() => heights(seed, bars), [seed, bars])
  const clamped = Math.min(1, Math.max(0, progress))
  const played = Math.round(clamped * bars)

  return (
    <div
      className={styles.wave}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      {values.map((height, i) => (
        <span
          key={i}
          className={i < played ? styles.played : styles.bar}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}
