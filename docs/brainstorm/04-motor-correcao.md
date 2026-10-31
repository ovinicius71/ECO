# Brainstorm — Parte 04: Motor de correção

Branch: `feat/04-motor-correcao` · Base: `main`
Data: 2026-10-31

## Contexto
A lógica pura que compara o verso esperado com o que o usuário digitou, nos modos tolerante e estrito. Ela devolve o status de cada palavra (`ok`/`near`/`wrong`/`missing`), as palavras extras, as dicas e a nota. Fica em `apps/web/src/features/correction/`, sem React, e é usada pelo Ditado (05), Preencher (07), Digitar Junto (06), Resultado (10) e Vocabulário (09). Spec: `docs/spec/correcao.md`.

## Já decidido (spec)
- Normalização tolerante:
  - NFKC → NFD, sem diacríticos;
  - minúsculas e apóstrofos tipográficos → `'`;
  - contrações (`contractions.ts`, fácil de estender);
  - pontuação e números (≤ 20 + dezenas).
- Alinhamento global **Needleman–Wunsch**:
  - custos 0 / 0,5 (quase) / 1;
  - `limiteQuase = len ≤ 4 ? 1 : 2` no tolerante e 0 no estrito.
- Contrações expandidas guardam o mapa token → palavra original. O status da original:
  - `ok` se todos os tokens estão ok;
  - `near` se há mistura;
  - o pior, caso contrário.
- Extras não descontam no tolerante; no estrito, −0,25 cada, com mínimo 0.
- Detecção de junção/separação (`hint: 'merge' | 'split'`).
- `LanguageAdapter { normalize, tokenize, nearThreshold }` desde já, pensando no japonês.
- Os 11 casos da tabela da spec viram testes.

## Análise dos casos da spec (conferi à mão com o algoritmo)
- `radyo/play` → radio=near (lev 1 ≤ 2) e plays=near (lev 1 ≤ 2). Nota (5 + 0,5 + 0,5)/7 = **6/7** ✓
- `ill` × `I’ll` → esperado `[i, will]` contra digitado `[ill]`. O NW escolhe i=missing e will≈ill (near), com custo 1,5 contra 2,0. Mistura → **I'll=near** ✓
- `all most` × `almost` → **sem regra extra, o NW daria almost=near**: most≈almost tem lev 2, e "all" ficaria como extra (custo 1,5 contra 2,0). Para chegar ao `wrong + merge` da spec, a detecção de junção precisa **sobrepor** o alinhamento. Planejado assim.
- `we be … lights` × `We’ll … the lights` → we=ok e will=missing → **We'll=near**; the=missing ✓
- `stating see` → static≈stating (lev 2 ≤ 2) e sea≈see (lev 1 ≤ 1) → near/near ✓. No estrito, wrong/wrong ✓

## Perguntas bloqueantes (preciso da resposta antes de codar)
1. **O `scoreChars` (Digitar Junto, caractere a caractere) entra agora ou na Parte 06?**
   - A) Na Parte 06. A semântica dele depende da UX de digitação: pontuação e apóstrofo são pulados automaticamente? A comparação é posicional ou alinhada? Hoje a spec só tem a assinatura.
   - B) Agora, com uma versão posicional simples (tolerante ignora caixa e acento, e a pontuação conta como ok automático), para revisar depois na 06.
   - Recomendação: A, para não criar uma API que a 06 vai ter que mudar.
2. **Junção/separação (`all most` × `almost`): qual é o resultado?**
   - A) `wrong` com `hint: 'merge'`, como diz a spec (0 pontos). A dica explica o erro.
   - B) `near` com `hint: 'merge'` (0,5 ponto): as letras estão certas e só o espaço está errado.
   - Recomendação: A, que é o que a spec definiu. Ensina que "all most" é outra coisa; a dica deixa claro o motivo.

## Perguntas não bloqueantes (sigo a recomendação se não houver resposta)
1. **Hífen e travessão?** Recomendação: viram **espaço** antes de remover a pontuação. Assim `well-known` = `well known`, e escrever junto (`wellknown`) cai na detecção de junção.
2. **O estrito também normaliza o apóstrofo tipográfico (`’` → `'`) e aplica NFC?** Recomendação: sim. O teclado não digita `’`, e NFC só unifica acentos compostos e decompostos, sem afrouxar a correção.
3. **"Apóstrofos soltos"?** Recomendação: os que não estão entre duas letras (`runnin'` → `runnin`, `'em` → `em`). `rock'n'roll` e `night's` mantêm o apóstrofo.
4. **Empates no alinhamento?** Recomendação: preferência fixa diagonal → missing → extra, para o resultado ser determinístico.
5. **Quando usar `hint: 'contraction'`?** Recomendação: quando a palavra original foi expandida em vários tokens e não ficou `ok` (ex.: `I'll` digitado `ill`).
6. **Quando usar `hint: 'number'`?** Recomendação: quando a palavra ficou `ok` só pela equivalência número ↔ extenso (`2` × `two`).
7. **Junção no estrito?** Recomendação: a detecção também vale, comparando o texto cru.
8. **Separação (`almost` × `all most` esperado)?** Recomendação: as duas esperadas ficam `wrong` com `hint: 'split'`, e o texto digitado fica na primeira.
9. **Base da nota?** Recomendação: as palavras **originais** esperadas (como no "6/7" da spec), e não os tokens expandidos.
10. **Lev com custo fixo?** Recomendação: Levenshtein clássico (inserção, remoção e substituição = 1), sem transposição.

## Riscos e o que pode dar errado
- O NW é O(n·m) por verso, o que é trivial (versos têm < 20 palavras).
- A lista de contrações tem ambiguidades: `he's` = he is/has; `I'd` = I would/had. Mitigação: escolher a forma mais comum e aceitar as duas via equivalência? Por enquanto, a forma única mais comum. Revisar com casos reais na 05.
- Em `ain't`, `y'all` e `gonna`, a lista começa enxuta e cresce com o uso.

## Plano de commits
1. `docs(brainstorm): parte 04 — motor-correcao`
2. `feat(correcao): normalização inglesa, contrações e números (com testes)`
3. `feat(correcao): levenshtein e alinhamento Needleman–Wunsch (com testes)`
4. `feat(correcao): scoreLine com status, extras, junção/separação e nota (casos da spec)`
5. `docs(acompanhamento): …`
6. `docs(entrega): parte 04 — motor-correcao`

## Decisões (preenchido depois das respostas)
