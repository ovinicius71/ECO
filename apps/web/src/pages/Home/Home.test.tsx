import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import { toLocalDate } from '@/features/progress/dates'
import { resolveSong } from '@/lib/api/songs'
import { listActivity, listSessions } from '@/lib/db/sessions'
import { listSongs } from '@/lib/db/songs'
import type { PracticeSession } from '@/types/practice'
import type { Song } from '@/types/song'
import { Home } from './Home'

vi.mock('@/lib/api/songs', () => ({ resolveSong: vi.fn() }))
vi.mock('@/lib/db/sessions', () => ({ listSessions: vi.fn(), listActivity: vi.fn() }))
vi.mock('@/lib/db/songs', () => ({ listSongs: vi.fn() }))
const resolveMock = vi.mocked(resolveSong)

function renderHome() {
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/musica/:videoId" element={<p>Tela da música</p>} />
      </Routes>
    </MemoryRouter>,
  )
  return screen.getByLabelText('LINK DO YOUTUBE')
}

beforeEach(() => {
  resolveMock.mockReset()
  vi.mocked(listSessions).mockResolvedValue([])
  vi.mocked(listSongs).mockResolvedValue([])
  vi.mocked(listActivity).mockResolvedValue([])
})

describe('Home', () => {
  it('Enter no campo busca e abre a tela da música', async () => {
    resolveMock.mockResolvedValue({
      videoId: 'abcdefghijk',
      title: 'x',
      author: 'y',
      guess: { artist: 'y', track: 'x' },
    })
    const input = renderHome()

    await userEvent.type(input, 'https://youtu.be/abcdefghijk{Enter}')

    expect(resolveMock).toHaveBeenCalledWith('https://youtu.be/abcdefghijk')
    expect(await screen.findByText('Tela da música')).toBeInTheDocument()
  })

  it('mostra a mensagem da API quando o link é inválido', async () => {
    resolveMock.mockRejectedValue(
      new ApiError(400, 'INVALID_URL', 'Esse link não parece ser de um vídeo do YouTube.'),
    )
    const input = renderHome()

    await userEvent.type(input, 'https://vimeo.com/1{Enter}')

    expect(await screen.findByRole('alert')).toHaveTextContent('Esse link não parece ser')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('campo vazio avisa sem chamar a API', async () => {
    renderHome()
    await userEvent.click(screen.getByRole('button', { name: /Buscar letra/ }))

    expect(screen.getByRole('alert')).toHaveTextContent('Cole um link do YouTube.')
    expect(resolveMock).not.toHaveBeenCalled()
  })

  it('Biblioteca vazia orienta a começar; STATUS mostra meta e semana', async () => {
    renderHome()
    expect(await screen.findByText(/Nenhuma música praticada ainda/)).toBeInTheDocument()
    expect(screen.getByText('META DE HOJE · 0 / 20 MIN')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Semana: praticou em 0 de 7 dias' })).toBeInTheDocument()
  })

  it('Biblioteca com recentes e favoritas; sequência no cabeçalho', async () => {
    const today = toLocalDate(new Date())
    const session = {
      id: 's1',
      videoId: 'v1',
      mode: 'ditado',
      title: 'Paper Moon Radio',
      artist: 'The Quiet Arcade',
      endedAt: new Date().toISOString(),
      accuracy: 0.94,
    } as PracticeSession
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(listSongs).mockResolvedValue([
      { videoId: 'v2', title: 'Glass Garden', artist: 'Mira Vale', favorite: true } as Song,
    ])
    vi.mocked(listActivity).mockResolvedValue([{ date: today, minutes: 14.5, sessions: 1 }])
    renderHome()

    const row = await screen.findByRole('option', { name: /Paper Moon Radio/ })
    expect(row).toHaveTextContent('DITADO')
    expect(row).toHaveTextContent('94%')
    expect(screen.getByText('META DE HOJE · 14 / 20 MIN')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Meta de hoje' })).toHaveAttribute(
      'aria-valuenow',
      '73',
    )
    expect(screen.getByRole('banner')).toHaveTextContent('Sequência: 1 dia')

    await userEvent.click(screen.getByRole('tab', { name: 'Favoritas' }))
    expect(screen.getByRole('option', { name: /Glass Garden/ })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('option', { name: /Glass Garden/ }))
    expect(screen.getByText('Tela da música')).toBeInTheDocument()
  })
})
