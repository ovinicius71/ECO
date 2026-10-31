import type { ActivityDay, ModeId, PracticeSession } from '@/types/practice'
import { db as defaultDb, type EcoDb } from './db'

export async function saveSession(session: PracticeSession, db: EcoDb = defaultDb) {
  await db.transaction('rw', db.sessions, db.songs, async () => {
    await db.sessions.put(session)
    await db.songs.update(session.videoId, { lastPlayedAt: session.endedAt })
  })
}

export function getSession(id: string, db: EcoDb = defaultDb) {
  return db.sessions.get(id)
}

/** Todas as sessões, da mais recente para a mais antiga. */
export function listSessions(db: EcoDb = defaultDb) {
  return db.sessions.orderBy('startedAt').reverse().toArray()
}

/** Melhor precisão anterior da mesma música no mesmo modo (sem contar `excludeId`). */
export async function bestAccuracy(
  videoId: string,
  mode: ModeId,
  excludeId?: string,
  db: EcoDb = defaultDb,
): Promise<number | null> {
  const previous = await db.sessions
    .where('[videoId+mode]')
    .equals([videoId, mode])
    .filter((session) => session.id !== excludeId)
    .toArray()
  return previous.length ? Math.max(...previous.map((session) => session.accuracy)) : null
}

/** Soma tempo (e, opcionalmente, uma sessão) à atividade do dia. */
export async function recordActivity(
  date: string,
  seconds: number,
  sessions: number,
  db: EcoDb = defaultDb,
) {
  if (seconds <= 0 && sessions <= 0) return
  await db.transaction('rw', db.activity, async () => {
    const day = (await db.activity.get(date)) ?? { date, minutes: 0, sessions: 0 }
    await db.activity.put({
      date,
      minutes: day.minutes + seconds / 60,
      sessions: day.sessions + sessions,
    })
  })
}

/** Dias com atividade entre `from` e `to` (AAAA-MM-DD, inclusive). */
export function listActivity(
  from: string,
  to: string,
  db: EcoDb = defaultDb,
): Promise<ActivityDay[]> {
  return db.activity.where('date').between(from, to, true, true).toArray()
}
