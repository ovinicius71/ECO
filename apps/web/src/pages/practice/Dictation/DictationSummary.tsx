import { useEffect, useRef } from 'react'
import { Button, ButtonLink } from '@/components/Button/Button'
import { StatusPanel, StatusRow } from '@/components/StatusPanel/StatusPanel'
import type { DictationStats } from '@/features/dictation/session'
import styles from './Dictation.module.css'

interface DictationSummaryProps {
  videoId: string
  stats: DictationStats
  lineCount: number
  onRestart: () => void
}

/** Resumo no fim da música (a tela Resultado e o histórico chegam na Parte 10). */
export function DictationSummary({ videoId, stats, lineCount, onRestart }: DictationSummaryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [])
  const accuracy = stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`

  return (
    <section aria-labelledby="dictation-summary" className={styles.summary}>
      <p className={styles.label}>FIM DO DITADO</p>
      <h1 id="dictation-summary" ref={headingRef} tabIndex={-1} className={styles.score}>
        {accuracy}
      </h1>
      <p className={styles.label}>PRECISÃO</p>
      <StatusPanel title="RESUMO">
        <StatusRow label="Versos" value={lineCount} />
        <StatusRow label="Palavras certas" value={`${stats.words.ok} / ${stats.words.total}`} />
        <StatusRow label="Quase" value={stats.words.near} />
        <StatusRow label="Erradas ou faltando" value={stats.words.wrong + stats.words.missing} />
        <StatusRow label="Repetições" value={stats.replays} />
        <StatusRow label="Dicas" value={stats.hints} />
        <StatusRow label="Versos pulados" value={stats.skipped} />
      </StatusPanel>
      <div className={styles.summaryActions}>
        <Button icon="arrowRight" onClick={onRestart}>
          Repetir
        </Button>
        <ButtonLink to={`/musica/${videoId}`} variant="outline">
          Outro modo
        </ButtonLink>
        <ButtonLink to="/" variant="ghost">
          Nova música
        </ButtonLink>
      </div>
    </section>
  )
}
