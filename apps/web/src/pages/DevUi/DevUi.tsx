import type { ReactNode } from 'react'
import { Button, ButtonLink } from '@/components/Button/Button'
import { Chip } from '@/components/Chip/Chip'
import { Gauge } from '@/components/Gauge/Gauge'
import { KeyHintBar } from '@/layout/KeyHintBar/KeyHintBar'
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

        <Section title="BUTTON">
          <div className={styles.row}>
            <Button icon="arrowRight">Buscar letra</Button>
            <Button variant="outline">Repetir</Button>
            <Button variant="ghost">Outro modo</Button>
            <Button disabled>Desabilitado</Button>
            <ButtonLink to="/" variant="outline" icon="arrowRight">
              Link
            </ButtonLink>
          </div>
        </Section>

        <Section title="CHIP">
          <div className={styles.row}>
            <Chip>Inglês</Chip>
            <Chip variant="dashed">日本語 · em breve</Chip>
            <Chip variant="square">12 dias</Chip>
          </div>
        </Section>

        <Section title="GAUGE · 0% / 70% / 100%">
          <div className={styles.narrow}>
            <Gauge value={0} label="Vazio" />
            <br />
            <Gauge value={0.7} label="Meta de hoje" />
            <br />
            <Gauge value={1} label="Completo" />
          </div>
        </Section>
      </main>

      <KeyHintBar
        hints={[
          { keys: 'CTRL V', label: 'COLAR LINK' },
          { keys: 'ENTER', label: 'BUSCAR' },
        ]}
        aside="SALVO NESTE NAVEGADOR"
      />
    </div>
  )
}
