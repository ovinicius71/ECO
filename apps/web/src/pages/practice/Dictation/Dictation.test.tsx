import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSong } from '@/features/lyrics/loadSong'
import { toLines } from '@/features/lyrics/toLines'
import { recordActivity, saveSession } from '@/lib/db/sessions'
import type { PlayerEvents } from '@/features/player/controller'
import type { Song } from '@/types/song'
import { Dictation } from './Dictation'

vi.mock('@/features/lyrics/loadSong', () => ({ loadSong: vi.fn() }))
vi.mock('@/lib/db/sessions', () => ({
  saveSession: vi.fn(async () => {}),
  recordActivity: vi.fn(async () => {}),
}))

// Player falso: pronto na hora; registra seek/play/pause.
const player = {
  timeMs: 0,
  seekTo: vi.fn((ms: number) => {
    player.timeMs = ms
  }),
  play: vi.fn(),
  pause: vi.fn(),
  setRate: vi.fn(),
}
vi.mock('@/features/player/youtube', () => ({
  createYouTubePlayer: vi.fn(async (_el: HTMLElement, _id: string, events: PlayerEvents) => {
    setTimeout(() => events.onReady())
    return {
      play: player.play,
      pause: player.pause,
      seekTo: player.seekTo,
      setRate: player.setRate,
      getTimeMs: () => player.timeMs,
      getDurationMs: () => 221_000,
      getAvailableRates: () => [0.5, 0.75, 1],
      destroy: vi.fn(),
    }
  }),
}))

const VID = 'abcdefghijk'

// Letra inventada (fixture "Paper Moon Radio").
const song: Song = {
  videoId: VID,
  title: 'Paper Moon Radio',
  artist: 'The Quiet Arcade',
  durationSec: 221,
  lang: 'en',
  source: 'lrclib',
  lrclibId: 1,
  synced: 'line',
  lines: toLines([
    { index: 0, startMs: 12_340, endMs: 15_800, text: 'Like a radio that plays it all' },
    { index: 1, startMs: 15_800, endMs: 19_420, text: 'Hold on, the night is almost gone' },
  ]),
  offsetMs: 0,
  favorite: false,
  createdAt: '2026-10-31T12:00:00.000Z',
}

