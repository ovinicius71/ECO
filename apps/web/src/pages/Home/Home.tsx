import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/Button/Button'
import { Chip } from '@/components/Chip/Chip'
import { Icon } from '@/components/Icon/Icon'
import { AppHeader } from '@/layout/AppHeader/AppHeader'
import { KeyHintBar } from '@/layout/KeyHintBar/KeyHintBar'
import { ApiError } from '@/lib/api/client'
import { resolveSong } from '@/lib/api/songs'
import styles from './Home.module.css'

const STEPS = [
  { title: 'Cole o link', text: 'A letra é buscada e sincronizada com o vídeo.' },
  { title: 'Escolha um modo', text: 'Digitar, preencher, ditado, escolha, karaokê ou assistir.' },
  { title: 'Salve palavras', text: 'Clique em qualquer palavra e revise depois.' },
]

type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string }

export function Home() {
  const navigate = useNavigate()
  const inputId = useId()
  const errorId = useId()
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!url.trim()) {
      setStatus({ kind: 'error', message: 'Cole um link do YouTube.' })
      return
    }
    setStatus({ kind: 'loading' })
    try {
      const { videoId } = await resolveSong(url)
      navigate(`/musica/${videoId}`)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Algo deu errado. Tente de novo.'
      setStatus({ kind: 'error', message })
    }
  }

  const loading = status.kind === 'loading'

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.label}>01 / NOVA MÚSICA</p>
          <h1 className={styles.title}>
            Aprenda inglês pelo que você <strong>ouve</strong>.
          </h1>
          <p className={styles.motto}>
            <span lang="ja">聞いて、書いて、覚える。</span> — ouvir, escrever, lembrar.
          </p>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <label htmlFor={inputId} className={styles.label}>
              LINK DO YOUTUBE
            </label>
            <div className={styles.field}>
              <Icon name="youtube" size={20} strokeWidth={1.6} className={styles.fieldIcon} />
              <input
                id={inputId}
                className={styles.input}
                type="text"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                aria-invalid={status.kind === 'error'}
                aria-describedby={status.kind === 'error' ? errorId : undefined}
              />
              <Button type="submit" icon="arrowRight" disabled={loading} className={styles.submit}>
                {loading ? 'Buscando…' : 'Buscar letra'}
              </Button>
            </div>
            {status.kind === 'error' && (
              <p id={errorId} role="alert" className={styles.error}>
                {status.message}
              </p>
            )}
            <p className={styles.note}>◆ Letra sincronizada via LRCLIB</p>
          </form>
        </section>

        <aside className={styles.howTo} aria-labelledby={`${inputId}-how`}>
          <h2 id={`${inputId}-how`} className={styles.label}>
            COMO FUNCIONA
          </h2>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className={styles.stepTitle}>{step.title}</p>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.chips}>
            <Chip>Inglês</Chip>
            <Chip variant="dashed">
              <span lang="ja">日本語</span> · em breve
            </Chip>
          </div>
        </aside>
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
