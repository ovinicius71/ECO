import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Button, ButtonLink } from './Button'

describe('Button', () => {
  it('é um <button type="button"> clicável', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Buscar letra</Button>)
    const button = screen.getByRole('button', { name: 'Buscar letra' })

    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('não dispara quando desabilitado', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Começar
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('ButtonLink', () => {
  it('é um link de verdade', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/vocabulario" icon="arrowRight">
          Revisar
        </ButtonLink>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Revisar' })).toHaveAttribute('href', '/vocabulario')
  })
})
