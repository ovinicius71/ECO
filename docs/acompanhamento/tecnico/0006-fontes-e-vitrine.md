# 0006 — Fontes próprias e vitrine de componentes (técnico)

Data: 2026-10-31 · Parte 01 · Branch `feat/01-design-system` · Geral: [0006](../geral/0006-fontes-e-vitrine.md)
Commits: `e9c400a` (brainstorm), `7958f60`, `16b027e`

## Mudanças
- `apps/web/src/styles/fonts.css`: `@import` dos pesos usados:
  - Jost 300/400/500/600;
  - Plex Mono 400/500;
  - Noto Sans JP 400/500.
- Importado em `main.tsx` antes de `tokens.css`.
- `design/tokens.css` e a cópia em `apps/web`: removido o `@import url(fonts.googleapis…)`, e o comentário do topo aponta para o `fonts.css`.
- `global.css` ficou sem o que duplicava o `tokens.css` (body e foco). Ganhou o reset de fonte do `button` e, no 0007, o `.sr-only`.
- `src/styles/tokens.node.test.ts` (ambiente node): compara byte a byte com `design/tokens.css`.
  - O `tsconfig.app.json` exclui `src/**/*.node.test.ts`, e o `tsconfig.node.json` inclui esses arquivos (tipos do Node só ali).
- `app/router.tsx` (`AppRoutes`): `/` → `pages/Home` e `/dev/ui` → `pages/DevUi`, este via `lazy` + `import.meta.env.DEV`. `App.tsx` envolve tudo com `BrowserRouter`.
- O placeholder saiu de `app/` e foi para `pages/Home/`. O `docs/arquitetura.md` ganhou `pages/DevUi/`.
- `App.test.tsx`: a Home renderiza, e `/dev/ui` abre em dev.

## Dependências e versões
- `@fontsource/jost` 5.3.0, `@fontsource/ibm-plex-mono` 5.3.0, `@fontsource/noto-sans-jp` 5.3.1.
- `react-router` 7.18.5 (modo declarativo: `BrowserRouter`/`Routes`). Por descuido, entrou no commit `7958f60` junto com as fontes.

## Decisões técnicas
- **Self-host via `@fontsource`** (dono, P1). A Noto Sans JP vem fatiada por `unicode-range` (~120 arquivos `.woff2` no build), e o navegador baixa só os blocos que usar.
- **Teste de sincronia com `node:fs`.** A primeira versão usava `?raw` do Vite, mas no Vitest o CSS não é processado e os dois imports viravam string vazia: o teste passava sem comparar nada. Isso foi detectado ao forçar uma divergência. A versão atual falha quando há divergência (verificado).
- **`/dev/ui` fora do bundle de produção:** o `grep "Componentes" dist/assets/*.js` deu 0 ocorrências.

## Como verificar
- `npm run test` (web) → o teste dos tokens passa. Acrescentar uma linha em `apps/web/src/styles/tokens.css` → ele falha.
- `npm run dev:web` → `/dev/ui`. No DevTools, aba Network: nenhuma requisição a `fonts.googleapis.com`.

## Riscos e pendências
- O `dist/` fica com muitos arquivos de fonte por causa da Noto Sans JP. Se o tamanho incomodar, dá para cortar para um subset dos glifos usados.
