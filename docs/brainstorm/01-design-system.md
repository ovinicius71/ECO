# Brainstorm — Parte 01: Design system

Branch: `feat/01-design-system` · Base: `main`
Data: 2026-10-31

## Contexto
Criar os tokens, as fontes e os componentes base reutilizáveis, mais uma página `/dev/ui` que mostra todos eles com seus estados. Ainda sem regra de negócio. Referências: `design/README.md`, `design/telas.md` (tabela "Componentes base") e os artboards `Main` e `Setup`.

## Já decidido
- CSS Modules + `tokens.css` e nenhum hex solto nos componentes (CLAUDE.md §7).
- Elementos característicos:
  - barra invertida para seleção;
  - rótulos em caixa alta com `.2em`;
  - STATUS com linhas finas;
  - Plex Mono para números;
  - cantos retos;
  - pílulas só em chip, gauge e play.
- Acessibilidade:
  - `<button>`/`<a>` de verdade;
  - foco de 2px em `--eco-focus`;
  - alvo de 44px;
  - `aria-label` em botões só com ícone;
  - sem quebra em 390px.
- React Router (ADR 0001) entra nesta parte para a rota `/dev/ui`.

## Perguntas bloqueantes (preciso da resposta antes de codar)
1. **Como carregamos as fontes (Jost, IBM Plex Mono, Noto Sans JP)?**
   - A) Self-host via `@fontsource` (npm): funciona offline e o navegador não chama o Google. Tiro o `@import` do `design/tokens.css` e da cópia dele.
   - B) Manter o `@import` do Google Fonts, como está hoje.
   - Recomendação: A. O app é local e sem login, e não precisa avisar o Google a cada abertura.
2. **Quais componentes entram na Parte 01?**
   - A) Os do roadmap: AppHeader, Button, Segmented, ListRow/SelectList, StatusPanel/StatusRow, Gauge e KeyHintBar, mais o **Chip** (usado no streak do AppHeader).
   - B) A + CategoryTabs + BoxMeter (usados na Home e no Vocabulário).
   - C) Todos os do `telas.md` (precisa dividir em 01a/01b).
   - Recomendação: A. Cabe no limite de ~600 linhas, e os outros entram na parte que usa cada um.
3. **Na lista (ListRow/SelectList), o mouse move a barra de seleção?**
   - A) Sim, como no protótipo (estilo NieR): passar o mouse move a barra, `↑↓` move a barra e o foco, e `Enter` ativa.
   - B) Não: a barra só se move pelo teclado e pelo clique, e o hover só sublinha.
   - Recomendação: A, que é o comportamento do protótipo e o que dá a cara do visual.

## Perguntas não bloqueantes (sigo a recomendação se não houver resposta)
1. **`/dev/ui` em produção?** Recomendação: só em dev (`import.meta.env.DEV`), com carregamento lazy.
2. **Ícones?** Recomendação: um conjunto próprio e pequeno de SVG de traço (`components/Icon`), com os paths dos artboards. Sem biblioteca.
3. **Botão que navega?** Recomendação: `Button` (`<button>`) e `ButtonLink` (`<Link>` do React Router) com as mesmas variantes, `primary`/`outline`/`ghost`.
4. **A cópia de `tokens.css` sai de sincronia?** Recomendação: um teste do Vitest que compara `apps/web/src/styles/tokens.css` com `design/tokens.css`.
5. **Testes dos componentes?** Recomendação: Testing Library cobrindo papéis ARIA, estado selecionado e teclado (Segmented, SelectList). Os estilos ficam sem teste.
6. **AppHeader e roteamento?** Recomendação: os itens de nav recebem `to` e usam `NavLink`; o item ativo fica invertido com `aria-current="page"`.

## Riscos e o que pode dar errado
- Noto Sans JP é pesada. Mitigação: subset `japanese` só com os pesos 400/500; ou só os glifos usados (fica para avaliar).
- Hover movendo a seleção pode confundir leitor de tela. Mitigação: o foco real acompanha só o teclado, e o hover muda só o visual.

## Plano de commits
1. `docs(brainstorm): parte 01 — design-system`
2. `feat(design): fontes e tokens`
3. `feat(web): roteador e página /dev/ui`
4. `feat(design): Button, Chip, Gauge, KeyHintBar`
5. `feat(design): Segmented, SelectList, StatusPanel`
6. `feat(design): AppHeader`
7. `docs(acompanhamento): …` (por mudança lógica)
8. `docs(entrega): parte 01 — design-system`

## Decisões (preenchido depois das respostas)
- P1 → A: self-host via `@fontsource`, sem o `@import` do Google (dono, 2026-10-31)
- P2 → A: os componentes do roadmap + o Chip (dono, 2026-10-31)
- P3 → A: o hover move a barra (estilo NieR), `↑↓` move a barra e o foco, `Enter` ativa (dono, 2026-10-31)
- NB1–NB6 → decididos por padrão
