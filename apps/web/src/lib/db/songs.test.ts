import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Song } from '@/types/song'
import { EcoDb } from './db'
import { getSong, saveSong, updateSongOffset } from './songs'

const song = (overrides: Partial<Song> = {}): Song => ({
  videoId: 'abcdefghijk',
  title: 'Paper Moon Radio',
  artist: 'The Quiet Arcade',
  durationSec: 221,
  lang: 'en',
  source: 'lrclib',
  lrclibId: 1,
  synced: 'line',
  lines: [],
  offsetMs: 0,
  favorite: false,
  createdAt: '2026-10-31T10:00:00.000Z',
  ...overrides,
})

let db: EcoDb
beforeEach(() => {
  db = new EcoDb(`eco-test-${crypto.randomUUID()}`)
})
afterEach(async () => {
  await db.delete()
})

describe('songs', () => {
  it('salva e lê pelo videoId', async () => {
    await saveSong(song(), db)
    expect(await getSong('abcdefghijk', db)).toMatchObject({ title: 'Paper Moon Radio' })
    expect(await getSong('naoexiste00', db)).toBeUndefined()
  })

  it('trocar a versão da letra preserva o que é do usuário', async () => {
    await saveSong(song({ offsetMs: -400, favorite: true }), db)

    const saved = await saveSong(
      song({ lrclibId: 2, offsetMs: 0, favorite: false, createdAt: '2026-11-01T00:00:00.000Z' }),
      db,
    )

    expect(saved).toMatchObject({
      lrclibId: 2,
      offsetMs: -400,
      favorite: true,
      createdAt: '2026-10-31T10:00:00.000Z',
    })
    expect(await getSong('abcdefghijk', db)).toEqual(saved)
  })

  it('grava só o offset', async () => {
    await saveSong(song(), db)
    await updateSongOffset('abcdefghijk', -400, db)
    expect(await getSong('abcdefghijk', db)).toMatchObject({
      offsetMs: -400,
      title: 'Paper Moon Radio',
    })

    await updateSongOffset('naoexiste00', 100, db) // música ausente: não cria nada
    expect(await getSong('naoexiste00', db)).toBeUndefined()
  })
})
