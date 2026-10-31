import type { Song } from '@/types/song'
import { db as defaultDb, type EcoDb } from './db'

export function getSong(videoId: string, db: EcoDb = defaultDb): Promise<Song | undefined> {
  return db.songs.get(videoId)
}

/**
 * Salva a música. Se já existir, a letra e os metadados são trocados, mas o que é do
 * usuário (offset, favorita, data de criação, último acesso) é preservado.
 */
export async function saveSong(song: Song, db: EcoDb = defaultDb): Promise<Song> {
  return db.transaction('rw', db.songs, async () => {
    const existing = await db.songs.get(song.videoId)
    const merged: Song = existing
      ? {
          ...song,
          offsetMs: existing.offsetMs,
          favorite: existing.favorite,
          createdAt: existing.createdAt,
          lastPlayedAt: existing.lastPlayedAt,
        }
      : song
    await db.songs.put(merged)
    return merged
  })
}

/** Grava só o ajuste de sincronia da música (não mexe no resto). */
export async function updateSongOffset(
  videoId: string,
  offsetMs: number,
  db: EcoDb = defaultDb,
): Promise<void> {
  await db.songs.update(videoId, { offsetMs })
}

export async function setFavorite(videoId: string, favorite: boolean, db: EcoDb = defaultDb) {
  await db.songs.update(videoId, { favorite })
}

export function listSongs(db: EcoDb = defaultDb) {
  return db.songs.toArray()
}
