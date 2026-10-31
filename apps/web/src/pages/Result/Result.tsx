import { Link, useParams } from 'react-router'
import { ButtonLink } from '@/components/Button/Button'
import { Chip } from '@/components/Chip/Chip'
import { Icon } from '@/components/Icon/Icon'
import { WordToken } from '@/components/WordToken/WordToken'
import { dictationQuery, settingsFromSession } from '@/features/dictation/settings'
import { MODE_NAMES } from '@/features/progress/library'
import { barKind, reviewNote } from '@/features/progress/review'
import { isNewRecord } from '@/features/progress/stats'
import { useStreak } from '@/features/progress/useProgress'
import { AppHeader } from '@/layout/AppHeader/AppHeader'
import { bestAccuracy, getSession } from '@/lib/db/sessions'
import { useDbQuery } from '@/lib/db/useDbQuery'
import { cx } from '@/lib/utils/cx'
import { formatDuration } from '@/lib/utils/time'
import type { LineAttempt, PracticeSession } from '@/types/practice'
import styles from './Result.module.css'

const pct = (value: number) => `${Math.round(value * 100)}%`
const pad = (n: number) => String(n).padStart(2, '0')

/** Rota /resultado/:sessionId. */
export function Result() {
  const { sessionId = '' } = useParams()
  const streak = useStreak()
  const query = useDbQuery(async () => {
    const session = await getSession(sessionId)
    if (!session) return null
    const previousBest = await bestAccuracy(session.videoId, session.mode, session.id)
    return { session, previousBest }
  }, [sessionId])

  return (
    <div className={styles.page}>
      <AppHeader streakDays={streak || undefined} />
      <main className={styles.main}>
        {query.status === 'loading' && (
          <p role="status" className={styles.label}>
            CARREGANDO O RESULTADO…
          </p>
        )}
        {(query.status === 'error' || (query.status === 'ready' && !query.data)) && (
          <div role="alert" className={styles.missing}>
            <h1 className={styles.missingTitle}>RESULTADO NÃO ENCONTRADO</h1>
            <p>Esta sessão não está salva neste navegador.</p>
            <ButtonLink to="/" variant="outline">
              ← Início
            </ButtonLink>
          </div>
        )}
        {query.status === 'ready' && query.data && (
          <ResultBody
            session={query.data.session}
            record={isNewRecord(query.data.session.accuracy, query.data.previousBest)}
            streak={streak}
          />
        )}
      </main>
    </div>
  )
}

