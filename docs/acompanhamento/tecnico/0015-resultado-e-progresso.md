# 0015 — Resultado e progresso (técnico)

Data: 2026-10-31 · Parte 10 · Branch `feat/10-resultado-progresso` · Geral: [0015](../geral/0015-resultado-e-progresso.md)
Commits: `eec1019`/`e8400e5` (brainstorm), `da9cadd`, `6c56dba`, `e45825e`, `b19e770`, `9840f2d`, `c502e23`

## Mudanças (`apps/web/src`)
- **Dexie v2** (`lib/db/db.ts`): `sessions` (`id, videoId, mode, startedAt, [videoId+mode]`) e `activity` (`date`). Só tabelas novas. O teste de migração v1 → v2 preserva `songs`.
- `lib/db/sessions.ts`: `saveSession` (e `songs.lastPlayedAt`), `getSession`, `listSessions`, `bestAccuracy` (índice composto), `recordActivity` (soma minutos/sessões no dia) e `listActivity`. `lib/db/songs.ts`: `setFavorite` e `listSongs`.
- `lib/db/useDbQuery.ts`: resultado preso à chave das dependências. `Promise.resolve().then(query)` faz um **erro síncrono** (navegador sem IndexedDB) virar `status: 'error'` em vez de derrubar a tela. Isso apareceu no teste do `App`.
- `types/practice.ts`: `PracticeSession`, `LineAttempt` (com `expected` e `skipped`) e `ActivityDay`. O `dados.md` foi atualizado.
- `features/progress/`:
  - `dates.ts`: dia local `AAAA-MM-DD`, `addDays`, `weekdayFromMonday`;
  - `stats.ts`: `computeStreak`, `weekActivity`, `minutesOn`, `averageAccuracy` (30 dias), `isNewRecord`;
  - `clock.ts`: relógio de prática com corte de 2 min;
  - `review.ts`: `reviewNote` e `barKind`;
  - `library.ts`: `recentEntries`, `favoriteEntries` e `MODE_NAMES`;
  - `useProgress.ts`: `useStreak` e `useHomeProgress`.
- `features/dictation/`:
  - o reducer aceita `order` (versos escolhidos), com `targetLine()`;
  - `settings.ts` (`versos=` 1-based ↔ `lines` 0-based, `settingsFromSession`);
  - `record.ts` (`buildDictationSession`).
- `pages/practice/Dictation/DictationSession.tsx`:
  - marca o relógio em cada interação;
  - no fim, `saveSession` + `recordActivity(…, 1)` → `navigate('/resultado/:id', { replace: true })`, e o resumo da Parte 05 aparece só se o salvamento falhar;
  - ao sair, `recordActivity(…, 0)`;
  - em versos fora de sequência, sempre faz seek.
- `pages/Result/` (rota `/resultado/:sessionId`): topo (precisão 148 px, recorde, sequência), grade 3×2 (`dl`), barras (`role="img"` com o resumo), versos para rever (`WordToken` + nota + link de prática do verso) e ações.
- `components/CategoryTabs` (tablist com ←/→/Home/End, ids em `ids.ts`) e `components/BoxMeter`. O ícone `replay` foi adicionado.
- `pages/Home/HomeProgress.tsx`: Biblioteca (tabs + SelectList, estados vazios) e STATUS (músicas, precisão média, meta, semana). O chip de sequência aparece em Home/Setup/Resultado; "Adicionar às favoritas" fica no Setup.

## Dependências e versões
- Nenhuma nova.

## Decisões técnicas
- Só as sessões concluídas são salvas (dono, P2). "Palavras para salvar" fica para a 09 (dono, P1).
- **O esperado de cada verso é guardado na sessão**, para o Resultado não depender da letra atual (que pode ter sido trocada de versão).
- **Recorde** só quando já havia uma sessão anterior da mesma música e modo.
- **Meta de 20 min fixa** até a tela de Ajustes. "Nível estimado" e "palavras para revisar" ficam fora até CEFR (07) e vocabulário (09).

## Como verificar
- `npm run check` (web com 229 testes, api com 56).
- No navegador, com vídeo real e `?versos=1,2`:
  - os 2 versos pausam no fim;
  - o Resultado abre em `/resultado/<uuid>` (65%, barras "1 quase, 1 com erro", "Sequência: 1 dia");
  - na Home, a Biblioteca mostra "DITADO 65%" e a semana "1 de 7";
  - 390 px sem rolagem horizontal.

## Riscos e pendências
- O "Nível estimado" do design ainda não aparece.
- A aba "Em andamento" fica para quando houver retomada de sessão.
- A tela `/progresso` (link do cabeçalho) ainda não existe.
