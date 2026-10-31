# 0015 — Resultado e progresso (geral)

Data: 2026-10-31 · Parte 10 · Branch `feat/10-resultado-progresso` · Técnico: [0015](../tecnico/0015-resultado-e-progresso.md)

## Em uma frase
O Eco agora guarda as suas sessões, mostra o resultado de cada uma e acompanha o seu progresso na Home: é a **primeira versão usável** (colar o link, fazer o Ditado, ver o resultado).

## O que mudou
- **Fim do Ditado → Resultado:** a sessão é salva no navegador e abre a tela Resultado, com:
  - a precisão grande, "Novo recorde" (quando supera a sua melhor vez naquela música) e a sequência de dias;
  - versos, palavras certas, quase, erradas, tempo de prática e repetições;
  - uma barra por verso (certo / quase / erro);
  - **versos para rever**, com uma nota curta ("Você escreveu “all most” — “almost” é uma palavra só.") e um botão para praticar só aquele verso;
  - **Praticar só os versos com erro**, Repetir, Outro modo e Nova música.
- **Home:**
  - **Biblioteca** com as abas Recentes e Favoritas (último modo e melhor nota);
  - **STATUS** com músicas praticadas, precisão média, **meta de hoje** (minutos de 20) e os quadradinhos da **semana**.
- **Sequência de dias** no cabeçalho (o chip com a chama).
- **Favoritar** na tela da música.
- **Tempo de prática:** conta o tempo ativo; pausas de mais de 2 min não contam. Sair no meio do Ditado não salva a sessão (como você decidiu), mas os minutos contam para a meta e a sequência.
- "Palavras para salvar" ficou para a Parte 09 (sua escolha).

## O que dá para ver ou testar agora
- Faça um Ditado (para testar rápido, só 2 versos: `/praticar/<id>/ditado?versos=1,2`). No fim, abre o Resultado. Volte à Home e veja a música na Biblioteca e a semana marcada.
- Testei com um vídeo real: Ditado → Resultado → Home, inclusive em 390 px.

## Próximo passo
- Parte 06: o modo Digitar Junto.
