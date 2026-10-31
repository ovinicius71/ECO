import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusPanel, StatusRow } from './StatusPanel'

describe('StatusPanel', () => {
  it('é uma seção nomeada pelo título, com pares termo/valor', () => {
    render(
      <StatusPanel>
        <StatusRow label="Nível estimado" value="B1" />
        <StatusRow label="Palavras salvas" value="86" />
      </StatusPanel>,
    )

    expect(screen.getByRole('region', { name: 'STATUS' })).toBeInTheDocument()
    expect(screen.getAllByRole('term').map((el) => el.textContent)).toEqual([
      'Nível estimado',
      'Palavras salvas',
    ])
    expect(screen.getAllByRole('definition').map((el) => el.textContent)).toEqual(['B1', '86'])
  })
})
