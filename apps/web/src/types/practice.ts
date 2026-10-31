import type { CorrectionMode, LineScore } from '@/features/correction'

/** Identificadores dos modos (docs/spec/dados.md). */
export type ModeId = 'digitar' | 'preencher' | 'ditado' | 'escolha' | 'karaoke' | 'assistir'

/** Um verso respondido numa sessão. Guarda o esperado para o Resultado não depender da letra atual. */
export interface LineAttempt {
  lineIndex: number
  expected: string
  typed: string
  skipped: boolean
  result: LineScore
  replays: number
  hintsUsed: number
}

/** Sessão de prática concluída (tabela `sessions`). */
export interface PracticeSession {
  id: string
  videoId: string
  mode: ModeId
  /** Título e artista no momento da prática (a Biblioteca não precisa abrir a música). */
  title: string
  artist: string
  settings: Record<string, string | number | boolean>
  correction: CorrectionMode
  startedAt: string
  endedAt: string
  /** Tempo ativo de prática (pausas longas não contam). */
  durationSec: number
  /** Total de versos praticados nesta sessão (todos, ou só os escolhidos). */
  lineCount: number
  lines: LineAttempt[]
  /** 0..1 */
  accuracy: number
  replays: number
  hintsUsed: number
}

/** Atividade de um dia, no fuso local (tabela `activity`). */
export interface ActivityDay {
  /** AAAA-MM-DD */
  date: string
  minutes: number
  sessions: number
}
