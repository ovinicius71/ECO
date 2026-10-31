import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSong, switchVersion } from '@/features/lyrics/loadSong'
import { toLines } from '@/features/lyrics/toLines'
import { lyricsCandidates } from '@/lib/api/songs'
import type { PlayerEvents } from '@/features/player/controller'
import type { Song } from '@/types/song'
import { SongSetup } from './SongSetup'

vi.mock('@/features/lyrics/loadSong', () => ({ loadSong: vi.fn(), switchVersion: vi.fn() }))
vi.mock('@/lib/api/songs', () => ({ lyricsCandidates: vi.fn() }))
vi.mock('@/lib/db/songs', () => ({ updateSongOffset: vi.fn(async () => {}) }))

// Player falso no lugar da IFrame API: fica pronto na hora, no tempo e na duração definidos aqui.
const fakeVideo = { timeMs: 0, durationMs: 221_000 }
vi.mock('@/features/player/youtube', () => ({
  createYouTubePlayer: vi.fn(async (_el: HTMLElement, _id: string, events: PlayerEvents) => {
    setTimeout(() => events.onReady())
    return {
      play: vi.fn(),
      pause: vi.fn(),
      seekTo: vi.fn(),
      setRate: vi.fn(),
      getTimeMs: () => fakeVideo.timeMs,
      getDurationMs: () => fakeVideo.durationMs,
      getAvailableRates: () => [0.5, 0.75, 1],
      destroy: vi.fn(),
    }
  }),
}))

const VID = 'abcdefghijk'

// Letra inventada (fixture "Paper Moon Radio").
const song = (overrides: Partial<Song> = {}): Song => ({
  videoId: VID,
  title: 'Paper Moon Radio',
  artist: 'The Quiet Arcade',
  durationSec: 221,
  lang: 'en',
  source: 'lrclib',
  lrclibId: 1,
  synced: 'line',
  lines: toLines([
    { index: 0, startMs: 12340, endMs: 15800, text: 'I left the window open for the rain' },
    { index: 1, startMs: 15800, endMs: 19420, text: 'Counting cars that never come my way' },
  ]),
  offsetMs: 0,
  favorite: false,
  createdAt: '2026-10-31T12:00:00.000Z',
  ...overrides,
})

