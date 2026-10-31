import styles from './Gauge.module.css'

interface GaugeProps {
  /** Progresso de 0 a 1 (valores fora disso são limitados). */
  value: number
  /** Nome acessível, ex.: "Meta de hoje". */
  label: string
}

export function Gauge({ value, label }: GaugeProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className={styles.gauge}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  )
}