function renderDictation(query = 'pausa=fim&velocidade=1&correcao=tolerante') {
  render(
    <MemoryRouter initialEntries={[`/praticar/${VID}/ditado?${query}`]}>
      <Routes>
        <Route path="/praticar/:videoId/ditado" element={<Dictation />} />
        <Route path="/musica/:videoId" element={<p>Tela da música</p>} />
        <Route path="/resultado/:sessionId" element={<p>Tela do resultado</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

/** Espera o botão inicial habilitado (com folga: a suíte inteira deixa o jsdom mais lento). */
async function readyToStart() {
  const start = await screen.findByRole('button', { name: 'Ouvir o verso 1' }, { timeout: 5_000 })
  await vi.waitFor(() => expect(start).toBeEnabled(), { timeout: 5_000 })
  return start
}

beforeEach(() => {
  player.timeMs = 0
  vi.clearAllMocks()
  vi.mocked(loadSong).mockResolvedValue({ status: 'found', song })
})

describe('Ditado', () => {
  it('fluxo completo: ouvir, digitar, corrigir, seguir, pular, salvar e abrir o Resultado', async () => {
    renderDictation()
    const start = await readyToStart()

    await userEvent.click(start)
    expect(player.seekTo).toHaveBeenLastCalledWith(11_340) // 1 s antes do verso 1
    expect(player.play).toHaveBeenCalled()

    const input = screen.getByLabelText('O QUE VOCÊ OUVIU?')
    expect(input).toHaveFocus()
    await userEvent.type(input, 'like a radyo that play it all{Enter}')

    expect(player.pause).toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('CORRIGIDO · ENTER PARA SEGUIR')
    expect(screen.getByText(/quase: você digitou radyo/)).toBeInTheDocument()
    expect(screen.getByText('VERSO 86%')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toHaveTextContent('PRECISÃO 86%')

    const next = screen.getByRole('button', { name: 'Próximo verso' })
    expect(next).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('banner')).toHaveTextContent('02/02')
    expect(input).toHaveValue('')

    await userEvent.click(screen.getByRole('button', { name: 'Pular' }))
    expect(await screen.findByText('Tela do resultado')).toBeInTheDocument()

    expect(saveSession).toHaveBeenCalledOnce()
    const saved = vi.mocked(saveSession).mock.calls[0]![0]
    expect(saved).toMatchObject({
      videoId: VID,
      mode: 'ditado',
      lineCount: 2,
      correction: 'tolerant',
    })
    expect(saved.accuracy).toBeCloseTo(6 / 7 / 2)
    expect(saved.lines.map((line) => [line.lineIndex, line.skipped])).toEqual([
      [0, false],
      [1, true],
    ])
    expect(recordActivity).toHaveBeenCalledWith(expect.any(String), saved.durationSec, 1)
  })

  it('só os versos escolhidos (?versos=2)', async () => {
    renderDictation('pausa=fim&velocidade=1&correcao=tolerante&versos=2')
    const start = await screen.findByRole('button', { name: 'Ouvir o verso 2' }, { timeout: 5_000 })
    await vi.waitFor(() => expect(start).toBeEnabled(), { timeout: 5_000 })
    expect(screen.getByRole('banner')).toHaveTextContent('01/01')

    await userEvent.click(start)
    expect(player.seekTo).toHaveBeenLastCalledWith(15_800) // sem recuar além do verso 1
    await userEvent.type(screen.getByLabelText('O QUE VOCÊ OUVIU?'), 'hold on{Enter}')
    await userEvent.click(screen.getByRole('button', { name: 'Ver resultado' }))
    expect(await screen.findByText('Tela do resultado')).toBeInTheDocument()
    expect(vi.mocked(saveSession).mock.calls[0]![0].lines[0]?.lineIndex).toBe(1)
  })

  it('dica mostra a 1ª letra de cada palavra e conta uma vez', async () => {
    renderDictation()
    const start = await readyToStart()
    await userEvent.click(start)

    await userEvent.click(screen.getByRole('button', { name: 'Dica: 1ª letra' }))
    await userEvent.keyboard('{Control>}h{/Control}')
    expect(screen.getByLabelText('O QUE VOCÊ OUVIU?')).toHaveAttribute(
      'placeholder',
      'L… a r… t… p… i… a…',
    )
    const session = screen.getByRole('region', { name: 'SESSÃO' })
    expect(within(session).getByText('Dicas usadas').nextSibling).toHaveTextContent('1')
  })

  it('ouvir de novo volta ao verso-alvo e conta', async () => {
    renderDictation()
    const start = await readyToStart()
    await userEvent.click(start)

    player.timeMs = 15_850 // a pausa chegou um pouco depois da borda
    await userEvent.click(screen.getByRole('button', { name: /Ouvir de novo/ }))
    expect(player.seekTo).toHaveBeenLastCalledWith(12_040)
    expect(screen.getByRole('button', { name: /Ouvir de novo/ })).toHaveTextContent('1×')
  })

  it('trocar para estrita recalcula a precisão', async () => {
    renderDictation()
    const start = await readyToStart()
    await userEvent.click(start)
    await userEvent.type(
      screen.getByLabelText('O QUE VOCÊ OUVIU?'),
      'like a radio that plays it all{Enter}',
    )
    expect(screen.getByRole('banner')).toHaveTextContent('PRECISÃO 100%')

    await userEvent.click(screen.getByRole('radio', { name: 'Estrita' }))
    expect(screen.getByRole('banner')).toHaveTextContent('PRECISÃO 86%')
  })

  it('Esc com progresso pede confirmação antes de sair', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderDictation()
    const start = await readyToStart()
    await userEvent.click(start)
    await userEvent.type(screen.getByLabelText('O QUE VOCÊ OUVIU?'), 'x{Enter}')

    await userEvent.keyboard('{Escape}')
    expect(confirm).toHaveBeenCalledOnce()
    expect(screen.queryByText('Tela da música')).not.toBeInTheDocument()

    confirm.mockReturnValue(true)
    await userEvent.click(screen.getByRole('button', { name: '← SAIR' }))
    expect(screen.getByText('Tela da música')).toBeInTheDocument()
    // Não salva a sessão, mas soma o tempo do dia.
    expect(saveSession).not.toHaveBeenCalled()
    expect(recordActivity).toHaveBeenCalledWith(expect.any(String), expect.any(Number), 0)
  })

  it('aplica a velocidade escolhida no Setup', async () => {
    renderDictation('pausa=fim&velocidade=0.75&correcao=tolerante')
    await vi.waitFor(() => expect(player.setRate).toHaveBeenCalledWith(0.75))
  })
})
