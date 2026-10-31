import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppHeader } from './AppHeader'

function renderAt(path: string, streakDays?: number) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppHeader streakDays={streakDays} />
    </MemoryRouter>,
  )
  return within(screen.getByRole('navigation', { name: 'Principal' }))
}

describe('AppHeader', () => {
  it('marca só o item da rota atual com aria-current', () => {
    const nav = renderAt('/vocabulario')

    expect(nav.getByRole('link', { name: 'VOCABULÁRIO' })).toHaveAttribute('aria-current', 'page')
    expect(nav.getByRole('link', { name: 'ESTUDAR' })).not.toHaveAttribute('aria-current')
  })

  it.each(['/', '/musica/abcdefghijk', '/praticar/abcdefghijk/ditado'])(
    'ESTUDAR fica ativo no fluxo de estudo (%s)',
    (path) => {
      const nav = renderAt(path)
      expect(nav.getByRole('link', { name: 'ESTUDAR' })).toHaveAttribute('aria-current', 'page')
    },
  )

  it('ESTUDAR não fica ativo nas outras seções', () => {
    const nav = renderAt('/progresso')
    expect(nav.getByRole('link', { name: 'ESTUDAR' })).not.toHaveAttribute('aria-current')
    expect(nav.getByRole('link', { name: 'PROGRESSO' })).toHaveAttribute('aria-current', 'page')
  })

  it('mostra o streak com texto acessível e plural correto', () => {
    renderAt('/', 12)
    expect(screen.getByText(/12 dias/)).toHaveTextContent('Sequência: 12 dias')
  })

  it('usa singular para 1 dia', () => {
    renderAt('/', 1)
    expect(screen.getByText(/1 dia$/)).toBeInTheDocument()
  })

  it('sem streakDays não mostra o chip', () => {
    renderAt('/')
    expect(screen.queryByText(/Sequência/)).not.toBeInTheDocument()
  })
})
