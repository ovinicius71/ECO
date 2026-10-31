import { useEffect, useState } from 'react'

export type DbQuery<T> =
  { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; error: unknown }

/**
 * Lê do IndexedDB quando as dependências mudam. O resultado fica preso à chave das
 * dependências: chave nova = "loading" de novo, sem setState síncrono no effect.
 */
export function useDbQuery<T>(query: () => Promise<T>, deps: readonly unknown[]): DbQuery<T> {
  const key = JSON.stringify(deps)
  const [result, setResult] = useState<{ key: string; value: DbQuery<T> } | null>(null)

  useEffect(() => {
    let cancelled = false
    // Promise.resolve().then: erro síncrono (ex.: navegador sem IndexedDB) também vira 'error'.
    Promise.resolve()
      .then(query)
      .then((data) => {
        if (!cancelled) setResult({ key, value: { status: 'ready', data } })
      })
      .catch((error: unknown) => {
        if (!cancelled) setResult({ key, value: { status: 'error', error } })
      })
    return () => {
      cancelled = true
    }
    // A consulta é refeita só quando as dependências declaradas mudam (pela chave).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return result?.key === key ? result.value : { status: 'loading' }
}
