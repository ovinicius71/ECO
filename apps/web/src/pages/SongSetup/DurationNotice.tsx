import { useEffect, useState } from 'react'
import { Button } from '@/components/Button/Button'
import { durationMismatch, findDurationMatch } from '@/features/lyrics/durationMatch'
import { lyricsCandidates, type LyricsCandidate } from '@/lib/api/songs'
import { formatDuration } from '@/lib/utils/time'
import type { Song } from '@/types/song'
import styles from './SongSetup.module.css'

interface DurationNoticeProps {
  song: Song
  /** Duração real do vídeo, vinda do player (0 enquanto carrega). */
  videoMs: number
  onPickVersion: (lrclibId: number) => Promise<void>
}

/** Avisa quando a letra e o vídeo têm durações diferentes e sugere a versão compatível. */
export function DurationNotice({ song, videoMs, onPickVersion }: DurationNoticeProps) {
  const mismatch = durationMismatch(song.durationSec, videoMs)
  const query = `${song.artist} ${song.title}`
  const [found, setFound] = useState<{ query: string; match?: LyricsCandidate } | null>(null)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    if (!mismatch) return
    const controller = new AbortController()
    lyricsCandidates(query, controller.signal)
      .then((candidates) => {
        if (controller.signal.aborted) return
        setFound({ query, match: findDurationMatch(candidates, videoMs, song.lrclibId) })
      })
      // Sem sugestão em caso de erro: o aviso continua e "Trocar versão" segue disponível.
      .catch(() => {
        if (!controller.signal.aborted) setFound({ query })
      })
    return () => controller.abort()
  }, [mismatch, query, videoMs, song.lrclibId])

  if (!mismatch) return null
  const match = found?.query === query ? found.match : undefined

  return (
    <div role="note" className={styles.notice}>
      <p>
        A letra tem <span className={styles.metaValue}>{formatDuration(song.durationSec)}</span> e o
        vídeo <span className={styles.metaValue}>{formatDuration(videoMs / 1000)}</span>: pode estar
        dessincronizada.
      </p>
      {match && (
        <Button
          variant="outline"
          disabled={switching}
          onClick={async () => {
            setSwitching(true)
            try {
              await onPickVersion(match.lrclibId)
            } finally {
              setSwitching(false)
            }
          }}
        >
          Usar a versão de {formatDuration(match.durationSec)}
        </Button>
      )}
    </div>
  )
}
