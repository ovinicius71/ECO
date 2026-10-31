import type { CorrectionMode } from '@/features/correction'
import type { PracticeSession } from '@/types/practice'
import type { ScoredAttempt } from './session'
import type { DictationSettings } from './settings'
import { dictationStats } from './session'

interface BuildArgs {
  id: string
  song: { videoId: string; title: string; artist: string; lines: readonly { text: string }[] }
  scored: readonly ScoredAttempt[]
  lineCount: number
  settings: DictationSettings
  correction: CorrectionMode
  startedAt: Date
  endedAt: Date
  activeMs: number
}

/** Monta a sessão concluída do Ditado no formato da tabela `sessions`. */
export function buildDictationSession(args: BuildArgs): PracticeSession {
  const stats = dictationStats(args.scored)
  return {
    id: args.id,
    videoId: args.song.videoId,
    mode: 'ditado',
    title: args.song.title,
    artist: args.song.artist,
    settings: {
      pauseAtEnd: args.settings.pauseAtEnd,
      rate: args.settings.rate,
      ...(args.settings.lines ? { lines: args.settings.lines.join(',') } : {}),
    },
    correction: args.correction,
    startedAt: args.startedAt.toISOString(),
    endedAt: args.endedAt.toISOString(),
    durationSec: Math.round(args.activeMs / 1000),
    lineCount: args.lineCount,
    lines: args.scored.map((attempt) => ({
      lineIndex: attempt.lineIndex,
      expected: args.song.lines[attempt.lineIndex]?.text ?? '',
      typed: attempt.typed,
      skipped: attempt.skipped,
      result: attempt.result,
      replays: attempt.replays,
      hintsUsed: attempt.hintUsed ? 1 : 0,
    })),
    accuracy: stats.accuracy ?? 0,
    replays: stats.replays,
    hintsUsed: stats.hints,
  }
}
