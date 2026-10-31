import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/Button/Button'
import { Segmented } from '@/components/Segmented/Segmented'
import { StatusPanel, StatusRow } from '@/components/StatusPanel/StatusPanel'
import { VideoFrame } from '@/components/VideoFrame/VideoFrame'
import { Waveform } from '@/components/Waveform/Waveform'
import { WordToken } from '@/components/WordToken/WordToken'
import type { CorrectionMode } from '@/features/correction'
import {
  dictationReducer,
  dictationStats,
  firstLettersHint,
  initialDictation,
  scoreAttempts,
  targetLine,
} from '@/features/dictation/session'
import { buildDictationSession } from '@/features/dictation/record'
import { seekPointFor, type DictationSettings } from '@/features/dictation/settings'
import { EDGE_TOLERANCE_MS, toLyricMs, toVideoMs } from '@/features/player/sync'
import { usePlayer, usePlayerState } from '@/features/player/usePlayer'
import { usePracticeShortcuts } from '@/features/player/usePracticeShortcuts'
import { createPracticeClock } from '@/features/progress/clock'
import { toLocalDate } from '@/features/progress/dates'
import { KeyHintBar } from '@/layout/KeyHintBar/KeyHintBar'
import { PracticeHeader } from '@/layout/PracticeHeader/PracticeHeader'
import { recordActivity, saveSession } from '@/lib/db/sessions'
import type { Song } from '@/types/song'
import styles from './Dictation.module.css'
import { DictationSummary } from './DictationSummary'

const START_PRE_ROLL_MS = 1_000
const REPLAY_PRE_ROLL_MS = 300

const CORRECTION_OPTIONS = [
  { value: 'tolerant', label: 'Tolerante' },
  { value: 'strict', label: 'Estrita' },
] as const satisfies readonly { value: CorrectionMode; label: string }[]

const CORRECTION_NOTE: Record<CorrectionMode, string> = {
  tolerant: 'Ignora acentos, pontuação e maiúsculas. Uma letra trocada conta como “quase”.',
  strict: 'Tem que bater exatamente: maiúsculas, acentos e pontuação contam.',
}

const HINTS = [
  { keys: 'ENTER', label: 'CONFIRMAR' },
  { keys: 'TAB', label: 'OUVIR DE NOVO' },
  { keys: 'CTRL ↓', label: 'MAIS DEVAGAR' },
  { keys: 'CTRL H', label: 'DICA' },
]

const percent = (value: number | null) => (value === null ? '—' : `${Math.round(value * 100)}%`)