function ResultBody({
  session,
  record,
  streak,
}: {
  session: PracticeSession
  record: boolean
  streak: number | undefined
}) {
  const mode = MODE_NAMES[session.mode]
  const words = session.lines.flatMap((line) => line.result.words)
  const count = (status: string) => words.filter((word) => word.status === status).length
  const answered = session.lines.filter((line) => !line.skipped).length
  const kinds = session.lines.map((line) => barKind(line.result, line.skipped))
  const toReview = session.lines.filter((line) => line.skipped || line.result.score < 1)

  const settings = settingsFromSession(session)
  // Mesmos ajustes da sessão; `lines` escolhe os versos (sem lines = a música inteira).
  const practiceUrl = (lines?: number[]) =>
    `/praticar/${session.videoId}/ditado?${dictationQuery({ ...settings, lines })}`

  const stats = [
    { label: 'VERSOS', value: `${answered}/${session.lineCount}` },
    { label: 'PALAVRAS CERTAS', value: `${count('ok')}/${words.length}` },
    { label: 'QUASE CERTAS', value: String(count('near')) },
    { label: 'ERRADAS', value: String(count('wrong') + count('missing')) },
    { label: 'TEMPO', value: formatDuration(session.durationSec) },
    { label: 'REPETIÇÕES', value: String(session.replays) },
  ]

  return (
    <>
      <section className={styles.top}>
        <div className={styles.headline}>
          <p className={styles.label}>
            RESULTADO · {mode.name.toUpperCase()} · <span lang="ja">{mode.jp}</span>
          </p>
          <h1 className={styles.title}>
            {session.title} <span className={styles.artist}>— {session.artist}</span>
          </h1>
          <div className={styles.scoreRow}>
            <span className={styles.score}>
              {Math.round(session.accuracy * 100)}
              <span className={styles.percent}>%</span>
            </span>
            <div className={styles.scoreSide}>
              <span className={styles.label}>PRECISÃO</span>
              {record && <Chip className={styles.record}>Novo recorde</Chip>}
              {streak ? (
                <span className={styles.streak}>
                  Sequência: {streak} {streak === 1 ? 'dia' : 'dias'}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.bars} aria-labelledby="bars-title">
        <div className={styles.barsHead}>
          <h2 id="bars-title" className={styles.label}>
            PRECISÃO POR VERSO
          </h2>
          <span className={styles.legend} aria-hidden="true">
            <span className={cx(styles.swatch, styles.ok)} />
            CERTO
            <span className={cx(styles.swatch, styles.near)} />
            QUASE
            <span className={cx(styles.swatch, styles.error)} />
            ERRO
          </span>
        </div>
        <div
          role="img"
          aria-label={`${session.lines.length} versos: ${kinds.filter((k) => k === 'ok').length} certos, ${kinds.filter((k) => k === 'near').length} quase certos, ${kinds.filter((k) => k === 'error').length} com erro`}
          className={styles.chart}
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, session.lines.length)}, minmax(0, 1fr))`,
          }}
        >
          {session.lines.map((line, i) => (
            <span
              key={line.lineIndex}
              className={cx(styles.bar, styles[kinds[i] ?? 'ok'])}
              style={{ height: `${Math.max(6, Math.round(line.result.score * 100))}%` }}
              title={`Verso ${line.lineIndex + 1}: ${line.skipped ? 'pulado' : pct(line.result.score)}`}
            />
          ))}
        </div>
      </section>

      <section className={styles.review} aria-labelledby="review-title">
        <h2 id="review-title" className={styles.panelTitle}>
          VERSOS PARA REVER
        </h2>
        {toReview.length === 0 ? (
          <p className={styles.empty}>Nenhum verso para rever: tudo certo.</p>
        ) : (
          <ol className={styles.reviewList}>
            {toReview.map((line) => (
              <ReviewRow key={line.lineIndex} line={line} href={practiceUrl([line.lineIndex])} />
            ))}
          </ol>
        )}
      </section>

      <section className={styles.actions} aria-label="Próximos passos">
        {toReview.length > 0 && (
          <ButtonLink to={practiceUrl(toReview.map((line) => line.lineIndex))}>
            Praticar só os versos com erro
          </ButtonLink>
        )}
        <ButtonLink to={practiceUrl(settings.lines)} variant="outline">
          Repetir
        </ButtonLink>
        <ButtonLink to={`/musica/${session.videoId}`} variant="outline">
          Outro modo
        </ButtonLink>
        <ButtonLink to="/" variant="ghost" icon="arrowRight" className={styles.newSong}>
          Nova música
        </ButtonLink>
      </section>
    </>
  )
}

function ReviewRow({ line, href }: { line: LineAttempt; href: string }) {
  const note = line.skipped ? 'Verso pulado.' : reviewNote(line.result.words)
  return (
    <li className={styles.reviewRow}>
      <span className={styles.reviewNumber}>{pad(line.lineIndex + 1)}</span>
      <div className={styles.reviewBody}>
        <p className={styles.reviewWords}>
          {line.skipped
            ? line.expected
            : line.result.words.map((word, i) => (
                <WordToken
                  key={i}
                  expected={word.expected}
                  status={word.status}
                  typed={word.typed}
                  hint={word.hint}
                />
              ))}
        </p>
        {note && <p className={styles.note}>{note}</p>}
      </div>
      <Link
        to={href}
        className={styles.replay}
        aria-label={`Praticar o verso ${line.lineIndex + 1} de novo`}
      >
        <Icon name="replay" size={16} strokeWidth={1.8} />
      </Link>
    </li>
  )
}
