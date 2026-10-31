# Brainstorm — Parte 10: Resultado e progresso

Branch: `feat/10-resultado-progresso` · Base: `main`
Data: 2026-10-31

## Contexto
Fecha a **primeira versão usável** (00–05 + 10):
- **Sessões salvas:** a sessão do Ditado é salva no IndexedDB.
- **Tela Resultado** (`/resultado/:sessionId`), com:
  - a precisão, o recorde e a sequência;
  - a grade de estatísticas;
  - a precisão por verso;
  - os versos para rever;
  - as ações.
- **Home:** a Biblioteca (Recentes…) e o painel STATUS (sequência, meta de hoje, músicas, precisão média).
- **Cabeçalho:** o chip de sequência.

Specs: `produto.md` (Resultado, Home), `dados.md` (`PracticeSession`, `ActivityDay`, regras de streak e precisão). Design: `Resultado.dc.html`, `Main.dc.html`.

## Já decidido
- Dados só no navegador (Dexie). Mudança de schema = `version(n)` + teste.
- Regras do `dados.md`:
  - **streak** = dias seguidos até hoje com `minutes > 0`; se hoje ainda não tem atividade, conta até ontem;
  - **precisão média** = média das sessões dos últimos 30 dias;
  - meta diária padrão = 20 min.
- Barras por verso: certo (tinta), quase (`--eco-near-fill`), erro (vermelhão), como no design.

## Perguntas bloqueantes (preciso da resposta antes de codar)
1. **"Palavras para salvar" no Resultado?** O design mostra cada palavra errada com o significado em pt-BR e o nível CEFR, e um botão "Salvar no vocabulário". Ainda não existem dicionário (08), níveis (07) nem vocabulário (09).
   - A) **Fica para a Parte 09**, que cria o vocabulário e completa a tela. Por enquanto a coluna da direita não aparece.
   - B) Já mostrar a lista das palavras erradas (sem significado e sem nível), com o "Salvar" desabilitado ("chega na Parte 09").
   - C) Já criar um vocabulário mínimo (tabela `vocab`, só a palavra + o verso de origem), e a 09 completa com revisão e significado.
   - Recomendação: A. Evita botão morto e evita fixar o modelo de vocabulário antes da 09.
2. **Sessões interrompidas e a aba "Em andamento"?**
   - A) **Salvar só as sessões concluídas.** A Biblioteca mostra **Recentes** e **Favoritas**, e "Em andamento" aparece quando houver como retomar. Sair no meio ainda conta os minutos de prática do dia (meta e sequência).
   - B) Salvar também as parciais ao sair e **retomar** do verso onde parou, com as tentativas anteriores restauradas. "Em andamento" lista essas sessões.
   - C) Salvar as parciais sem retomar ("Em andamento" só abre a tela da música).
   - Recomendação: A. Retomar com estado restaurado é um recurso à parte; dá para entrar depois sem mudar o formato da sessão.

## Perguntas não bloqueantes (sigo a recomendação se não houver resposta)
1. **Fim do Ditado:** salva a sessão e **vai direto para o Resultado**, em vez do resumo na tela da Parte 05.
2. **"Praticar só os versos com erro":** entra agora. O Ditado aceita `?versos=6,14,26` e só pratica esses (o resto do fluxo é igual).
3. **Notas dos "versos para rever":** geradas pelas dicas do motor de correção, sem inventar gramática:
   - "Você escreveu “comes” — quase.";
   - "Você escreveu “all most” — “almost” é uma palavra só.";
   - "Faltou “the”.";
   - "Você escreveu “see” no lugar de “sea”."
   - Explicações gramaticais (como no design: "o sujeito ‘cars’ pede ‘come’") ficariam para um provedor de linguagem no futuro.
4. **Tempo de prática:** do primeiro play ao fim (ou à saída). Intervalos parados > 2 min não contam, para não somar tempo ocioso. O tempo vai para a sessão e para `activity` do dia.
5. **Recorde:** "NOVO RECORDE" quando a precisão supera a melhor sessão anterior da mesma música no mesmo modo, e só se já existia uma sessão anterior.
6. **Schema v2 do Dexie:** tabelas `sessions` (`id`, índices `videoId`, `mode`, `startedAt`, `[videoId+mode]`) e `activity` (`date`), com teste de migração v1 → v2 que preserva as músicas.
7. **Home → STATUS:**
   - entram: músicas praticadas, precisão média (30 dias), meta de hoje (gauge, X / 20 min) e a sequência da semana (seg–dom, componente `BoxMeter`);
   - **"Nível estimado"** e **"Palavras salvas"/"para revisar"** só aparecem com CEFR (07) e vocabulário (09);
   - a meta de 20 min é fixa até a tela de Ajustes.
8. **Biblioteca:** abas grandes (`CategoryTabs`) e a lista (`SelectList`) com nº, título, artista, último modo e melhor nota. Ativar uma linha abre a tela da música.
9. **Favoritas:** um botão "☆ Favoritar" (`aria-pressed`) na coluna da música do Setup, sem design, no estilo de link de texto; grava `Song.favorite`.
10. **Chip de sequência:** no `AppHeader` da Home, do Setup e do Resultado, quando a sequência for > 0.
11. **Datas:** o dia (`AAAA-MM-DD`) é sempre no **fuso local** do navegador.
12. **Consultas ao Dexie nas telas:** um hook simples `useDbQuery`, sem dependência nova (sem `dexie-react-hooks`), porque as telas recarregam ao navegar.

## Riscos e o que pode dar errado
- Fuso e meia-noite: uma sessão que cruza a meia-noite conta no dia em que terminou.
- Muitas sessões ao longo do tempo: as consultas usam índice (`startedAt`, `[videoId+mode]`).
- Resultado de uma sessão de uma música que foi apagada ou trocada de versão: o Resultado usa os textos guardados na própria sessão (o esperado de cada verso é salvo junto da tentativa).

## Plano de commits
1. `docs(brainstorm): parte 10 — resultado-progresso`
2. `feat(progresso): schema v2 (sessions, activity) com migração e repositórios`
3. `feat(progresso): regras puras (streak, semana, precisão média, recorde, tempo, notas dos versos)`
4. `feat(ditado): salvar a sessão e ir ao Resultado; praticar só os versos com erro`
5. `feat(progresso): tela Resultado`
6. `feat(design): CategoryTabs e BoxMeter`
7. `feat(progresso): Biblioteca e STATUS na Home, sequência no cabeçalho, favoritar`
8. `docs(acompanhamento): …` e `docs(entrega): parte 10 — resultado-progresso`

## Decisões (preenchido depois das respostas)
