# 0008 — Motor de correção (técnico)

Data: 2026-10-31 · Parte 04 · Branch `feat/04-motor-correcao` · Geral: [0008](../geral/0008-motor-correcao.md)
Commits: `e142872` (brainstorm), `47dc9b2` (spec), `9544ba3`, `b682ab0`, `a2fbf43`, `fdb0a0f`

## Mudanças (`apps/web/src/features/correction/`, sem React)
- `types.ts`: `CorrectionMode`, `WordStatus`, `WordHint`, `WordResult`, `LineScore` e `LanguageAdapter { tokenize, normalize, nearThreshold }`.
- `contractions.ts`: `CONTRACTIONS` (~60 entradas, fácil de estender) e `CONTRACTION_MAP`, que soma as variantes sem apóstrofo, menos as que estão em `COLLIDING` (ill, well, its, were, cant, wont…).
- `numbers.ts`: `NUMBER_WORDS` (0–20 e 30–90) → dígitos.
- `english.ts`: o adapter do inglês.
  - `tokenize`: no tolerante, troca hífen e travessão por espaço.
  - `normalize`, no tolerante: NFKC → NFD → sem `\p{M}` → minúsculas → `’‘ʼ`→`'` → sem pontuação (exceto `'`) → contração → sem apóstrofo solto → número.
  - `normalize`, no estrito: NFC + apóstrofo reto.
  - `nearThreshold`: `len ≤ 4 ? 1 : 2`, e 0 no estrito.
- `levenshtein.ts`: clássico, com duas linhas.
- `align.ts`: Needleman–Wunsch genérico (`align(nE, nT, substitution)` → `AlignOp[]`).
  - Custos internos em inteiros ×1000, mais `TIE_BREAK = 1` para cada par não exato.
  - Com isso, o empate favorece mais pares exatos.
  - Na volta (traceback), a ordem é par → faltando → extra.
- `scoreLine.ts`: `scoreLine(expected, typed, mode, adapter = english)`. Passos:
  1. separa palavras e tokens, guardando o mapa token → palavra;
  2. alinha;
  3. dá o status por token: 0 → ok, 0,5 → near, 1 → wrong;
  4. `detectJoins` (merge e split);
  5. agrega por palavra original (`combine`);
  6. dicas: merge/split, depois contraction (expandida e near/wrong), depois number (ok e com dígito de um lado só);
  7. extras = palavras digitadas cujos tokens são todos extras;
  8. nota = Σ pontos / nº de palavras esperadas, −0,25 por extra no estrito, mínimo 0. Um verso vazio vale 1.
- `index.ts`: API pública (`scoreLine`, `english` e os tipos).
- Testes: `english.test.ts` (14), `align.test.ts` (12) e `scoreLine.test.ts` (22), num total de 48.
- `docs/spec/correcao.md` atualizada:
  - junção = near no tolerante;
  - o critério "igual ou quase";
  - a limitação dos números;
  - o `scoreChars` fica para a Parte 06.

## Dependências e versões
- Nenhuma.

## Decisões técnicas
- **Junção = `near`** no tolerante e `wrong` no estrito (dono, P2). O `scoreChars` fica para a 06 (dono, P1).
- **Junção "igual ou quase":** com a regra literal da spec, o exemplo dela mesma não seria detectado. Descoberto pelo teste.
- **Desempate por acertos:** `we will be` × `we be here` ficaria will=wrong e be=wrong (1/3). Agora fica will=missing, be=ok e here=extra (2/3). Descoberto por um teste do `align` que falhou.
- **Contração sem apóstrofo:** a spec manda ignorar a pontuação, mas as formas que colidem com palavras reais continuam exigindo o apóstrofo. O caso `ill` da spec segue `near`.
- **Nota sobre palavras originais**, e não sobre tokens, como no "6/7" da spec.
- **Adapter injetável** em `scoreLine`, pronto para o japonês (Parte 14) sem reescrever o alinhamento.

## Como verificar
- `cd apps/web` e depois `npx vitest run src/features/correction` → 48 testes passando.
- `npm run check` na raiz.

## Riscos e pendências
- Contrações ambíguas (`he's`, `I'd`, `it's`) usam uma só leitura. Revisar com casos reais na Parte 05.
- Os números normalizados não entram na junção/separação (`any one` × `anyone`).
- A junção "quase" pode dar falso positivo raro (ex.: `a most` × `almost`), o que é aceitável: o resultado continua "quase", só com uma dica a mais.
