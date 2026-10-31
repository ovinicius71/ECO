import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { PracticeSession } from '@/types/practice'
import { EcoDb } from './db'
import {
  bestAccuracy,
  getSession,
  listActivity,
  listSessions,
  recordActivity,
  saveSession,
} from './sessions'
import { saveSong } from './songs'

const session = (overrides: Partial<PracticeSession> = {}): PracticeSession => ({
  id: 's1',
  videoId: 'abcdefghijk',
  mode: 'ditado',
  title: 'Paper Moon Radio',
  artist: 'The Quiet Arcade',
  settings: {},
  correction: 'tolerant',
  startedAt: '2026-10-31T10:00:00.000Z',
  endedAt: '2026-10-31T10:08:00.000Z',
  durationSec: 480,
  lineCount: 2,
  lines: [],
  accuracy: 0.9,
  replays: 3,
  hintsUsed: 0,
  ...overrides,
})

let db: EcoDb
let name: string
beforeEach(() => {
  name = `eco-test-${crypto.randomUUID()}`
  db = new EcoDb(name)
})
afterEach(async () => {
  await db.delete()
})

describe('migração v1 → v2', () => {
  it('preserva as músicas e cria as tabelas novas', async () => {
    db.close()
    const v1 = new Dexie(name)
    v1.version(1).stores({ songs: 'videoId, lastPlayedAt' })
    await v1.table('songs').put({ videoId: 'abcdefghijk', title: 'Paper Moon Radio' })
    v1.close()

    db = new EcoDb(name)
    expect(await db.songs.get('abcdefghijk')).toMatchObject({ title: 'Paper Moon Radio' })
    expect(await db.sessions.count()).toBe(0)
    expect(await db.activity.count()).toBe(0)
  })
})

describe('sessões', () => {
  it('salva, lê, lista da mais recente e marca o último acesso da música', async () => {
    await saveSong(
      {
        videoId: 'abcdefghijk',
        title: 'Paper Moon Radio',
        artist: 'The Quiet Arcade',
        durationSec: 221,
        lang: 'en',
        source: 'lrclib',
        synced: 'line',
        lines: [],
        offsetMs: 0,
        favorite: false,
        createdAt: '2026-10-30T00:00:00.000Z',
      },
      db,
    )
    await saveSession(session({ id: 'a', startedAt: '2026-10-30T10:00:00.000Z' }), db)
    await saveSession(session({ id: 'b' }), db)

    expect(await getSession('b', db)).toMatchObject({ accuracy: 0.9 })
    expect((await listSessions(db)).map((s) => s.id)).toEqual(['b', 'a'])
    expect((await db.songs.get('abcdefghijk'))?.lastPlayedAt).toBe('2026-10-31T10:08:00.000Z')
  })

  it('melhor precisão anterior da mesma música e modo', async () => {
    await saveSession(session({ id: 'a', accuracy: 0.8 }), db)
    await saveSession(session({ id: 'b', accuracy: 0.95 }), db)
    await saveSession(session({ id: 'c', accuracy: 0.99, mode: 'preencher' }), db)

    expect(await bestAccuracy('abcdefghijk', 'ditado', 'b', db)).toBe(0.8)
    expect(await bestAccuracy('abcdefghijk', 'ditado', undefined, db)).toBe(0.95)
    expect(await bestAccuracy('outravideo1', 'ditado', undefined, db)).toBeNull()
  })
})

describe('atividade', () => {
  it('soma minutos e sessões por dia', async () => {
    await recordActivity('2026-10-31', 300, 1, db)
    await recordActivity('2026-10-31', 90, 0, db)
    await recordActivity('2026-10-30', 60, 1, db)
    await recordActivity('2026-10-29', 0, 0, db) // nada a registrar

    expect(await listActivity('2026-10-30', '2026-10-31', db)).toEqual([
      { date: '2026-10-30', minutes: 1, sessions: 1 },
      { date: '2026-10-31', minutes: 6.5, sessions: 1 },
    ])
    expect(await db.activity.get('2026-10-29')).toBeUndefined()
  })
})
