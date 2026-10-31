import { ApiError } from '@/lib/api/client'
import { findLyrics, lyricsById, resolveSong, watchUrl, type LyricsResponse } from '@/lib/api/songs'
import { getSong, saveSong } from '@/lib/db/songs'
import type { Song } from '@/types/song'
import { toLines } from './toLines'

export interface SongLoaderDeps {
  getSong: typeof getSong
  saveSong: typeof saveSong
  resolveSong: typeof resolveSong
  findLyrics: typeof findLyrics
  lyricsById: typeof lyricsById
  now: () => Date
}

const defaultDeps: SongLoaderDeps = {
  getSong,
  saveSong,
  resolveSong,
  findLyrics,
  lyricsById,
  now: () => new Date(),
}

export type LoadResult =
  | { status: 'found'; song: Song }
  /** Sem letra: `query` serve para buscar os candidatos ("Trocar versão da letra"). */
  | { status: 'not-found'; query: string; title: string }

export function songFromLyrics(videoId: string, lyrics: LyricsResponse, now: Date): Song {
  return {
    videoId,
    title: lyrics.track,
    artist: lyrics.artist,
    durationSec: lyrics.durationSec,
    lang: lyrics.lang,
    source: lyrics.source,
    lrclibId: lyrics.lrclibId,
    synced: lyrics.synced,
    lines: toLines(lyrics.lines),
    offsetMs: 0,
    favorite: false,
    createdAt: now.toISOString(),
  }
}

/** Lê a música do navegador; se não houver, resolve o vídeo, busca a letra e salva. */
export async function loadSong(
  videoId: string,
  signal?: AbortSignal,
  deps: SongLoaderDeps = defaultDeps,
): Promise<LoadResult> {
  const saved = await deps.getSong(videoId)
  if (saved) return { status: 'found', song: saved }

  const resolved = await deps.resolveSong(watchUrl(videoId), signal)
  try {
    const lyrics = await deps.findLyrics(resolved.guess, signal)
    return {
      status: 'found',
      song: await deps.saveSong(songFromLyrics(videoId, lyrics, deps.now())),
    }
  } catch (error) {
    if (error instanceof ApiError && error.code === 'LYRICS_NOT_FOUND') {
      const query = `${resolved.guess.artist} ${resolved.guess.track}`.trim()
      return { status: 'not-found', query, title: resolved.title }
    }
    throw error
  }
}

/** Troca a letra pela versão escolhida em "Trocar versão da letra". */
export async function switchVersion(
  videoId: string,
  lrclibId: number,
  signal?: AbortSignal,
  deps: SongLoaderDeps = defaultDeps,
): Promise<Song> {
  const lyrics = await deps.lyricsById(lrclibId, signal)
  return deps.saveSong(songFromLyrics(videoId, lyrics, deps.now()))
}
