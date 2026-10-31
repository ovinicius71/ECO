import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Gauge } from './Gauge'

describe('Gauge', () => {
  it('expõe o progresso em porcentagem', () => {
    render(<Gauge value={0.7} label="Meta de hoje" />)
    expect(screen.getByRole('progressbar', { name: 'Meta de hoje' })).toHaveAttribute(
      'aria-valuenow',
      '70',
    )
  })

  it.each([
    [-0.5, '0'],
    [1.4, '100'],
  ])('limita %s a %s%%', (value, expected) => {
    render(<Gauge value={value} label="Progresso" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', expected)
  })
})
