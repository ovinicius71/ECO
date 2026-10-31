import Dexie, { type EntityTable } from 'dexie'
import type { ActivityDay, PracticeSession } from '@/types/practice'
import type { Song } from '@/types/song'

/**
 * IndexedDB do Eco (docs/spec/dados.md). Toda mudança de schema exige uma nova
 * `this.version(n)` com `upgrade` e teste; as tabelas restantes chegam nas partes que as usam.
 */
export class EcoDb extends Dexie {
  songs!: EntityTable<Song, 'videoId'>
  sessions!: EntityTable<PracticeSession, 'id'>
  activity!: EntityTable<ActivityDay, 'date'>

  constructor(name = 'eco') {
    super(name)
    this.version(1).stores({
      songs: 'videoId, lastPlayedAt',
    })
    // v2 (Parte 10): sessões concluídas e atividade por dia. Só tabelas novas: nada a migrar.
    this.version(2).stores({
      sessions: 'id, videoId, mode, startedAt, [videoId+mode]',
      activity: 'date',
    })
  }
}

export const db = new EcoDb()
