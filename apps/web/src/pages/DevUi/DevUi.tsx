import { useState, type ReactNode } from 'react'
import { Button, ButtonLink } from '@/components/Button/Button'
import { Chip } from '@/components/Chip/Chip'
import { Gauge } from '@/components/Gauge/Gauge'
import { Segmented } from '@/components/Segmented/Segmented'
import { SelectList } from '@/components/SelectList/SelectList'
import { StatusPanel, StatusRow } from '@/components/StatusPanel/StatusPanel'
import { KeyHintBar } from '@/layout/KeyHintBar/KeyHintBar'
import styles from './DevUi.module.css'

// Dados inventados (os mesmos dos artboards); nunca músicas reais.
const SONGS = [
  { title: 'Paper Moon Radio', artist: 'The Quiet Arcade', mode: 'DITADO', score: '94%' },
  { title: 'Northbound Lights', artist: 'Halcyon Wire', mode: 'PREENCHER', score: '88%' },
  { title: 'Glass Garden', artist: 'Mira Vale', mode: 'DIGITAR JUNTO', score: '97%' },
]

type Correction = 'tolerant' | 'strict'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.label}>{title}</h2>
      {children}
    </section>
  )
}

export function DevUi() {
  const [correction, setCorrection] = useState<Correction>('tolerant')
  const [activated, setActivated] = useState('—')

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

        <Section title="SEGMENTED · ← → TROCAM">
          <Segmented
            label="Correção"
            value={correction}
            onChange={setCorrection}
            options={[
              { value: 'tolerant', label: 'Tolerante' },
              { value: 'strict', label: 'Estrita' },
            ]}
          />
        </Section>

        <Section title={`SELECTLIST · MOUSE OU ↑ ↓ · ENTER ATIVA · ÚLTIMA: ${activated}`}>
          <SelectList
            label="Recentes"
            items={SONGS}
            getKey={(song) => song.title}
            onActivate={(song) => setActivated(song.title)}
            renderItem={(song, { index }) => (
              <>
                <span className={styles.mono}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.grow}>{song.title}</span>
                <span className={styles.grow}>{song.artist}</span>
                <span>{song.mode}</span>
                <span className={styles.mono}>{song.score}</span>
              </>
            )}
          />
        </Section>

        <Section title="STATUSPANEL">
          <div className={styles.narrow}>
            <StatusPanel>
              <StatusRow label="Nível estimado" value="B1" />
              <StatusRow label="Músicas praticadas" value="23" />
              <StatusRow label="Precisão média" value="91%" />
            </StatusPanel>
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