export function DictationSession({ song, settings }: { song: Song; settings: DictationSettings }) {
  const navigate = useNavigate()
  const { lines } = song
  // Só os versos pedidos (?versos=), se forem válidos para esta letra; senão, a música inteira.
  const chosen = settings.lines?.filter((index) => index < lines.length)
  const [state, dispatch] = useReducer(
    dictationReducer,
    chosen?.length ? chosen : lines.length,
    initialDictation,
  )
  const [correction, setCorrection] = useState<CorrectionMode>(settings.correction)
  const [draft, setDraft] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  // Tempo ativo de prática (pausas > 2 min não contam) e início da sessão.
  const [clock] = useState(() => createPracticeClock())
  const startedAt = useRef<Date | null>(null)

  const { containerRef, engine } = usePlayer({
    videoId: song.videoId,
    lines,
    offsetMs: song.offsetMs,
    mode: settings.pauseAtEnd ? 'pause-at-end' : 'off',
  })
  const status = usePlayerState(engine, (s) => s.status)
  const error = usePlayerState(engine, (s) => s.error)
  const playing = usePlayerState(engine, (s) => s.playing)
  const videoMs = usePlayerState(engine, (s) => s.videoMs)
  const offsetMs = usePlayerState(engine, (s) => s.offsetMs)
  const rate = usePlayerState(engine, (s) => s.rate)

  // Velocidade escolhida no Setup, aplicada quando o player fica pronto.
  useEffect(() => {
    if (status === 'ready') engine.setRate(settings.rate)
  }, [engine, status, settings.rate])

  const scored = useMemo(
    () => scoreAttempts(state.attempts, lines, correction),
    [state.attempts, lines, correction],
  )
  const stats = useMemo(() => dictationStats(scored), [scored])
  const lineIndex = targetLine(state)
  const target = lines[lineIndex]
  const lyricMs = toLyricMs(videoMs, offsetMs)
  const checked = state.phase === 'checked' ? scored.at(-1) : undefined

  const playFrom = useCallback(
    (index: number, preRollMs: number) => {
      engine.seek(
        toVideoMs(seekPointFor(lines, index, preRollMs), engine.store.getState().offsetMs),
      )
      engine.play()
    },
    [engine, lines],
  )

  const start = useCallback(() => {
    startedAt.current ??= new Date()
    clock.mark()
    dispatch({ type: 'start' })
    playFrom(lineIndex, START_PRE_ROLL_MS)
    inputRef.current?.focus()
  }, [clock, lineIndex, playFrom])

  const replay = useCallback(() => {
    if (state.phase !== 'answering') return
    clock.mark()
    dispatch({ type: 'replay' })
    playFrom(lineIndex, REPLAY_PRE_ROLL_MS)
  }, [clock, lineIndex, playFrom, state.phase])

  const hint = useCallback(() => {
    clock.mark()
    dispatch({ type: 'hint' })
  }, [clock])

  /** Segue para o próximo verso: continua de onde parou ou, se parou antes do fim, pula até ele. */
  const goOn = useCallback(() => {
    const next = state.order[state.target + 1]
    if (next === undefined) return
    const current = lines[lineIndex]
    const now = toLyricMs(engine.store.getState().videoMs, engine.store.getState().offsetMs)
    const stoppedEarly = current !== undefined && now < current.endMs - EDGE_TOLERANCE_MS * 2
    // Versos escolhidos fora de sequência: sempre pula até o próximo.
    if (stoppedEarly || next !== lineIndex + 1) playFrom(next, REPLAY_PRE_ROLL_MS)
    else engine.play()
  }, [engine, lineIndex, lines, playFrom, state.order, state.target])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (state.phase === 'ready') return start()
    if (state.phase !== 'answering') return
    clock.mark()
    engine.pause()
    dispatch({ type: 'submit', typed: draft })
  }

  function next() {
    clock.mark()
    dispatch({ type: 'next' })
    setDraft('')
    goOn()
    inputRef.current?.focus()
  }

  function skip() {
    clock.mark()
    dispatch({ type: 'skip' })
    setDraft('')
    goOn()
    inputRef.current?.focus()
  }

  function restart() {
    engine.pause()
    dispatch({ type: 'restart' })
    setDraft('')
  }

  const exit = useCallback(() => {
    const inProgress = state.attempts.length > 0 && state.phase !== 'finished'
    if (
      inProgress &&
      !window.confirm('Sair do ditado? As respostas deste treino serão perdidas.')
    ) {
      return
    }
    // Sessão interrompida não é salva, mas o tempo praticado conta para a meta e a sequência.
    if (state.phase !== 'finished') {
      clock.mark()
      void recordActivity(toLocalDate(new Date()), clock.elapsedMs() / 1000, 0).catch(() => {})
    }
    navigate(`/musica/${song.videoId}`)
  }, [clock, navigate, song.videoId, state.attempts.length, state.phase])

  // Fim da música: salva a sessão e abre o Resultado. Se não der para salvar, mostra o resumo.
  const saved = useRef(false)
  useEffect(() => {
    if (state.phase !== 'finished' || saved.current) return
    saved.current = true
    clock.mark()
    const endedAt = new Date()
    const session = buildDictationSession({
      id: crypto.randomUUID(),
      song,
      scored,
      lineCount: state.lineCount,
      settings,
      correction,
      startedAt: startedAt.current ?? endedAt,
      endedAt,
      activeMs: clock.elapsedMs(),
    })
    Promise.all([
      saveSession(session),
      recordActivity(toLocalDate(endedAt), session.durationSec, 1),
    ])
      .then(() => navigate(`/resultado/${session.id}`, { replace: true }))
      .catch(() => setSaveError('Não foi possível salvar a sessão neste navegador.'))
  }, [clock, correction, navigate, scored, settings, song, state.lineCount, state.phase])

  usePracticeShortcuts(engine, { onReplay: replay, onHint: hint })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') exit()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [exit])

  // Depois de corrigir, o foco vai para "Próximo verso": Enter segue.
  useEffect(() => {
    if (state.phase === 'checked') nextRef.current?.focus()
  }, [state.phase])

  const progress = target
    ? (lyricMs - target.startMs) / Math.max(1, target.endMs - target.startMs)
    : 0
  const ended = target ? lyricMs >= target.endMs - EDGE_TOLERANCE_MS * 2 : false
  const statusText =
    state.phase === 'ready'
      ? `APERTE ENTER PARA OUVIR O VERSO ${lineIndex + 1}`
      : state.phase === 'checked'
        ? 'CORRIGIDO · ENTER PARA SEGUIR'
        : playing
          ? `TOCANDO O VERSO ${lineIndex + 1}`
          : ended
            ? 'PAUSADO NO FIM DO VERSO'
            : 'PAUSADO'
  const previous = scored.slice(0, checked ? -1 : undefined).reverse()

  return (
    <div className={styles.page}>
      <PracticeHeader
        title={song.title}
        artist={song.artist}
        mode="DITADO"
        current={Math.min(state.target + 1, state.lineCount)}
        total={state.lineCount}
        metric={{ label: 'PRECISÃO', value: percent(stats.accuracy) }}
        onExit={exit}
      />

      <main className={styles.main}>
        {state.phase === 'finished' ? (
          saveError ? (
            <DictationSummary
              videoId={song.videoId}
              stats={stats}
              lineCount={state.lineCount}
              error={saveError}
              onRestart={restart}
            />
          ) : (
            <p role="status" className={styles.label}>
              SALVANDO A SESSÃO…
            </p>
          )
        ) : (
          <section aria-label="Ditado" className={styles.dictation}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>OUÇA.</h1>
              <span role="status" className={styles.label}>
                {statusText}
              </span>
            </div>

            <Waveform
              seed={target?.text ?? ''}
              progress={state.phase === 'ready' ? 0 : progress}
              label={`Progresso do verso ${lineIndex + 1}`}
            />

            {state.phase === 'ready' ? (
              <Button
                icon="arrowRight"
                className={styles.startButton}
                disabled={status !== 'ready'}
                onClick={start}
                autoFocus
              >
                {status === 'ready' ? `Ouvir o verso ${lineIndex + 1}` : 'Carregando o vídeo…'}
              </Button>
            ) : (
              <div className={styles.tools}>
                <button
                  type="button"
                  className={styles.toolStrong}
                  disabled={state.phase !== 'answering'}
                  onClick={replay}
                >
                  ↺ Ouvir de novo <span className={styles.count}>{state.replays}×</span>
                </button>
                <button
                  type="button"
                  className={styles.tool}
                  aria-pressed={rate < 1}
                  onClick={() => engine.setRate(rate < 1 ? 1 : 0.75)}
                >
                  Mais devagar <span className={styles.mono}>0,75×</span>
                </button>
                <button
                  type="button"
                  className={styles.tool}
                  aria-pressed={state.hintUsed}
                  disabled={state.phase !== 'answering'}
                  onClick={hint}
                >
                  Dica: 1ª letra
                </button>
                <button
                  type="button"
                  className={styles.toolGhost}
                  disabled={state.phase !== 'answering'}
                  onClick={skip}
                >
                  Pular
                </button>
              </div>
            )}

            <form className={styles.form} onSubmit={submit}>
              <label htmlFor="dictation-input" className={styles.label}>
                O QUE VOCÊ OUVIU?
              </label>
              <div className={styles.field}>
                <input
                  id="dictation-input"
                  ref={inputRef}
                  className={styles.input}
                  value={draft}
                  onChange={(event) => {
                    clock.mark()
                    setDraft(event.target.value)
                  }}
                  readOnly={state.phase === 'checked'}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder={
                    state.hintUsed && target ? firstLettersHint(target.text) : 'Digite o verso…'
                  }
                />
                <button
                  type="submit"
                  className={styles.confirm}
                  disabled={state.phase === 'checked'}
                >
                  CONFIRMAR ↵
                </button>
              </div>
            </form>

            {checked && (
              <div className={styles.result} aria-live="polite">
                <p className={styles.resultWords}>
                  {checked.result.words.map((word, i) => (
                    <WordToken
                      key={i}
                      expected={word.expected}
                      status={word.status}
                      typed={word.typed}
                      hint={word.hint}
                    />
                  ))}
                </p>
                {checked.result.extras.length > 0 && (
                  <p className={styles.extras}>
                    A mais: <s>{checked.result.extras.join(' ')}</s>
                  </p>
                )}
                <div className={styles.resultActions}>
                  <span className={styles.mono}>
                    VERSO {Math.round(checked.result.score * 100)}%
                  </span>
                  <Button ref={nextRef} icon="arrowRight" onClick={next}>
                    {state.target + 1 < state.lineCount ? 'Próximo verso' : 'Ver resultado'}
                  </Button>
                </div>
              </div>
            )}

            {previous.length > 0 && (
              <div className={styles.previous}>
                <h2 className={styles.previousTitle}>VERSOS ANTERIORES</h2>
                <ol className={styles.previousList} reversed>
                  {previous.map((attempt) => (
                    <li key={attempt.lineIndex} className={styles.previousRow}>
                      <span className={styles.previousNumber}>
                        {String(attempt.lineIndex + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.previousText}>
                        {attempt.skipped ? (
                          <span className={styles.skipped}>{lines[attempt.lineIndex]?.text}</span>
                        ) : (
                          attempt.result.words.map((word, i) => (
                            <WordToken
                              key={i}
                              expected={word.expected}
                              status={word.status}
                              typed={word.typed}
                              hint={word.hint}
                              compact
                            />
                          ))
                        )}
                      </span>
                      <span className={styles.mono}>
                        {attempt.skipped ? 'PULADO' : `${Math.round(attempt.result.score * 100)}%`}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        )}

        <aside className={styles.aside}>
          <VideoFrame ref={containerRef} videoId={song.videoId} status={status} error={error} />
          <p className={styles.note}>
            Clipes com legenda embutida podem mostrar a letra. Se for o caso, escolha outro vídeo da
            música (áudio oficial, sem legenda).
          </p>
          <div className={styles.setting}>
            <p className={styles.label} aria-hidden="true">
              CORREÇÃO
            </p>
            <Segmented
              label="Correção"
              value={correction}
              onChange={setCorrection}
              options={CORRECTION_OPTIONS}
            />
            <p className={styles.note}>{CORRECTION_NOTE[correction]}</p>
          </div>
          <StatusPanel title="SESSÃO">
            <StatusRow label="Palavras certas" value={`${stats.words.ok} / ${stats.words.total}`} />
            <StatusRow label="Repetições usadas" value={stats.replays + state.replays} />
            <StatusRow label="Dicas usadas" value={stats.hints + (state.hintUsed ? 1 : 0)} />
          </StatusPanel>
        </aside>
      </main>

      <KeyHintBar hints={HINTS} />
    </div>
  )
}
