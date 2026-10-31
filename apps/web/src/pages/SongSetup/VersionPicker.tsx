import { useEffect, useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/Button/Button'
import { SelectList } from '@/components/SelectList/SelectList'
import { ApiError } from '@/lib/api/client'
import { lyricsCandidates, type LyricsCandidate } from '@/lib/api/songs'
import { formatDuration } from '@/lib/utils/time'
import styles from './SongSetup.module.css'

type State =
  | { kind: 'loading' }
  | { kind: 'list'; items: LyricsCandidate[] }
  | { kind: 'error'; message: string }

interface VersionPickerProps {
  initialQuery: string
  onPick: (lrclibId: number) => Promise<void>
}

/** "Trocar versão da letra": candidatos do LRCLIB com busca editável. */
export function VersionPicker({ initialQuery, onPick }: VersionPickerProps) {
  const inputId = useId()
  const [query, setQuery] = useState(initialQuery)
  const [search, setSearch] = useState(initialQuery)
  // Resultado ligado à busca que o gerou: busca diferente = ainda carregando.
  const [result, setResult] = useState<{ search: string; state: State } | null>(null)
  const state: State = result?.search === search ? result.state : { kind: 'loading' }
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const settle = (next: State) => {
      if (!controller.signal.aborted) setResult({ search, state: next })
    }
    lyricsCandidates(search, controller.signal)
      .then((items) => settle({ kind: 'list', items }))
      .catch((error: unknown) =>
        settle({
          kind: 'error',
          message: error instanceof ApiError ? error.message : 'Não foi possível buscar.',
        }),
      )
    return () => controller.abort()
  }, [search])

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (query.trim()) setSearch(query.trim())
  }

  async function pick(candidate: LyricsCandidate) {
    setPicking(true)
    try {
      await onPick(candidate.lrclibId)
    } finally {
      setPicking(false)
    }
  }

  return (
    <div className={styles.versions}>
      <form className={styles.versionSearch} onSubmit={onSubmit}>
        <label htmlFor={inputId} className={styles.label}>
          BUSCAR NO LRCLIB
        </label>
        <div className={styles.versionField}>
          <input
            id={inputId}
            className={styles.versionInput}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </div>
      </form>

      <div role="status" className={styles.versionStatus}>
        {state.kind === 'loading' && 'BUSCANDO VERSÕES…'}
        {state.kind === 'error' && state.message}
        {state.kind === 'list' && state.items.length === 0 && 'Nenhuma versão encontrada.'}
        {picking && 'CARREGANDO A LETRA…'}
      </div>

      {state.kind === 'list' && state.items.length > 0 && (
        <SelectList
          label="Versões da letra"
          items={state.items}
          getKey={(c) => String(c.lrclibId)}
          onActivate={(candidate) => void pick(candidate)}
          renderItem={(c) => (
            <>
              <span className={styles.modeText}>
                <span className={styles.modeName}>{c.track}</span>
                <span className={styles.modeShort}>
                  {c.artist}
                  {c.album ? ` · ${c.album}` : ''}
                </span>
              </span>
              <span className={styles.mono}>{formatDuration(c.durationSec)}</span>
              <span className={styles.mono}>{c.synced ? 'SINCRONIZADA' : 'SIMPLES'}</span>
            </>
          )}
        />
      )}
    </div>
  )
}
