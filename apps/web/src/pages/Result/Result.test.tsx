import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { scoreLine } from '@/features/correction'
import { bestAccuracy, getSession, listActivity } from '@/lib/db/sessions'
import type { PracticeSession } from '@/types/practice'
import { Result } from './Result'

vi.mock('@/lib/db/sessions', () => ({
  getSession: vi.fn(),
  bestAccuracy: vi.fn(),
  listActivity: vi.fn(async () => []),
}))

// Versos inventados (fixture "Paper Moon Radio").
const attempt = (lineIndex: number, expected: string, typed: string, skipped = false) => ({
  lineIndex,
  expected,
  typed,
  skipped,
  result: skipped
    ? { ...scoreLine(expected, '', 'tolerant'), score: 0 }
    : scoreLine(expected, typed, 'tolerant'),
  replays: 1,
  hintsUsed: 0,
})

const session: PracticeSession = {
  id: 's1',
  videoId: 'abcdefghijk',
  mode: 'ditado',
  title: 'Paper Moon Radio',
  artist: 'The Quiet Arcade',
  settings: { pauseAtEnd: true, rate: 1 },
  correction: 'tolerant',
  startedAt: '2026-10-31T10:00:00.000Z',
  endedAt: '2026-10-31T10:08:00.000Z',
  durationSec: 492,
  lineCount: 3,
  lines: [
    attempt(0, 'I left the window open for the rain', 'i left the window open for the rain'),
    attempt(4, 'Hold on, the night is almost gone', 'hold on the night is all most gone'),
    attempt(6, 'So call my name across the static sea', '', true),
  ],
  accuracy: 0.6,
  replays: 3,
  hintsUsed: 0,
}

function renderResult() {
  render(
    <MemoryRouter initialEntries={['/resultado/s1']}>
      <Routes>
        <Route path="/resultado/:sessionId" element={<Result />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.mocked(getSession).mockResolvedValue(session)
  vi.mocked(bestAccuracy).mockResolvedValue(0.5)
  vi.mocked(listActivity).mockResolvedValue([{ date: '2026-10-30', minutes: 5, sessions: 1 }])
})

describe('Resultado', () => {
  it('mostra precisão, recorde, estatísticas e barras por verso', async () => {
    renderResult()
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Paper Moon Radio — The Quiet Arcade',
    )
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('Novo recorde')).toBeInTheDocument()

    const stat = (label: string) => screen.getByText(label).nextElementSibling
    expect(stat('VERSOS')).toHaveTextContent('2/3')
    expect(stat('TEMPO')).toHaveTextContent('8:12')
    expect(stat('REPETIÇÕES')).toHaveTextContent('3')

    expect(
      screen.getByRole('img', { name: '3 versos: 1 certos, 1 quase certos, 1 com erro' }),
    ).toBeInTheDocument()
  })

  it('versos para rever com nota e link para praticar o verso', async () => {
    renderResult()
    const review = await screen.findByRole('region', { name: 'VERSOS PARA REVER' })
    const rows = within(review).getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('05')
    expect(rows[0]).toHaveTextContent('Você escreveu “all most” — “almost” é uma palavra só.')
    expect(rows[1]).toHaveTextContent('Verso pulado.')
    expect(
      within(rows[0]!).getByRole('link', { name: 'Praticar o verso 5 de novo' }),
    ).toHaveAttribute(
      'href',
      '/praticar/abcdefghijk/ditado?pausa=fim&velocidade=1&correcao=tolerante&versos=5',
    )
  })

  it('ações: só os versos com erro, repetir, outro modo, nova música', async () => {
    renderResult()
    expect(
      await screen.findByRole('link', { name: 'Praticar só os versos com erro' }),
    ).toHaveAttribute('href', expect.stringContaining('versos=5%2C7'))
    expect(screen.getByRole('link', { name: 'Repetir' })).toHaveAttribute(
      'href',
      '/praticar/abcdefghijk/ditado?pausa=fim&velocidade=1&correcao=tolerante',
    )
    expect(screen.getByRole('link', { name: 'Outro modo' })).toHaveAttribute(
      'href',
      '/musica/abcdefghijk',
    )
  })

  it('sem recorde quando não supera a sessão anterior, ou se é a primeira', async () => {
    vi.mocked(bestAccuracy).mockResolvedValue(null)
    renderResult()
    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByText('Novo recorde')).not.toBeInTheDocument()
  })

  it('sessão inexistente', async () => {
    vi.mocked(getSession).mockResolvedValue(undefined)
    renderResult()
    expect(await screen.findByRole('alert')).toHaveTextContent('RESULTADO NÃO ENCONTRADO')
  })
})
