import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { ButtonLink } from '@/components/Button/Button'
import { parseDictationSettings } from '@/features/dictation/settings'
import { loadSong } from '@/features/lyrics/loadSong'
import type { Song } from '@/types/song'
import styles from './Dictation.module.css'
import { DictationSession } from './DictationSession'

type Loaded = { id: string; song?: Song; error?: string }

/** Rota /praticar/:videoId/ditado: carrega a música e os ajustes, e abre a sessão. */
export function Dictation() {
  const { videoId = '' } = useParams()
  const [params] = useSearchParams()
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    loadSong(videoId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setLoaded(
          result.status === 'found'
            ? { id: videoId, song: result.song }
            : { id: videoId, error: 'Não encontramos a letra desta música.' },
        )
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoaded({ id: videoId, error: error instanceof Error ? error.message : String(error) })
      })
    return () => controller.abort()
  }, [videoId])

  if (loaded?.id !== videoId) {
    return (
      <p role="status" className={styles.loading}>
        CARREGANDO A MÚSICA…
      </p>
    )
  }
  if (!loaded.song) {
    return (
      <div role="alert" className={styles.loading}>
        <p>{loaded.error}</p>
        <ButtonLink to={`/musica/${videoId}`} variant="outline">
          ← Voltar à música
        </ButtonLink>
      </div>
    )
  }
  return (
    <DictationSession key={videoId} song={loaded.song} settings={parseDictationSettings(params)} />
  )
}
