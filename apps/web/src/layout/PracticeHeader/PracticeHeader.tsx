import { Gauge } from '@/components/Gauge/Gauge'
import styles from './PracticeHeader.module.css'

interface PracticeHeaderProps {
  title: string
  artist: string
  /** Nome do modo em caixa alta, ex.: "DITADO". */
  mode: string
  /** Verso atual (1-based) e total. */
  current: number
  total: number
  metric: { label: string; value: string }
  onExit: () => void
}

/** Cabeçalho das telas de prática: ← SAIR, música, modo invertido, progresso e métrica. */
export function PracticeHeader({
  title,
  artist,
  mode,
  current,
  total,
  metric,
  onExit,
}: PracticeHeaderProps) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <header className={styles.header}>
      <button type="button" className={styles.exit} onClick={onExit}>
        ← SAIR
      </button>
      <div className={styles.song}>
        <span className={styles.title}>{title}</span>
        <span className={styles.artist}>{artist}</span>
      </div>
      <span className={styles.mode}>{mode}</span>
      <div className={styles.progress}>
        VERSO{' '}
        <span className={styles.mono}>
          {pad(current)}/{pad(total)}
        </span>
        <div className={styles.gauge}>
          <Gauge value={total ? current / total : 0} label="Progresso da música" />
        </div>
      </div>
      <div className={styles.metric}>
        <span className={styles.metricLabel}>{metric.label} </span>
        {metric.value}
      </div>
    </header>
  )
}
