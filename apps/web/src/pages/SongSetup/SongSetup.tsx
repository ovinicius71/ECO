import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Button, ButtonLink } from '@/components/Button/Button'
import { StatusPanel, StatusRow } from '@/components/StatusPanel/StatusPanel'
import { Stepper } from '@/components/Stepper/Stepper'
import { VideoFrame } from '@/components/VideoFrame/VideoFrame'
import { loadSong, switchVersion } from '@/features/lyrics/loadSong'
import { countWords } from '@/features/lyrics/toLines'
import { OFFSET_STEP_MS, formatOffset } from '@/features/player/sync'
import { useOffsetPersistence } from '@/features/player/useOffsetPersistence'
import { usePlayer, usePlayerState } from '@/features/player/usePlayer'
import { AppHeader } from '@/layout/AppHeader/AppHeader'
import { KeyHintBar } from '@/layout/KeyHintBar/KeyHintBar'
import type { Song, SyncKind } from '@/types/song'
import { DurationNotice } from './DurationNotice'
import { ModePicker } from './ModePicker'
import styles from './SongSetup.module.css'
import { VersionPicker } from './VersionPicker'

type State =
  | { kind: 'loading' }
  | { kind: 'found'; song: Song }
  | { kind: 'not-found'; query: string; title: string }
  | { kind: 'error'; message: string }

const SYNC_LABEL: Record<SyncKind, string> = {
  line: 'POR LINHA ✓',
  word: 'POR PALAVRA ✓',
  estimated: 'ESTIMADA',
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const HINTS = [
  { keys: '↑ ↓', label: 'ESCOLHER MODO' },
  { keys: 'ENTER', label: 'COMEÇAR' },
  { keys: 'ESC', label: 'VOLTAR' },
]

export function SongSetup() {
  const { videoId = '' } = useParams()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  // O resultado guarda a chave da requisição: chave diferente = ainda carregando.
  const requestKey = `${videoId}#${attempt}`
  const [result, setResult] = useState<{ key: string; state: State } | null>(null)
  const state: State = result?.key === requestKey ? result.state : { kind: 'loading' }

  useEffect(() => {
    const controller = new AbortController()
    const settle = (next: State) => {
      if (!controller.signal.aborted) setResult({ key: requestKey, state: next })
    }
    loadSong(videoId, controller.signal)
      .then((loaded) =>
        settle(
          loaded.status === 'found'
            ? { kind: 'found', song: loaded.song }
            : { kind: 'not-found', ...loaded },
        ),
      )
      .catch((error: unknown) => settle({ kind: 'error', message: errorMessage(error) }))
    return () => controller.abort()
  }, [videoId, requestKey])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  const pickVersion = useCallback(
    async (lrclibId: number) => {
      try {
        const song = await switchVersion(videoId, lrclibId)
        setResult({ key: requestKey, state: { kind: 'found', song } })
      } catch (error) {
        setResult({ key: requestKey, state: { kind: 'error', message: errorMessage(error) } })
      }
    },
    [videoId, requestKey],
  )

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.main}>
        {state.kind === 'loading' && (
          <div role="status" className={styles.loading}>
            <p className={styles.label}>BUSCANDO LETRA…</p>
            <div className={styles.loadingBar} />
          </div>
        )}

        {state.kind === 'error' && (
          <div role="alert" className={styles.problem}>
            <h1 className={styles.problemTitle}>NÃO DEU PARA CARREGAR</h1>
            <p>{state.message}</p>
            <div className={styles.actions}>
              <Button onClick={() => setAttempt((n) => n + 1)}>Tentar de novo</Button>
              <ButtonLink to="/" variant="ghost">
                ← Voltar
              </ButtonLink>
            </div>
          </div>
        )}

        {state.kind === 'not-found' && (
          <div className={styles.problem}>
            <h1 className={styles.problemTitle}>LETRA NÃO ENCONTRADA</h1>
            <p>
              Não achamos a letra de <q>{state.title}</q> automaticamente. Escolha uma versão abaixo
              ou ajuste a busca.
            </p>
            <VersionPicker initialQuery={state.query} onPick={pickVersion} />
            <ButtonLink to="/" variant="ghost">
              ← Voltar
            </ButtonLink>
          </div>
        )}

        {state.kind === 'found' && (
          <>
            <SongColumn song={state.song} onPickVersion={pickVersion} />
            <ModePicker videoId={state.song.videoId} />
          </>
        )}
      </main>
      <KeyHintBar hints={HINTS} />
    </div>
  )
}

function SongColumn({
  song,
  onPickVersion,
}: {
  song: Song
  onPickVersion: (lrclibId: number) => Promise<void>
}) {
  const [picking, setPicking] = useState(false)
  // Controles nativos do YouTube aqui; a PlayerBar do Eco fica para as telas de prática.
  const { containerRef, engine } = usePlayer({
    videoId: song.videoId,
    lines: song.lines,
    offsetMs: song.offsetMs,
    controls: true,
  })
  useOffsetPersistence(engine, song.videoId)
  const status = usePlayerState(engine, (s) => s.status)
  const error = usePlayerState(engine, (s) => s.error)
  const lineIndex = usePlayerState(engine, (s) => s.lineIndex)
  const videoMs = usePlayerState(engine, (s) => s.videoMs)
  const durationMs = usePlayerState(engine, (s) => s.durationMs)
  const offsetMs = usePlayerState(engine, (s) => s.offsetMs)

  return (
    <section aria-label="Música" className={styles.song}>
      <Link to="/" className={styles.back}>
        ← VOLTAR
      </Link>
      <VideoFrame ref={containerRef} videoId={song.videoId} status={status} error={error} />
      <div className={styles.now}>
        <p className={styles.label}>AGORA</p>
        <p className={styles.nowLine}>{song.lines[lineIndex]?.text ?? (videoMs > 0 ? '♪' : '—')}</p>
      </div>
      <div>
        <h1 className={styles.songTitle}>{song.title}</h1>
        <p className={styles.songArtist}>{song.artist}</p>
      </div>
      <StatusPanel title="MÚSICA">
        <StatusRow label="Idioma detectado" value={song.lang.toUpperCase()} />
        <StatusRow label="Fonte da letra" value={song.source.toUpperCase()} />
        <StatusRow label="Sincronia" value={SYNC_LABEL[song.synced]} />
        <StatusRow
          label="Versos · palavras"
          value={`${song.lines.length} · ${countWords(song.lines)}`}
        />
        <StatusRow label="Dificuldade" value="—" />
      </StatusPanel>
      <Stepper
        label="AJUSTE DE SINCRONIA"
        value={formatOffset(offsetMs)}
        decrementLabel="Atrasar letra"
        incrementLabel="Adiantar letra"
        onDecrement={() => engine.setOffset(offsetMs - OFFSET_STEP_MS)}
        onIncrement={() => engine.setOffset(offsetMs + OFFSET_STEP_MS)}
      />
      <DurationNotice song={song} videoMs={durationMs} onPickVersion={onPickVersion} />
      <div className={styles.wrong}>
        <p className={styles.label}>LETRA ERRADA?</p>
        <button
          type="button"
          className={styles.textButton}
          aria-expanded={picking}
          onClick={() => setPicking((open) => !open)}
        >
          Trocar versão da letra
        </button>
      </div>
      {picking && (
        <VersionPicker
          initialQuery={`${song.artist} ${song.title}`}
          onPick={async (id) => {
            await onPickVersion(id)
            setPicking(false)
          }}
        />
      )}
    </section>
  )
}
