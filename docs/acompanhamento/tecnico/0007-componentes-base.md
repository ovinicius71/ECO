# 0007 — Componentes base do visual (técnico)

Data: 2026-10-31 · Parte 01 · Branch `feat/01-design-system` · Geral: [0007](../geral/0007-componentes-base.md)
Commits: `dcf2aec`, `7bfae79`, `830f16b`, `ea99a98` (CLAUDE.md)

## Mudanças
- `lib/utils/cx.ts`: junta classes.
- `components/`:
  - `Icon`: `arrowRight` e `flame`, com os paths dos artboards, `currentColor` e `aria-hidden`.
  - `Button` + `ButtonLink`: variantes `primary`/`outline`/`ghost`, `icon` à direita, mínimo de 44px e caixa alta com `.16em`. O `type="button"` é o padrão.
  - `Chip`: `solid`/`dashed` (pílulas) e `square` (caixa mono do streak). Aceita um `icon` como nó.
  - `Gauge`: `role="progressbar"` com `aria-valuenow` em %, limitado a 0–100.
  - `Segmented<T>`: `radiogroup`/`radio` com tabindex móvel. As setas trocam a opção e dão a volta, como no rádio nativo.
  - `SelectList<T>` + `ListRow`: `listbox`/`option` com `aria-selected` e tabindex móvel.
    - `onMouseEnter` move a seleção **sem** mover o foco.
    - ↑↓/Home/End movem a seleção e o foco.
    - Enter, Espaço e clique chamam `onActivate`.
  - `StatusPanel` + `StatusRow`: uma `section` nomeada pelo `h2` e um `dl` com `dt`/`dd`.
- `layout/`:
  - `KeyHintBar`: `footer` > `ul` com nome acessível, `<kbd>` e um `aside` opcional.
  - `AppHeader`: `NavLink` (`aria-current="page"`; `end` no `/`) e o chip de streak com o texto oculto "Sequência:" (`.sr-only` em `global.css`), com singular e plural.
- `pages/DevUi`: vitrine com todos os estados, usando os dados inventados dos artboards.
- `CLAUDE.md` §4: saiu o alvo de ~600 linhas. As partes não têm limite e só são divididas se o dono pedir.

## Dependências e versões
- Nenhuma nova, além das do 0006.

## Decisões técnicas
- **Segmented como `radiogroup`**, e não com os `aria-pressed` do protótipo: é escolha exclusiva, então a semântica de rádio é a correta.
- **SelectList como `listbox`:** serve tanto à Home (abrir uma música) quanto ao Setup (escolher modo). O hover só muda o visual, para o leitor de tela não "pular" (risco listado no brainstorm).
- **Chip `square`** para o streak: no artboard ele é uma caixa reta em mono, não uma pílula.
- **A nav do cabeçalho mantém os ~30px de altura do design.** Fica abaixo de 44px, mas acima do mínimo de 24px do WCAG 2.2 AA. O mínimo de 44px vale para os `Button`.
- **Tamanhos sem token** (26px do logo, 14px de alguns textos): usei o token mais próximo (`--eco-text-sm`, 13px) onde a diferença é imperceptível e o literal só no logo.

## Como verificar
- `npm run check` na raiz: 9 arquivos e 23 testes no web, mais 3 no pytest.
- Visual (Playwright): `/dev/ui` em 1440×1000 e 390×844. Em 390px, o `scrollWidth` é 390 (sem rolagem horizontal). As fontes carregam de `localhost`.

## Riscos e pendências
- `favicon.ico` 404: fica para quando houver um ícone do Eco.
- Os componentes do `telas.md` fora desta parte (PracticeHeader, PlayerBar, CategoryTabs, BoxMeter, VideoFrame, LyricLine, WordToken, WordPanel, Waveform) entram nas partes que os usam.
- Bundle JS: 258 kB (82 kB gzip). Subiu 38 kB por causa do React Router.
