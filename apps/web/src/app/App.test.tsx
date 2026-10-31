import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('abre a Home em /', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Aprenda inglês')
  })

  it('abre a vitrine em /dev/ui (dev)', async () => {
    window.history.pushState({}, '', '/dev/ui')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Componentes' })).toBeInTheDocument()
    window.history.pushState({}, '', '/')
  })
})
