# 0011 — O player do Eco (técnico)

Data: 2026-10-31 · Parte 03 · Branch `feat/03-player-sincronia` · Geral: [0011](../geral/0011-nucleo-do-player.md)
Commits: `298444f`/`5bd6ddd`/`4b3dc47` (brainstorm), `512427e`, `bb3d36f`, `e64ee4e`

## Mudanças (`apps/web/src`)
- `features/player/sync.ts` (puro):
  - `toLyricMs`/`toVideoMs` (`letra = vídeo + offset`);
  - `lastStartedIndex` e `findLineIndex` (busca binária; -1 nos intervalos);
  - `lineGuard` (`loop` → `seek(start)`, `pause-at-end` → `pause`; só na passagem pela borda −50 ms, ignorando saltos > 2 s);
  - `clampOffset` (passo de 0,1 s, ±10 s) e `formatOffset`.
- `features/player/controller.ts`: a interface `PlayerController` + `PlayerEvents`, e `RATES = [0.5, 0.75, 1]`.
- `features/player/youtube.ts`:
  - `loadYouTubeApi()` (singleton);
  - `createYouTubePlayer()` com host `youtube-nocookie.com`, `playerVars` (controls, disablekb, rel 0, playsinline, origin) e mensagens pt-BR para os erros 2/5/100/101/150;
  - **slot próprio por player**;
  - métodos no-op antes do `onReady`.
- `features/player/engine.ts`: `createPlayerEngine(lines, opts)`:
  - um store Zustand **vanilla** por player (status, playing, videoMs, durationMs, rate, rates, lineIndex, offsetMs, mode);
  - laço `requestAnimationFrame` só enquanto toca;
  - o relógio atualiza em passos de 250 ms e o verso na hora;
  - `attach`/`detach` (sobrevive ao StrictMode), `seek` (zera a passagem do guarda), `replayLine`, `setRate`/`stepRate` (só as velocidades disponíveis), `setOffset` e `setMode`;
  - `schedule`/`cancel` injetáveis para os testes.
- `features/player/usePlayer.ts` (`usePlayer`, `usePlayerState` com `useStore`), `usePracticeShortcuts.ts` e `useOffsetPersistence.ts` (debounce de 500 ms → `updateSongOffset`).
- `lib/db/songs.ts`: `updateSongOffset` (só atualiza; não cria).
- `components/VideoFrame` (16:9 hachurado, carregando/erro com link para o YouTube), `components/Stepper` (− valor +, `role="group"`, `output aria-live`) e `layout/PlayerBar` (range acessível com `aria-valuetext`, setas de ±5 s, losango via `::-webkit-slider-thumb`/`::-moz-range-thumb`, ciclo de velocidade 1 → 0,75 → 0,5).
- Ícones `pause` e `playSolid`. `lib/utils/time.ts`: `formatRate`.
- `pages/DevPlayer` + a rota `/dev/player/:videoId` (lazy, só em dev). `docs/arquitetura.md` foi atualizado.

## Dependências e versões
- `zustand` 5.0.16 (previsto no ADR 0001).

## Decisões técnicas
- **Engine sem React e com um store por player**, em vez de um store global. Isso deixa os testes isolados e permite mais de um player no futuro.
- **Guarda por passagem** (antes < borda ≤ agora), e não "tempo ≥ fim". Assim não repete a ação a cada tique e não dispara em seek manual.
- **Tab só no corpo ou num campo de digitação**: a spec pede Tab = repetir verso, mas capturá-lo sempre quebraria a navegação por teclado.
- **Teste real no navegador** (Playwright, vídeo público): verso, loop, pausa e layout em 1440 e 390 px. Foi nele que apareceu o bug do StrictMode (o `destroy` removia todos os filhos do container).

## Como verificar
- `npm run test` (web): 50 testes novos de player e componentes. No total, 155.
- `/dev/player/<id>` com a API e o web no ar.

## Riscos e pendências
- **Para a Parte 05:** a pausa no fim do verso chega algumas dezenas de ms depois da borda, e `lineIndex` já aponta o verso seguinte. O Ditado deve guardar o verso-alvo.
- A precisão do `getCurrentTime()` varia por navegador. A tolerância de 50 ms pode precisar de ajuste.
- `favicon.ico` 404 (pendência antiga).
