import { useId, type ReactNode } from 'react'
import styles from './StatusPanel.module.css'

interface StatusPanelProps {
  title?: string
  /** Use `StatusRow` como filhos. */
  children: ReactNode
}

/** Painel STATUS: título com borda forte e linhas chave/valor (valor em mono). */
export function StatusPanel({ title = 'STATUS', children }: StatusPanelProps) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className={styles.panel}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <dl className={styles.list}>{children}</dl>
    </section>
  )
}

export function StatusRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  )
}
