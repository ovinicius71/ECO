# Modelo de dados (IndexedDB, sem login)

**Local:** `apps/web/src/lib/db/`. A biblioteca proposta é **Dexie**; confirme no brainstorm da Parte 02.
Os dados só existem no navegador. Deve haver uma função de **exportar e importar backup em JSON** (Ajustes, em uma parte futura).

```ts
type Lang = 'en' | 'ja';
type ModeId = 'digitar' | 'preencher' | 'ditado' | 'escolha' | 'karaoke' | 'assistir';
type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface Song {                 // tabela: songs  (pk: videoId)
  videoId: string;
  title: string; artist: string;
  durationSec: number;
  lang: Lang;
  source: 'lrclib' | 'whisper' | 'manual';
  lrclibId?: number;
  synced: 'line' | 'word' | 'estimated';
  lines: Line[];
  offsetMs: number;              // ajuste de sincronia salvo por música
  favorite: boolean;
  createdAt: string; lastPlayedAt?: string;
}

interface Line {
  index: number;
  startMs: number; endMs: number;
  text: string;
  translation?: string;
  tokens: Token[];
}

interface Token { text: string; norm: string; cefr?: Cefr; isFunctionWord?: boolean; }

interface PracticeSession {      // tabela: sessions (pk: id, índices: videoId, mode, startedAt, [videoId+mode]) — schema v2, Parte 10
  id: string; videoId: string; mode: ModeId;
  title: string; artist: string; // cópia no momento da prática (Biblioteca sem abrir a música)
  settings: ModeSettings;
  correction: 'tolerant' | 'strict';
  startedAt: string; endedAt: string;
  durationSec: number;           // tempo ativo (intervalos parados > 2 min não contam)
  lineCount: number;             // versos praticados (todos ou só os escolhidos)
  lines: LineAttempt[];
  accuracy: number;              // 0..1
  wpm?: number;
  replays: number; hintsUsed: number;
}
// Só sessões concluídas são salvas (decisão da Parte 10). Sair no meio só soma minutos em `activity`.

interface LineAttempt { lineIndex: number; expected: string; typed: string; skipped: boolean; result: LineScore; replays: number; hintsUsed: number; }

interface VocabItem {            // tabela: vocab (pk: id, índices: term+lang, dueAt, box)
  id: string; term: string; lang: Lang;
  pos?: string; ipa?: string; meaningPt?: string; note?: string; cefr?: Cefr;
  source: { videoId: string; lineIndex: number; };
  box: 1 | 2 | 3 | 4 | 5;
  dueAt: string;
  reviews: number; correct: number;
  createdAt: string;
}

interface Settings {             // tabela: settings (pk: 'app')
  correction: 'tolerant' | 'strict';
  defaultSpeed: 0.5 | 0.75 | 1;
  showTranslation: boolean;
  dailyGoalMin: number;          // padrão 20
  uiLang: 'pt-BR';
}

interface ActivityDay {          // tabela: activity (pk: date 'AAAA-MM-DD', fuso local) — schema v2, Parte 10
  date: string; minutes: number; sessions: number;
}
```

## Regras derivadas

- **Streak:** número de dias consecutivos, até hoje, com `minutes > 0`. Se hoje ainda não tem atividade, a sequência conta até ontem.
- **Precisão média:** média de `accuracy` das sessões dos últimos 30 dias.
- **Nível estimado:** heurística a ser definida na Parte 10, com base no CEFR das palavras acertadas e erradas.
- **Revisão (Leitner):** `dueAt = hoje + [1, 2, 4, 8, 16][box-1]` dias.

## Versionamento

Toda mudança de schema exige uma `db.version(n).upgrade(...)` com migração e teste.
