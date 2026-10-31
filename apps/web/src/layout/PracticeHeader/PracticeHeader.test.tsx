import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PracticeHeader } from './PracticeHeader'

describe('PracticeHeader', () => {
  it('mostra música, modo, verso e métrica; SAIR chama onExit', async () => {
    const onExit = vi.fn()
    render(
      <PracticeHeader
        title="Paper Moon Radio"
        artist="The Quiet Arcade"
        mode="DITADO"
        current={4}
        total={32}
        metric={{ label: 'PRECISÃO', value: '95%' }}
        onExit={onExit}
      />,
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveTextContent('Paper Moon Radio')
    expect(header).toHaveTextContent('DITADO')
    expect(header).toHaveTextContent('04/32')
    expect(header).toHaveTextContent('PRECISÃO 95%')
    expect(screen.getByRole('progressbar', { name: 'Progresso da música' })).toHaveAttribute(
      'aria-valuenow',
      '13',
    )

    await userEvent.click(screen.getByRole('button', { name: '← SAIR' }))
    expect(onExit).toHaveBeenCalledOnce()
  })
})
