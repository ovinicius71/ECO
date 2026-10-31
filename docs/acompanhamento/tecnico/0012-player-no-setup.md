# 0012 — Vídeo e ajuste de sincronia na tela da música (técnico)

Data: 2026-10-31 · Parte 03 · Branch `feat/03-player-sincronia` · Geral: [0012](../geral/0012-player-no-setup.md)
Commits: `3ac696b`

## Mudanças (`apps/web/src`)
- `pages/SongSetup/SongSetup.tsx` (`SongColumn`):
  - `usePlayer({ controls: true })` (com os controles nativos do YouTube; a PlayerBar fica para a prática);
  - `VideoFrame` no lugar do placeholder e a prévia "AGORA" (`lineIndex` → texto, ♪ ou —);
  - `Stepper` "AJUSTE DE SINCRONIA" ligado a `engine.setOffset` + `useOffsetPersistence`;
  - `DurationNotice`.
- `pages/SongSetup/DurationNotice.tsx`: com `durationMismatch`, busca `lyricsCandidates(artista título)` e mostra a sugestão via `findDurationMatch`. O estado fica ligado à query (sem `setState` síncrono no effect).
- `features/lyrics/durationMatch.ts`: `durationMismatch` (> 2 s; falso se faltar alguma duração) e `findDurationMatch` (dentro de ±2 s, sem a versão atual; sincronizada primeiro, depois a mais próxima).
- CSS: saíram `.video`/`.videoUrl`/`.videoTime` e entraram `.now`/`.nowLine`/`.notice` (borda tracejada em `--eco-ink-3`, sem vermelhão: não é erro).
- `SongSetup.test.tsx`: mock de `@/features/player/youtube` com um player falso (pronto na hora, tempo e duração controláveis) e de `@/lib/db/songs`. Casos novos: o stepper recalcula o verso e o aviso de duração troca a versão.

## Dependências e versões
- Nenhuma nova.

## Decisões técnicas
- **Controles nativos do YouTube no Setup**, porque o design dessa tela não tem barra de player; a PlayerBar do Eco é da prática.
- **Sem troca automática de versão** por duração (dono, P2): só a sugestão com um botão.

## Como verificar
- `npm run check` na raiz (web com 155 testes, api com 56).
- No navegador (Playwright, vídeo público):
  - player pronto;
  - 3× "Atrasar letra" → `−0,3 s`;
  - reload → `−0,3 s` mantido (Dexie);
  - 1440 px confere com o artboard;
  - 390 px sem rolagem horizontal.

## Riscos e pendências
- O `Esc` do Setup volta para a Home. Com o foco dentro do iframe do YouTube, as teclas vão para o player (comportamento do navegador).
