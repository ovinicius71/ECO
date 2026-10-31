import Dexie, { type EntityTable } from 'dexie'
import type { Song } from '@/types/song'

/**
 * IndexedDB do Eco (docs/spec/dados.md). Toda mudança de schema exige uma nova
 * `this.version(n)` com `upgrade` e teste; as tabelas restantes chegam nas partes que as usam.
 */
export class EcoDb extends Dexie {
  songs!: EntityTable<Song, 'videoId'>

  constructor(name = 'eco') {
    super(name)
    this.version(1).stores({
      songs: 'videoId, lastPlayedAt',
    })
  }
}

export const db = new EcoDb()
