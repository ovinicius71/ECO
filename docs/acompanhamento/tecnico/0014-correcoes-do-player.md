# 0014 — Duas correções no player (técnico)

Data: 2026-10-31 · Parte 05 · Branch `feat/05-modo-ditado` · Geral: [0014](../geral/0014-correcoes-do-player.md)
Commits: `4fcabcf`, `f515d68`

## Mudanças
- `features/player/youtube.ts`: `onStateChange` ignora `YT.PlayerState.BUFFERING` (3). Antes, qualquer estado ≠ PLAYING virava `playing: false`, o que parava o laço rAF e mostrava "PAUSADO" durante o carregamento.
- `features/player/engine.ts`: `tick(exact?)`. No `onPlayingChange(false)`, roda `tick(true)`, que grava o `videoMs` exato mesmo dentro do passo de 250 ms do relógio. O teste novo em `engine.test.ts` ("ao pausar, grava o tempo exato") falhava antes da correção.
- `pages/practice/Dictation/Dictation.test.tsx`: helper `readyToStart()` com `timeout: 5_000` no `findByRole`/`waitFor`. Na suíte completa, o primeiro render estourava o 1 s padrão; sozinho, passava sempre.

## Como foi achado
- Playwright + vídeo real. O store mostrava `playing: false`, `videoMs: 23297`, `lineIndex: 0`, e a onda estava em 93%. O verso tinha pausado no fim certo, mas o store tinha ficado com um valor de até 250 ms antes.
- Para ler o store no navegador, expus o engine no `window` só durante a checagem local. A linha foi removida antes do commit.

## Processo
- O commit `4fcabcf` entrou com 1 teste falhando: o `npm run check | grep` escondeu o código de saída. Corrigido em `f515d68`, com a suíte completa verde 3 vezes seguidas.
- A partir de agora, a verificação usa `npm run check > log; echo exit=$?`.

## Riscos e pendências
- Outros estados (CUED, UNSTARTED) continuam como "não tocando", que é o correto.
