import type { Lang, SyncKind } from '@/types/song'
import { apiGet } from './client'

export interface ResolveResponse {
  videoId: string
  title: string
  author: string
  guess: { artist: string; track: string }
}

export interface LyricsCandidate {
  lrclibId: number
  artist: string
  track: string
  album: string | null
  durationSec: number
  synced: boolean
}

export interface LyricsResponse {
  source: 'lrclib'
  lrclibId: number
  artist: string
  track: string
  durationSec: number
  synced: SyncKind
  lang: Lang
  lines: { index: number; startMs: number; endMs: number; text: string }[]
  candidates: LyricsCandidate[]
}

export function resolveSong(url: string, signal?: AbortSignal) {
  return apiGet<ResolveResponse>('/songs/resolve', { url }, signal)
}

export function findLyrics(
  query: { artist: string; track: string; duration?: number },
  signal?: AbortSignal,
) {
  return apiGet<LyricsResponse>('/lyrics', query, signal)
}

export function lyricsById(lrclibId: number, signal?: AbortSignal) {
  return apiGet<LyricsResponse>(`/lyrics/${lrclibId}`, {}, signal)
}

export function lyricsCandidates(q: string, signal?: AbortSignal) {
  return apiGet<LyricsCandidate[]>('/lyrics/candidates', { q }, signal)
}

export const watchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`
