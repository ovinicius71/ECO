import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDbQuery } from './useDbQuery'

function Probe({ query, dep }: { query: () => Promise<string>; dep: string }) {
  const result = useDbQuery(query, [dep])
  return <p>{result.status === 'ready' ? result.data : result.status}</p>
}

describe('useDbQuery', () => {
  it('carrega e mostra o dado', async () => {
    render(<Probe dep="a" query={async () => 'pronto'} />)
    expect(screen.getByText('loading')).toBeInTheDocument()
    expect(await screen.findByText('pronto')).toBeInTheDocument()
  })

  it('erro síncrono (ex.: sem IndexedDB) vira estado de erro, sem derrubar a tela', async () => {
    const throwsNow = () => {
      throw new Error('IndexedDB API missing')
    }
    render(<Probe dep="b" query={throwsNow} />)
    expect(await screen.findByText('error')).toBeInTheDocument()
  })
})
