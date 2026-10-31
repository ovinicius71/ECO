// Modelo de dados do navegador (docs/spec/dados.md).

export type Lang = 'en' | 'ja'

export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type SyncKind = 'line' | 'word' | 'estimated'

export interface Token {
  /** Palavra como aparece na letra (com pontuação). */
  text: string
  /** Forma normalizada (tolerante), usada para comparar e buscar. */
  norm: string
  cefr?: Cefr
  isFunctionWord?: boolean
}

export interface Line {
  index: number
  startMs: number
  endMs: number
  text: string
  translation?: string
  tokens: Token[]
}

export interface Song {
  videoId: string
  title: string
  artist: string
  durationSec: number
  lang: Lang
  source: 'lrclib' | 'whisper' | 'manual'
  lrclibId?: number
  synced: SyncKind
  lines: Line[]
  /** Ajuste de sincronia salvo por música (Parte 03). */
  offsetMs: number
  favorite: boolean
  createdAt: string
  lastPlayedAt?: string
}
