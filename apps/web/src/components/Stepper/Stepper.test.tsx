import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Stepper } from './Stepper'

describe('Stepper', () => {
  it('é um grupo nomeado com botões − e + acessíveis', async () => {
    const onDecrement = vi.fn()
    const onIncrement = vi.fn()
    render(
      <Stepper
        label="AJUSTE DE SINCRONIA"
        value="−0,4 s"
        decrementLabel="Atrasar letra"
        incrementLabel="Adiantar letra"
        onDecrement={onDecrement}
        onIncrement={onIncrement}
      />,
    )

    expect(screen.getByRole('group', { name: 'AJUSTE DE SINCRONIA' })).toHaveTextContent('−0,4 s')
    await userEvent.click(screen.getByRole('button', { name: 'Atrasar letra' }))
    await userEvent.click(screen.getByRole('button', { name: 'Adiantar letra' }))
    expect(onDecrement).toHaveBeenCalledOnce()
    expect(onIncrement).toHaveBeenCalledOnce()
  })
})
