import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { BoxMeter } from '@/components/BoxMeter/BoxMeter'
import { CategoryTabs } from './CategoryTabs'
import { tabPanelId } from './ids'

type Tab = 'recentes' | 'favoritas'

function Harness() {
  const [tab, setTab] = useState<Tab>('recentes')
  return (
    <>
      <CategoryTabs
        label="Biblioteca"
        idBase="lib"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'recentes', label: 'Recentes' },
          { id: 'favoritas', label: 'Favoritas' },
        ]}
      />
      <div role="tabpanel" id={tabPanelId('lib', tab)} aria-labelledby={`lib-tab-${tab}`}>
        painel {tab}
      </div>
    </>
  )
}

describe('CategoryTabs', () => {
  it('abas ligadas ao painel; ← → e clique trocam', async () => {
    render(<Harness />)
    const recentes = screen.getByRole('tab', { name: 'Recentes' })
    expect(recentes).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Recentes' })).toHaveTextContent('painel recentes')

    recentes.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Favoritas' })).toHaveFocus()
    expect(screen.getByRole('tabpanel', { name: 'Favoritas' })).toBeInTheDocument()

    await userEvent.keyboard('{ArrowRight}')
    expect(recentes).toHaveAttribute('aria-selected', 'true')

    await userEvent.click(screen.getByRole('tab', { name: 'Favoritas' }))
    expect(screen.getByRole('tab', { name: 'Favoritas' })).toHaveAttribute('aria-selected', 'true')
  })
})

describe('BoxMeter', () => {
  it('é uma imagem com descrição; marca os cheios', () => {
    const { container } = render(
      <BoxMeter
        label="Semana: praticou em 2 de 3 dias"
        items={[
          { label: 'S', filled: true },
          { label: 'T', filled: false },
          { label: 'Q', filled: true },
        ]}
      />,
    )
    expect(screen.getByRole('img', { name: 'Semana: praticou em 2 de 3 dias' })).toBeInTheDocument()
    const boxes = [...container.querySelectorAll('span')]
    expect(boxes[0]?.className).toBe(boxes[2]?.className)
    expect(boxes[0]?.className).not.toBe(boxes[1]?.className)
  })
})