function renderSetup() {
  render(
    <MemoryRouter initialEntries={[`/musica/${VID}`]}>
      <Routes>
        <Route path="/" element={<p>Home</p>} />
        <Route path="/musica/:videoId" element={<SongSetup />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  fakeVideo.timeMs = 0
  fakeVideo.durationMs = 221_000
  vi.mocked(loadSong).mockReset()
  vi.mocked(switchVersion).mockReset()
  vi.mocked(lyricsCandidates).mockReset()
})

describe('SongSetup', () => {
  it('mostra a música carregada, os modos e o Ditado selecionado', async () => {
    vi.mocked(loadSong).mockResolvedValue({ status: 'found', song: song() })
    renderSetup()

    expect(screen.getByRole('status')).toHaveTextContent('BUSCANDO LETRA…')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Paper Moon Radio' }),
    ).toBeInTheDocument()
    expect(loadSong).toHaveBeenCalledWith(VID, expect.any(AbortSignal))

    const info = screen.getByRole('region', { name: 'MÚSICA' })
    expect(info).toHaveTextContent('POR LINHA ✓')
    expect(info).toHaveTextContent('2 · 15')
    expect(screen.getByRole('option', { name: /Ditado/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { level: 2, name: 'Ditado' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Começar/ })).toBeDisabled()
  })

  it('trocar de modo troca o detalhe e os ajustes', async () => {
    vi.mocked(loadSong).mockResolvedValue({ status: 'found', song: song() })
    renderSetup()

    fireEvent.mouseEnter(await screen.findByRole('option', { name: /Preencher/ }))

    expect(screen.getByRole('heading', { level: 2, name: 'Preencher' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'DENSIDADE' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '25%' })).toHaveAttribute('aria-checked', 'true')
  })

  it('sem letra: lista as versões e carrega a escolhida', async () => {
    vi.mocked(loadSong).mockResolvedValue({
      status: 'not-found',
      query: 'The Quiet Arcade Paper Moon Radio',
      title: 'The Quiet Arcade - Paper Moon Radio (Official Video)',
    })
    vi.mocked(lyricsCandidates).mockResolvedValue([
      {
        lrclibId: 7,
        artist: 'The Quiet Arcade',
        track: 'Paper Moon Radio',
        album: 'Fixtures',
        durationSec: 221,
        synced: true,
      },
    ])
    vi.mocked(switchVersion).mockResolvedValue(song({ lrclibId: 7 }))
    renderSetup()

    expect(await screen.findByRole('heading', { name: 'LETRA NÃO ENCONTRADA' })).toBeInTheDocument()
    expect(lyricsCandidates).toHaveBeenCalledWith(
      'The Quiet Arcade Paper Moon Radio',
      expect.any(AbortSignal),
    )

    await userEvent.click(await screen.findByRole('option', { name: /Paper Moon Radio/ }))

    expect(switchVersion).toHaveBeenCalledWith(VID, 7)
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Paper Moon Radio' }),
    ).toBeInTheDocument()
  })

  it('erro mostra a mensagem e permite tentar de novo', async () => {
    vi.mocked(loadSong)
      .mockRejectedValueOnce(new Error('O LRCLIB está ocupado. Tente de novo em 7 s.'))
      .mockResolvedValueOnce({ status: 'found', song: song() })
    renderSetup()

    expect(await screen.findByRole('alert')).toHaveTextContent('Tente de novo em 7 s.')
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Paper Moon Radio' }),
    ).toBeInTheDocument()
    expect(loadSong).toHaveBeenCalledTimes(2)
  })

  it('Esc volta para a Home', async () => {
    vi.mocked(loadSong).mockResolvedValue({ status: 'found', song: song() })
    renderSetup()
    await screen.findByRole('heading', { level: 1, name: 'Paper Moon Radio' })

    await userEvent.keyboard('{Escape}')
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('player pronto: prévia do verso e ajuste de sincronia', async () => {
    fakeVideo.timeMs = 13_000
    vi.mocked(loadSong).mockResolvedValue({ status: 'found', song: song() })
    renderSetup()

    const group = await screen.findByRole('group', { name: 'AJUSTE DE SINCRONIA' })
    expect(group).toHaveTextContent('0,0 s')
    await userEvent.click(screen.getByRole('button', { name: 'Adiantar letra' }))
    await userEvent.click(screen.getByRole('button', { name: 'Adiantar letra' }))
    expect(group).toHaveTextContent('+0,2 s')
    await userEvent.click(screen.getByRole('button', { name: 'Atrasar letra' }))
    expect(group).toHaveTextContent('+0,1 s')

    // O ajuste recalcula o verso atual na hora: 13 s + 0,1 s ainda é o 1º verso.
    expect(screen.getByText('I left the window open for the rain')).toBeInTheDocument()
  })

  it('duração diferente: avisa e oferece a versão com a duração do vídeo', async () => {
    fakeVideo.durationMs = 230_000
    vi.mocked(loadSong).mockResolvedValue({ status: 'found', song: song() })
    vi.mocked(lyricsCandidates).mockResolvedValue([
      {
        lrclibId: 1,
        artist: 'The Quiet Arcade',
        track: 'Paper Moon Radio',
        album: null,
        durationSec: 221,
        synced: true,
      },
      {
        lrclibId: 9,
        artist: 'The Quiet Arcade',
        track: 'Paper Moon Radio',
        album: null,
        durationSec: 230,
        synced: true,
      },
    ])
    vi.mocked(switchVersion).mockResolvedValue(song({ lrclibId: 9, durationSec: 230 }))
    renderSetup()

    const note = await screen.findByRole('note')
    expect(note).toHaveTextContent('A letra tem 3:41 e o vídeo 3:50')
    await userEvent.click(await screen.findByRole('button', { name: 'Usar a versão de 3:50' }))

    expect(switchVersion).toHaveBeenCalledWith(VID, 9)
    await vi.waitFor(() => expect(screen.queryByRole('note')).not.toBeInTheDocument())
  })
})
