# Motor de correção

**Local:** `apps/web/src/features/correction/` (lógica pura em TypeScript, sem React).
**Usado por:** Ditado, Preencher, Digitar Junto (modo por caractere), Resultado e revisão de vocabulário.

## 1. Modos

| Modo | Maiúsculas | Acentos | Pontuação | Contrações equivalentes | Status "quase" |
| --- | --- | --- | --- | --- | --- |
| **Tolerante** (padrão) | ignora | ignora | ignora | sim | sim |
| **Estrita** | conta | conta | conta (exceto espaços extras) | não | não (vira erro) |

## 2. Normalização (modo tolerante)

1. `NFKC`, depois `NFD` e remoção de diacríticos (`\p{M}`).
2. Minúsculas.
3. Apóstrofos tipográficos (`’ ‘ ʼ`) viram `'`.
4. Expansão de contrações: `I'm → i am`, `you'll → you will`, `won't → will not`, `gonna → going to`, `wanna → want to`, `'cause → because`… A lista fica em `contractions.ts` e deve ser **fácil de estender**.
5. Remoção de pontuação (`[^\p{L}\p{N}\s']`), depois remoção de apóstrofos soltos.
6. Números: `2 ↔ two` e `10 ↔ ten` são equivalentes até 20, mais dezenas redondas.
7. Tokenização por espaço.

No modo estrito, só se faz o trim e o colapso de espaços.

## 3. Alinhamento (palavra a palavra)

Use **alinhamento global de Needleman–Wunsch** entre as palavras esperadas e as digitadas:

- custo de match = 0;
- custo de substituição = `0,5` se `lev(a,b) ≤ limiteQuase(a)`, senão `1`;
- custo de inserção ou remoção = `1`.

O limite do "quase" é `limiteQuase(w) = w.length <= 4 ? 1 : 2` no modo tolerante, e `0` no estrito.

O algoritmo guloso do protótipo (`design/artboards/Ditado.dc.html`) serve **só de ilustração**. Não reutilize.

Cada palavra **esperada** sai com um status:

| status | quando | pontos |
| --- | --- | --- |
| `ok` | igual depois da normalização | 1 |
| `near` | substituição dentro do limite do quase | 0,5 |
| `wrong` | substituição fora do limite | 0 |
| `missing` | não foi digitada | 0 |

**Contrações expandidas:** a normalização pode transformar uma palavra original em vários tokens (`We’ll → we will`). Guarde o mapeamento token → palavra original. O status da palavra original segue estas regras:
- `ok` se todos os seus tokens estão `ok`;
- `near` se há mistura de `ok`/`near` com `missing`/`wrong`;
- o pior status, caso contrário.

**Contração sem apóstrofo (Parte 10):** no tolerante, se a palavra digitada é igual à contração esperada sem caixa, acento, pontuação e apóstrofo (`were` × `We’re`), a palavra vale `near` com `hint: 'contraction'`, como no caso `ill` × `I’ll`. Tokens da mesma palavra (uma contração expandida) nunca contam como junção ou separação. O adaptador expõe isso como `bare(word)`, que é opcional por idioma.

As palavras digitadas a mais (`extra`) aparecem na interface riscadas, mas **não descontam** pontos. No modo estrito, descontam 0,25 cada, com mínimo 0.

Junções e separações: `all most` contra `almost` deve dar `near` no tolerante (`wrong` no estrito, que não tem "quase") com a sugestão "é uma palavra só" (decisão do dono, Parte 04). Sem essa regra, o alinhamento sozinho também daria `near` (most≈almost), mas deixaria "all" como extra e sem dica. Detecte quando duas palavras digitadas concatenadas são iguais **ou quase** a uma esperada (`lev ≤ limiteQuase`; no estrito, só iguais), ou o contrário, e devolva `hint: 'merge' | 'split'`. O "quase" é necessário para o próprio exemplo: `all`+`most` = `allmost`, a distância 1 de `almost`. Limitação conhecida: a comparação usa os tokens já normalizados, então `any one` × `anyone` não é detectado (`one` vira `1`).

## 4. Saída

```ts
type WordStatus = 'ok' | 'near' | 'wrong' | 'missing';
interface WordResult { expected: string; typed?: string; status: WordStatus; hint?: 'merge' | 'split' | 'number' | 'contraction'; }
interface LineScore { words: WordResult[]; extras: string[]; score: number /* 0..1 */; }
function scoreLine(expected: string, typed: string, mode: 'tolerant' | 'strict'): LineScore;
function scoreChars(expected: string, typed: string, mode): CharResult[]; // Digitar Junto — definido na Parte 06
```

## 5. Casos de teste obrigatórios (tolerante, salvo indicação)

| esperado | digitado | resultado |
| --- | --- | --- |
| Like a radio that plays it all | like a radyo that play it all | radio=near, plays=near, resto ok; score 6/7 |
| Like a radio that plays it all | Like a radio that plays it all. | tudo ok |
| Like a radio that plays it all | like a radio that plays it all **(estrito)** | Like=wrong |
| I’ll be the echo | ill be the echo | I'll=near (apóstrofo faltando) |
| I’ll be the echo | i will be the echo | tudo ok (contração) |
| Hold on, the night is almost gone | hold on the night is all most gone | almost=near, hint=merge, typed="all most", sem extras |
| Counting cars that never come my way | counting cars that never comes my way | come=near |
| So call my name across the static sea | so call my name across the stating see | static=near (lev 2, limite 2 para 6 letras), sea=near |
| So call my name across the static sea | so call my name across the stating see **(estrito)** | static=wrong, sea=wrong |
| We’ll be dancing when the lights come on | we be dancing when lights come on | We'll=near (parte “will” faltando), the=missing |
| two hearts | 2 hearts | ok (número) |

A última coluna pode ser ajustada no brainstorm da Parte 04. Depois de definida, vira teste.

## 6. Japonês (futuro, Parte 14)

A comparação deve ser feita em **kana**: o romaji é convertido para kana (ex.: wanakana), e kanji usam a leitura vinda de um tokenizador (ex.: kuromoji). O módulo deve aceitar um `LanguageAdapter { normalize, tokenize, nearThreshold }` desde a Parte 04, para não precisar ser reescrito.
