import type { ModeId, PracticeSession } from '@/types/practice'
import type { Song } from '@/types/song'

export const MODE_NAMES: Record<ModeId, { name: string; jp: string }> = {
  digitar: { name: 'Digitar Junto', jp: '一緒に打つ' },
  preencher: { name: 'Preencher', jp: '穴埋め' },
  ditado: { name: 'Ditado', jp: '書き取り' },
  escolha: { name: 'Múltipla escolha', jp: '選択' },
  karaoke: { name: 'Karaokê', jp: 'カラオケ' },
  assistir: { name: 'Assistir', jp: '鑑賞' },
}

export interface LibraryEntry {
  videoId: string
  title: string
  artist: string
  /** Modo da sessão mais recente (null para favoritas nunca praticadas). */
  lastMode: ModeId | null
  /** Melhor precisão em qualquer modo. */
  best: number | null
  lastAt: string | null
}

/** Músicas praticadas, da mais recente para a mais antiga. */
export function recentEntries(sessions: readonly PracticeSession[]): LibraryEntry[] {
  const byVideo = new Map<string, LibraryEntry>()
  const ordered = [...sessions].sort((a, b) => b.endedAt.localeCompare(a.endedAt))
  for (const session of ordered) {
    const entry = byVideo.get(session.videoId)
    if (!entry) {
      byVideo.set(session.videoId, {
        videoId: session.videoId,
        title: session.title,
        artist: session.artist,
        lastMode: session.mode,
        best: session.accuracy,
        lastAt: session.endedAt,
      })
    } else {
      entry.best = Math.max(entry.best ?? 0, session.accuracy)
    }
  }
  return [...byVideo.values()]
}

/** Favoritas, com os dados de prática quando houver. */
export function favoriteEntries(
  songs: readonly Song[],
  sessions: readonly PracticeSession[],
): LibraryEntry[] {
  const recent = new Map(recentEntries(sessions).map((entry) => [entry.videoId, entry]))
  return songs
    .filter((song) => song.favorite)
    .map(
      (song) =>
        recent.get(song.videoId) ?? {
          videoId: song.videoId,
          title: song.title,
          artist: song.artist,
          lastMode: null,
          best: null,
          lastAt: null,
        },
    )
    .sort(
      (a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? '') || a.title.localeCompare(b.title),
    )
}
