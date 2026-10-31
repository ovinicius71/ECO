# Entrega — Parte 01: Design system

Branch: `feat/01-design-system` · Base: `main`
Status: 🟡 pronta para push

## O que foi entregue
- Fontes self-hosted (`@fontsource`): Jost, IBM Plex Mono e Noto Sans JP, sem o Google Fonts.
- Teste que garante que `apps/web/src/styles/tokens.css` é cópia idêntica de `design/tokens.css`.
- React Router com `/` (Home placeholder) e `/dev/ui` (vitrine, só em dev e fora do bundle de produção).
- Componentes, com testes:
  - `Button`/`ButtonLink`, `Chip`, `Gauge`, `Icon`;
  - `Segmented`, `SelectList`/`ListRow`, `StatusPanel`/`StatusRow`;
  - `AppHeader` e `KeyHintBar`, em `layout/`.

## Como testar
1. `npm run check` na raiz. Esperado: tudo verde (web com 23 testes, api com 3).
2. `npm run dev:web` → http://localhost:5173/dev/ui
   - **Lista:** passe o mouse (a barra acompanha). Depois `Tab` até a lista, `↑ ↓ Home End` e `Enter`. O texto "ÚLTIMA:" mostra o item ativado.
   - **Segmented:** `Tab` até ele e use `← →`.
   - Reduza a janela para 390px: nada quebra e não aparece rolagem lateral.

## Testes automatizados
- `npm run test` (web): 23 passando em 9 arquivos.
- `pytest` (api): 3 passando, sem mudanças.

## Commits
- `e9c400a docs(brainstorm): parte 01 — design-system`
- `7958f60 feat(design): fontes self-hosted (@fontsource) e teste de sincronia dos tokens`
- `16b027e feat(web): roteador e página /dev/ui só em dev`
- `dcf2aec feat(design): Icon, Button, Chip, Gauge e KeyHintBar`
- `7bfae79 feat(design): Segmented, SelectList/ListRow e StatusPanel`
- `830f16b feat(design): AppHeader com nav ativa e streak`
- `ea99a98 docs(claude): remover o alvo de tamanho das partes`
- `45a976a docs(acompanhamento): 0006 e 0007 — fontes, vitrine e componentes base`

## Decisões tomadas por padrão (não bloqueantes)
- `/dev/ui` só em dev, com lazy.
- Ícones próprios em SVG, sem biblioteca.
- `Button` + `ButtonLink`.
- Teste de sincronia dos tokens.
- Testes de papel ARIA e de teclado.
- `NavLink` com `aria-current`.
- Também decidi sem perguntar:
  - `Segmented` como `radiogroup` (o protótipo usava `aria-pressed`);
  - `Chip` com variante `square` para o streak;
  - a nav do cabeçalho mantém ~30px de altura (≥ 24px do WCAG AA).

## Fora do escopo / pendências
- Os demais componentes do `telas.md` (PracticeHeader, PlayerBar, CategoryTabs, BoxMeter, VideoFrame, LyricLine, WordToken, WordPanel, Waveform) entram nas partes que os usam.
- Favicon do Eco (hoje dá 404).
- `react-router` entrou no commit das fontes, `7958f60`, e não no do roteador.

## Desvios do design
- Segmented com fonte de 13px (`--eco-text-sm`) em vez dos 14px do protótipo, para não usar um literal fora dos tokens.
