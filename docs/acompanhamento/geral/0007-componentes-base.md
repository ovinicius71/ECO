# 0007 — Componentes base do visual (geral)

Data: 2026-10-31 · Parte 01 · Branch `feat/01-design-system` · Técnico: [0007](../tecnico/0007-componentes-base.md)

## Em uma frase
Existem agora as peças visuais reutilizáveis que todas as telas vão usar, no estilo papel + NieR do design.

## O que mudou
- **Botões:** escuro (principal), com borda e só texto. Podem virar link.
- **Chips:** "INGLÊS", "日本語 · EM BREVE" e a caixinha do streak com a chama.
- **Barra de progresso** (gauge) arredondada.
- **Seletor segmentado** (ex.: Tolerante | Estrita): as setas do teclado trocam a opção.
- **Lista com barra de seleção escura:**
  - passar o mouse move a barra (como no NieR);
  - ↑↓ movem a barra e o foco;
  - Enter abre.
- **Painel STATUS:** pares nome/valor com linhas finas e números em fonte mono.
- **Cabeçalho do site:** logo ECO エコ, menu com o item atual invertido e o streak.
- **Barra de atalhos do rodapé.**
- Tudo isso aparece em `/dev/ui`.
- Também mudou o CLAUDE.md, a seu pedido: não existe mais um tamanho ideal para as partes.

## Por que
- Com as peças prontas e testadas, as próximas partes (busca de letra, modos de prática) só montam as telas.

## O que dá para ver ou testar agora
- `npm run dev:web` → http://localhost:5173/dev/ui. Teste o mouse e as setas na lista e no seletor.
- A tela também funciona em 390px de largura (celular), sem rolagem lateral.

## Próximo passo
- Parte 02: a busca de letra (servidor + Home + Configurar música).
