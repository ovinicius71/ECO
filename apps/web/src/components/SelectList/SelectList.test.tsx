import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectList } from './SelectList'

const songs = ['Paper Moon Radio', 'Northbound Lights', 'Glass Garden']

function setup() {
  const onActivate = vi.fn()
  render(
    <SelectList
      label="Recentes"
      items={songs}
      getKey={(song) => song}
      renderItem={(song) => song}
      onActivate={onActivate}
    />,
  )
  const option = (name: string) => screen.getByRole('option', { name })
  return { onActivate, option }
}

describe('SelectList', () => {
  it('começa com a primeira linha selecionada', () => {
    const { option } = setup()
    expect(screen.getByRole('listbox', { name: 'Recentes' })).toBeInTheDocument()
    expect(option('Paper Moon Radio')).toHaveAttribute('aria-selected', 'true')
  })

  it('o hover move a barra sem mover o foco', () => {
    const { option } = setup()
    fireEvent.mouseEnter(option('Glass Garden'))

    expect(option('Glass Garden')).toHaveAttribute('aria-selected', 'true')
    expect(option('Paper Moon Radio')).toHaveAttribute('aria-selected', 'false')
    expect(option('Glass Garden')).not.toHaveFocus()
  })

  it('↓/↑/End movem barra e foco, sem passar do fim', async () => {
    const { option } = setup()
    option('Paper Moon Radio').focus()

    await userEvent.keyboard('{ArrowDown}')
    expect(option('Northbound Lights')).toHaveFocus()
    expect(option('Northbound Lights')).toHaveAttribute('aria-selected', 'true')

    await userEvent.keyboard('{End}{ArrowDown}')
    expect(option('Glass Garden')).toHaveFocus()

    await userEvent.keyboard('{ArrowUp}')
    expect(option('Northbound Lights')).toHaveFocus()
  })

  it('Enter e clique ativam a linha', async () => {
    const { onActivate, option } = setup()
    option('Paper Moon Radio').focus()

    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onActivate).toHaveBeenLastCalledWith('Northbound Lights', 1)

    await userEvent.click(option('Glass Garden'))
    expect(onActivate).toHaveBeenLastCalledWith('Glass Garden', 2)
  })
})
