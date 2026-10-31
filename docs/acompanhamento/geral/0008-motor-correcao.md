# 0008 — Motor de correção (geral)

Data: 2026-10-31 · Parte 04 · Branch `feat/04-motor-correcao` · Técnico: [0008](../tecnico/0008-motor-correcao.md)

## Em uma frase
O Eco já sabe comparar o que você digitou com o verso da música e dizer, palavra por palavra, o que está certo, quase certo, errado ou faltando.

## O que mudou
- O **modo tolerante**, que é o padrão:
  - ignora maiúsculas, acentos e pontuação;
  - aceita contrações por extenso (`I'll` = `I will`, `gonna` = `going to`), e também sem apóstrofo quando não há ambiguidade (`dont` = `don't`);
  - aceita números em algarismo (`2` = `two`).
- O **"quase"** vale meia palavra: um erro de 1 letra em palavras curtas e de até 2 nas longas (`radyo` ≈ `radio`).
- O **modo estrito** conta maiúscula, acento e pontuação, e não tem "quase".
- **Palavra separada ou junta por engano** (`all most` × `almost`, `everybody` × `every body`): no tolerante vira "quase", com a dica "é uma palavra só" ou "são duas palavras". Foi a sua decisão, e a spec foi atualizada.
- **Palavras a mais** aparecem para o usuário ver, mas só descontam no estrito.
- **Nota do verso:** de 0 a 1, com a média por palavra.
- Ainda não há tela. É a lógica que o Ditado (Parte 05) e o Preencher (07) vão usar.

## Por que
- É o coração dos modos de prática. Ficou isolado e muito testado (48 testes), incluindo os 11 casos obrigatórios da spec.

## O que dá para ver ou testar agora
- `npm run test` no `apps/web`. Os testes em `src/features/correction/` mostram cada caso em português.

## Achados no caminho
- O exemplo da spec `all most` × `almost` não é uma concatenação exata ("allmost"). A regra agora aceita concatenação "quase igual".
- Quando havia empate de pontuação, o alinhamento podia preferir "duas erradas" a "uma faltando e uma certa". Agora o empate favorece os acertos.
- Limitação conhecida: `any one` × `anyone` não ganha a dica, porque "one" vira o número 1 na normalização.

## Próximo passo
- Parte 02: buscar a letra pelo link do YouTube.
