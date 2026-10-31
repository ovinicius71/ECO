# 0016 — Ajuste na correção de contrações (geral)

Data: 2026-10-31 · Parte 10 · Branch `feat/10-resultado-progresso` · Técnico: [0016](../tecnico/0016-ajustes-na-correcao.md)

## Em uma frase
A tela Resultado mostrou um erro do motor de correção: "were" digitado para "We're" recebia a dica "são duas palavras". Agora vale "quase", com a dica de contração.

## O que mudou
- Uma contração ("We're" = "we are") não é mais confundida com duas palavras separadas ou juntadas.
- Quem digita a contração **só sem o apóstrofo** ("were", "youre"…) ganha **quase** (meia palavra). É a mesma lógica do caso "ill" × "I'll" que você já tinha aprovado: no modo tolerante, a pontuação é ignorada.
- A spec de correção foi atualizada com essa regra.

## Também registrado (processo)
- Um commit (`3137c4c`) entrou com 1 teste falhando: o meu comando encadeava o commit na saída do `grep`, e não no resultado da verificação. O commit seguinte (`e84c17c`) corrigiu.
- Desde então, o commit só roda se a verificação passar. É a segunda vez que isso acontece nesta sessão (a primeira foi na Parte 05), por isso o reforço.

## O que dá para ver ou testar agora
- No Ditado, digite "were no strangers to love" para "We're no strangers to love": "We're" fica com o tracejado de quase.
