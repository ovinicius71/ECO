import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/client'
import type { LyricsResponse } from '@/lib/api/songs'
import type { Song } from '@/types/song'
import { loadSong, switchVersion, type SongLoaderDeps } from './loadSong'

const VID = 'abcdefghijk'

const lyrics = (lrclibId = 1): LyricsResponse => ({
  source: 'lrclib',
  lrclibId,
  artist: 'The Quiet Arcade',
  track: 'Paper Moon Radio',
  durationSec: 221,
  synced: 'line',
  lang: 'en',
  lines: [{ index: 0, startMs: 12340, endMs: 15800, text: 'I left the window open for the rain' }],
  candidates: [],
})

function fakeDeps(overrides: Partial<SongLoaderDeps> = {}): SongLoaderDeps {
  return {
    getSong: vi.fn(async () => undefined),
    saveSong: vi.fn(async (song: Song) => song),
    resolveSong: vi.fn(async () => ({
      videoId: VID,
      title: 'The Quiet Arcade - Paper Moon Radio (Official Video)',
      author: 'TheQuietArcadeVEVO',
      guess: { artist: 'The Quiet Arcade', track: 'Paper Moon Radio' },
    })),
    findLyrics: vi.fn(async () => lyrics()),
    lyricsById: vi.fn(async (id: number) => lyrics(id)),
    now: () => new Date('2026-10-31T12:00:00.000Z'),
    ...overrides,
  }
}

describe('loadSong', () => {
  it('usa a música salva sem chamar a API', async () => {
    const saved = { videoId: VID, title: 'Salva' } as Song
    const deps = fakeDeps({ getSong: vi.fn(async () => saved) })

    expect(await loadSong(VID, undefined, deps)).toEqual({ status: 'found', song: saved })
    expect(deps.resolveSong).not.toHaveBeenCalled()
  })

  it('sem música salva: resolve, busca a letra pelo palpite e salva', async () => {
    const deps = fakeDeps()
    const result = await loadSong(VID, undefined, deps)

    expect(deps.resolveSong).toHaveBeenCalledWith(
      `https://www.youtube.com/watch?v=${VID}`,
      undefined,
    )
    expect(deps.findLyrics).toHaveBeenCalledWith(
      { artist: 'The Quiet Arcade', track: 'Paper Moon Radio' },
      undefined,
    )
    expect(result.status).toBe('found')
    if (result.status !== 'found') return
    expect(result.song).toMatchObject({
      videoId: VID,
      title: 'Paper Moon Radio',
      artist: 'The Quiet Arcade',
      lrclibId: 1,
      offsetMs: 0,
      favorite: false,
      createdAt: '2026-10-31T12:00:00.000Z',
    })
    expect(result.song.lines[0]?.tokens).toHaveLength(8)
    expect(deps.saveSong).toHaveBeenCalledWith(result.song)
  })

  it('letra não encontrada devolve a busca para os candidatos', async () => {
    const deps = fakeDeps({
      findLyrics: vi.fn(async () => {
        throw new ApiError(404, 'LYRICS_NOT_FOUND', 'Não achei')
      }),
    })
    expect(await loadSong(VID, undefined, deps)).toEqual({
      status: 'not-found',
      query: 'The Quiet Arcade Paper Moon Radio',
      title: 'The Quiet Arcade - Paper Moon Radio (Official Video)',
    })
    expect(deps.saveSong).not.toHaveBeenCalled()
  })

  it('outros erros sobem', async () => {
    const deps = fakeDeps({
      resolveSong: vi.fn(async () => {
        throw new ApiError(404, 'VIDEO_UNAVAILABLE', 'Indisponível')
      }),
    })
    await expect(loadSong(VID, undefined, deps)).rejects.toMatchObject({
      code: 'VIDEO_UNAVAILABLE',
    })
  })
})

describe('switchVersion', () => {
  it('carrega a versão escolhida e salva', async () => {
    const deps = fakeDeps()
    const song = await switchVersion(VID, 42, undefined, deps)
    expect(deps.lyricsById).toHaveBeenCalledWith(42, undefined)
    expect(song.lrclibId).toBe(42)
    expect(deps.saveSong).toHaveBeenCalledWith(song)
  })
})
