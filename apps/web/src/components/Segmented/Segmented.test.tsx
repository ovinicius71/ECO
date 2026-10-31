import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Segmented } from './Segmented'

type Speed = '0.5' | '0.75' | '1'

function Speeds() {
  const [value, setValue] = useState<Speed>('1')
  return (
    <Segmented
      label="Velocidade"
      value={value}
      onChange={setValue}
      options={[
        { value: '0.5', label: '0,5×' },
        { value: '0.75', label: '0,75×' },
        { value: '1', label: '1×' },
      ]}
    />
  )
}

describe('Segmented', () => {
  it('marca a opção atual e deixa só ela no Tab', () => {
    render(<Speeds />)
    const current = screen.getByRole('radio', { name: '1×' })

    expect(screen.getByRole('radiogroup', { name: 'Velocidade' })).toBeInTheDocument()
    expect(current).toHaveAttribute('aria-checked', 'true')
    expect(current).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('radio', { name: '0,5×' })).toHaveAttribute('tabindex', '-1')
  })

  it('troca pelo clique', async () => {
    render(<Speeds />)
    await userEvent.click(screen.getByRole('radio', { name: '0,75×' }))
    expect(screen.getByRole('radio', { name: '0,75×' })).toHaveAttribute('aria-checked', 'true')
  })

  it('setas trocam a opção, dão a volta e levam o foco junto', async () => {
    render(<Speeds />)
    await userEvent.click(screen.getByRole('radio', { name: '1×' }))
    await userEvent.keyboard('{ArrowRight}')

    const first = screen.getByRole('radio', { name: '0,5×' })
    expect(first).toHaveAttribute('aria-checked', 'true')
    expect(first).toHaveFocus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: '1×' })).toHaveFocus()
  })
})
