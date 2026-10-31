# 0013 — Modo Ditado (técnico)

Data: 2026-10-31 · Parte 05 · Branch `feat/05-modo-ditado` · Geral: [0013](../geral/0013-modo-ditado.md)
Commits: `eb7dbe3` (brainstorm), `70026fa` (ADR 0002 + decisões), `ff5ab42`, `ca97492`, `0af2609`, `698134f`, `f515d68`

## Mudanças (`apps/web/src`)
- `features/dictation/session.ts` (puro):
  - `dictationReducer`: fases `ready → answering → checked → … → finished`; ações start, replay, hint, submit, skip, next e restart; o **verso-alvo** é separado do verso tocando;
  - `scoreAttempts` (corrige com o modo atual; pulado = 0);
  - `dictationStats` (precisão média, contagem por status, repetições, dicas, pulados);
  - `firstLettersHint`.
- `features/dictation/settings.ts`:
  - `parseDictationSettings`/`dictationQuery` (`?pausa=fim|desligada&velocidade=0.5|0.75|1&correcao=tolerante|estrita`);
  - `settingsFromLabels` (rótulos do Setup);
  - `seekPointFor`: o recuo (1 s no início, 0,3 s no "ouvir de novo") **nunca volta além do fim do verso anterior**. Senão a pausa no fim do verso anterior dispararia na hora; esse problema foi achado no planejamento.
- `features/player/usePracticeShortcuts.ts`: as opções `onReplay` (o Ditado repete o verso-alvo) e `onHint` (Ctrl+H).
- Componentes:
  - `WordToken` (ok/near/wrong/missing, `compact`, texto `sr-only` "quase/errado: você digitou…", dicas merge/split);
  - `Waveform` (barras determinísticas por hash FNV-1a do verso, `role="progressbar"`);
  - `layout/PracticeHeader` (← SAIR, modo invertido, VERSO NN/TT + Gauge, métrica);
  - `Button` aceita `ref` (`ComponentProps<'button'>`).
- `pages/practice/Dictation`:
  - `Dictation` (carrega a música e os ajustes);
  - `DictationSession`: o player com `pause-at-end` ou `off` e `controls: false`; o `VideoFrame` sempre visível; o foco vai para "Próximo verso" depois de corrigir; Esc/SAIR com `confirm` se houver progresso;
  - `DictationSummary`.
  - Rota `/praticar/:videoId/ditado`.
- `pages/SongSetup`: `practiceUrl()` em `modes.ts`; o `ModePicker` liga o **Começar** (link) e o Enter na lista de modos para o Ditado.
- Docs:
  - **ADR 0002** (player sempre visível);
  - `produto.md` (Ditado);
  - `design/README.md` (desvios aprovados: sem capa no vídeo; "onda" = progresso);
  - `arquitetura.md` (`features/dictation/`).

## Dependências e versões
- Nenhuma nova.

## Decisões técnicas
- **Player sempre visível** (dono, P1, ADR 0002). Base: *RMF → Overlays and frames* e *Developer Policies III.I.9*, conferidas em 2026-10-31.
- **Seguir para o próximo verso:** se a pausa veio no fim, continua tocando de onde parou (o intervalo instrumental toca normalmente). Se o usuário confirmou antes do fim, pula para o próximo verso com 0,3 s de recuo.
- **Recalcular tudo ao trocar tolerante/estrita**, com `useMemo` sobre as tentativas.
- **Sem PlayerBar no Ditado**, seguindo o artboard. O controle é feito pelos botões do modo.

## Como verificar
- `npm run test` (web): 31 testes novos de ditado, componentes e tela, incluindo o fluxo completo com player falso. No total, 189.
- No navegador (Playwright, vídeo público):
  - Setup → Começar → `/praticar/<id>/ditado?…`;
  - o verso 1 pausa a 99% com "PAUSADO NO FIM DO VERSO";
  - a correção dá 100%, o foco vai para "Próximo verso" e o Enter segue para o verso 2, que pausa no fim;
  - o Tab repete (1×) e pausa de novo;
  - 390 px sem rolagem horizontal.

## Riscos e pendências
- A sessão não é salva (Parte 10).
- Tradução do verso → Parte 08.
- Clipes com legenda embutida podem entregar a letra (aviso na tela).
