import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Waveform } from './Waveform'

const heightsOf = (container: HTMLElement) =>
  [...container.querySelectorAll('span')].map((bar) => bar.style.height)

describe('Waveform', () => {
  it('é um indicador de progresso nomeado', () => {
    render(<Waveform seed="verso" progress={0.42} label="Progresso do verso 4" />)
    expect(screen.getByRole('progressbar', { name: 'Progresso do verso 4' })).toHaveAttribute(
      'aria-valuenow',
      '42',
    )
  })

  it('o mesmo verso dá sempre o mesmo desenho; outro verso, outro desenho', () => {
    const a = render(<Waveform seed="Like a radio" progress={0} label="a" bars={16} />)
    const b = render(<Waveform seed="Like a radio" progress={0} label="b" bars={16} />)
    const c = render(<Waveform seed="Hold on" progress={0} label="c" bars={16} />)
    expect(heightsOf(a.container)).toEqual(heightsOf(b.container))
    expect(heightsOf(a.container)).not.toEqual(heightsOf(c.container))
  })

  it('pinta as barras já tocadas', () => {
    const { container } = render(<Waveform seed="x" progress={0.5} label="p" bars={10} />)
    const classes = [...container.querySelectorAll('span')].map((bar) => bar.className)
    expect(new Set(classes.slice(0, 5)).size).toBe(1)
    expect(classes[0]).not.toBe(classes[9])
  })
})
