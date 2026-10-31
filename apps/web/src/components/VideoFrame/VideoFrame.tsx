import type { Ref } from 'react'
import { Icon } from '@/components/Icon/Icon'
import styles from './VideoFrame.module.css'

interface VideoFrameProps {
  /** Onde o player é montado (o YouTube coloca o iframe aqui dentro). */
  ref?: Ref<HTMLDivElement>
  videoId: string
  status: 'loading' | 'ready' | 'error'
  error?: string
}

/** Moldura 16:9 do vídeo, com o placeholder hachurado enquanto carrega e a mensagem de erro. */
export function VideoFrame({ ref, videoId, status, error }: VideoFrameProps) {
  return (
    <div className={styles.frame}>
      <div ref={ref} className={styles.mount} />
      {status === 'loading' && (
        <div role="status" className={styles.overlay}>
          <Icon name="play" size={54} strokeWidth={1.2} />
          <span className={styles.label}>CARREGANDO VÍDEO…</span>
        </div>
      )}
      {status === 'error' && (
        <div role="alert" className={styles.overlay}>
          <p className={styles.message}>{error}</p>
          <a
            className={styles.link}
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir no YouTube ↗
          </a>
        </div>
      )}
    </div>
  )
}
