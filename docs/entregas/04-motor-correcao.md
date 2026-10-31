# Entrega — Parte 04: Motor de correção

Branch: `feat/04-motor-correcao` · Base: `main`
Status: 🟡 pronta para push

## O que foi entregue
- `apps/web/src/features/correction/` (lógica pura, sem React):
  - `scoreLine(expected, typed, mode, adapter?)` devolve, por palavra, `ok`/`near`/`wrong`/`missing`, com `typed`, as dicas (`merge`/`split`/`number`/`contraction`), os extras e a nota de 0 a 1;
  - adapter do inglês: normalização tolerante e estrita, contrações (`contractions.ts`) e números;
  - Levenshtein e alinhamento Needleman–Wunsch genérico;
  - contrato `LanguageAdapter`, pronto para o japonês.
- Os 11 casos obrigatórios da spec (§5) viraram teste, com a coluna de junção ajustada pelo dono.

## Como testar
1. `npm run check` na raiz → tudo verde.
2. `cd apps/web` e depois `npx vitest run src/features/correction --reporter=verbose` → 48 testes com nomes em português, um por regra.

## Testes automatizados
- `npm run test` (web): 71 passando. São 48 novos: `english` 14, `align` 12 e `scoreLine` 22.
- `pytest` (api): 3 passando, sem mudanças.

## Commits
- `e142872 docs(brainstorm): parte 04 — motor-correcao`
- `47dc9b2 docs(spec): junção vira near com dica e scoreChars fica para a parte 06`
- `9544ba3 feat(correcao): normalização inglesa, contrações e números`
- `b682ab0 feat(correcao): levenshtein e alinhamento Needleman–Wunsch com desempate por acertos`
- `a2fbf43 feat(correcao): scoreLine com status por palavra, extras, junção/separação e nota`
- `fdb0a0f fix(correcao): dica de contração só para quase/errado`
- `a9d662d docs(acompanhamento): 0008 — motor-correcao`

## Decisões tomadas por padrão (não bloqueantes)
- No tolerante, hífen e travessão viram espaço.
- O estrito unifica `’` → `'` e aplica NFC.
- Apóstrofo solto = o que não está entre duas letras.
- `hint: 'contraction'` (só para near/wrong) e `hint: 'number'`.
- A junção vale no estrito com concatenação exata.
- Separação = near nas duas esperadas, por simetria com a junção.
- A nota é calculada sobre as palavras originais. Verso vazio = 1.
- Levenshtein sem transposição.
- Contrações sem apóstrofo valem quando não colidem com palavras reais.
- **Achados na implementação**, registrados no brainstorm e, quando cabia, na spec:
  - junção "igual ou quase" (`all`+`most` = `allmost` ≠ `almost`);
  - desempate do alinhamento a favor de mais acertos exatos.

## Fora do escopo / pendências
- `scoreChars` (Digitar Junto) → Parte 06 (dono).
- Contrações ambíguas (`he's`, `I'd`, `it's`) com uma só leitura: revisar com o uso na Parte 05.
- Limitação: `any one` × `anyone` não recebe a dica de separação (números normalizados).

## Desvios do design
- Nenhum (sem tela).
