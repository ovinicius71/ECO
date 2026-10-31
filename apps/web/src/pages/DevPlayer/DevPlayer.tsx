import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Segmented } from '@/components/Segmented/Segmented'
import { Stepper } from '@/components/Stepper/Stepper'
import { VideoFrame } from '@/components/VideoFrame/VideoFrame'
import { loadSong } from '@/features/lyrics/loadSong'
import { OFFSET_STEP_MS, formatOffset, type LineMode } from '@/features/player/sync'
import { useOffsetPersistence } from '@/features/player/useOffsetPersistence'
import { usePlayer, usePlayerState } from '@/features/player/usePlayer'
import { usePracticeShortcuts } from '@/features/player/usePracticeShortcuts'
import { KeyHintBar } from '@/layout/KeyHintBar/KeyHintBar'
import { PlayerBar } from '@/layout/PlayerBar/PlayerBar'
import type { Song } from '@/types/song'
import styles from './DevPlayer.module.css'

const MODES: { value: LineMode; label: string }[] = [
  { value: 'off', label: 'Livre' },
  { value: 'loop', label: 'Repetir verso' },
  { value: 'pause-at-end', label: 'Pausar no fim' },
]

const HINTS = [
  { keys: 'TAB', label: 'REPETIR VERSO' },
  { keys: 'CTRL ESPAÇO', label: 'PAUSAR' },
  { keys: 'CTRL ↓', label: 'MAIS DEVAGAR' },
  { keys: 'CTRL ↑', label: 'MAIS RÁPIDO' },
]

/** Bancada de teste do player (só em dev): tudo da Parte 03 ligado, sem tela de modo ainda. */
export function DevPlayer() {
  const { videoId = '' } = useParams()
  const [result, setResult] = useState<{ id: string; song?: Song; error?: string } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    loadSong(videoId, controller.signal)
      .then((loaded) => {
        if (controller.signal.aborted) return
        setResult(
          loaded.status === 'found'
            ? { id: videoId, song: loaded.song }
            : { id: videoId, error: 'Letra não encontrada. Abra a música em /musica primeiro.' },
        )
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ id: videoId, error: String(error) })
      })
    return () => controller.abort()
  }, [videoId])

  if (result?.id !== videoId) return <p className={styles.status}>CARREGANDO…</p>
  if (!result.song) return <p className={styles.status}>{result.error}</p>
  return <Bench key={videoId} song={result.song} />
}

function Bench({ song }: { song: Song }) {
  const { containerRef, engine } = usePlayer({
    videoId: song.videoId,
    lines: song.lines,
    offsetMs: song.offsetMs,
  })
  usePracticeShortcuts(engine)
  useOffsetPersistence(engine, song.videoId)

  const status = usePlayerState(engine, (s) => s.status)
  const error = usePlayerState(engine, (s) => s.error)
  const playing = usePlayerState(engine, (s) => s.playing)
  const videoMs = usePlayerState(engine, (s) => s.videoMs)
  const durationMs = usePlayerState(engine, (s) => s.durationMs)
  const rate = usePlayerState(engine, (s) => s.rate)
  const rates = usePlayerState(engine, (s) => s.rates)
  const lineIndex = usePlayerState(engine, (s) => s.lineIndex)
  const offsetMs = usePlayerState(engine, (s) => s.offsetMs)
  const mode = usePlayerState(engine, (s) => s.mode)

  const current = song.lines[lineIndex]

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.video}>
          <VideoFrame ref={containerRef} videoId={song.videoId} status={status} error={error} />
        </div>
        <section aria-label="Letra" className={styles.lyrics}>
          <p className={styles.label}>
            {song.title} · {song.artist} · VERSO {lineIndex >= 0 ? lineIndex + 1 : '—'}/
            {song.lines.length}
          </p>
          <p className={styles.dim}>{song.lines[lineIndex - 1]?.text ?? ' '}</p>
          <p className={styles.current}>{current?.text ?? (videoMs > 0 ? '♪' : '—')}</p>
          <p className={styles.dim}>{song.lines[lineIndex + 1]?.text ?? ' '}</p>
          <div className={styles.controls}>
            <div>
              <p className={styles.label} aria-hidden="true">
                VERSO
              </p>
              <Segmented label="Verso" value={mode} onChange={engine.setMode} options={MODES} />
            </div>
            <Stepper
              label="AJUSTE DE SINCRONIA"
              value={formatOffset(offsetMs)}
              decrementLabel="Atrasar letra"
              incrementLabel="Adiantar letra"
              onDecrement={() => engine.setOffset(offsetMs - OFFSET_STEP_MS)}
              onIncrement={() => engine.setOffset(offsetMs + OFFSET_STEP_MS)}
            />
          </div>
        </section>
      </main>
      <PlayerBar
        playing={playing}
        currentMs={videoMs}
        durationMs={durationMs}
        rate={rate}
        rates={rates}
        disabled={status !== 'ready'}
        onTogglePlay={engine.togglePlay}
        onSeek={engine.seek}
        onReplayLine={engine.replayLine}
        onRateChange={engine.setRate}
      />
      <KeyHintBar hints={HINTS} aside="BANCADA DE TESTE · SÓ EM DEV" />
    </div>
  )
}
