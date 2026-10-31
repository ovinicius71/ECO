import type { ReactNode } from 'react'
import styles from './DevUi.module.css'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.label}>{title}</h2>
      {children}
    </section>
  )
}

export function DevUi() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Componentes</h1>
        <Section title="TIPOGRAFIA">
          <p>Jost para interface e letras · IBM Plex Mono para números · Noto Sans JP 書き取り</p>
        </Section>
      </main>
    </div>
  )
}
