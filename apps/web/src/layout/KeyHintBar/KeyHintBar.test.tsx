import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KeyHintBar } from './KeyHintBar'

describe('KeyHintBar', () => {
  it('lista cada atalho com a tecla em <kbd>', () => {
    render(
      <KeyHintBar
        hints={[
          { keys: 'CTRL V', label: 'COLAR LINK' },
          { keys: 'ENTER', label: 'BUSCAR' },
        ]}
        aside="SALVO NESTE NAVEGADOR"
      />,
    )
    const items = within(screen.getByRole('list', { name: 'Atalhos de teclado' })).getAllByRole(
      'listitem',
    )

    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('CTRL VCOLAR LINK')
    expect(items[0]?.querySelector('kbd')).toHaveTextContent('CTRL V')
    expect(screen.getByText('SALVO NESTE NAVEGADOR')).toBeInTheDocument()
  })
})
