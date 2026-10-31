import { cx } from '@/lib/utils/cx'
import styles from './BoxMeter.module.css'

interface BoxMeterProps {
  items: readonly { label: string; filled: boolean }[]
  /** Descrição acessível do conjunto, ex.: "Semana: praticou em 2 de 7 dias". */
  label: string
}

/** Quadrados cheios ou vazios com um rótulo embaixo (sequência da semana, caixas do Leitner). */
export function BoxMeter({ items, label }: BoxMeterProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={styles.meter}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => (
        <div key={i} className={styles.item} aria-hidden="true">
          <span className={cx(styles.box, item.filled && styles.filled)} />
          {item.label}
        </div>
      ))}
    </div>
  )
}
