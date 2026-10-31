import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WordToken } from './WordToken'

describe('WordToken', () => {
  it('ok não tem anotação', () => {
    const { container } = render(<WordToken expected="radio" status="ok" typed="radio" />)
    expect(container).toHaveTextContent(/^radio$/)
  })

  it('quase descreve o que foi digitado para leitores de tela', () => {
    render(<WordToken expected="radio" status="near" typed="radyo" />)
    expect(screen.getByText(/quase: você digitou radyo/)).toHaveClass('sr-only')
  })

  it('errado mostra o digitado riscado e a dica de junção', () => {
    const { container } = render(
      <WordToken expected="almost" status="wrong" typed="all most" hint="merge" />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('all most')
    expect(screen.getByText(/errado: você digitou all most; é uma palavra só/)).toBeInTheDocument()
  })

  it('faltando mostra "—"', () => {
    const { container } = render(<WordToken expected="the" status="missing" />)
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('—')
    expect(screen.getByText(/faltou/)).toBeInTheDocument()
  })

  it('compacto não mostra o digitado, mas mantém o texto acessível', () => {
    const { container } = render(<WordToken expected="sea" status="wrong" typed="see" compact />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
    expect(screen.getByText(/errado: você digitou see/)).toBeInTheDocument()
  })
})
