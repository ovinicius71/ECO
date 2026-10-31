# 0010 — Home e tela Configurar música (geral)

Data: 2026-10-31 · Parte 02 · Branch `feat/02-busca-letra` · Técnico: [0010](../tecnico/0010-telas-busca-letra.md)

## Em uma frase
Agora dá para colar um link na Home e cair na tela da música, com os dados reais, a escolha de modo e os ajustes, e a música fica salva no navegador.

## O que mudou
- **Home:** o título "Aprenda inglês pelo que você ouve", o campo do link, "Como funciona" e os idiomas. Link inválido mostra o erro logo abaixo do campo.
- **Configurar música:**
  - à esquerda, o vídeo (ainda um placeholder), o título, o artista e o painel com idioma, fonte, sincronia, versos e palavras;
  - no meio, os 6 modos;
  - à direita, a descrição e os ajustes do modo escolhido.
  - O botão Começar diz "EM BREVE" e indica em qual parte o modo chega.
- **Trocar versão da letra:** lista as versões do LRCLIB, com uma busca que dá para editar, e troca a letra.
- **Letra não encontrada:** a tela explica e já mostra as versões disponíveis.
- **Salvo no navegador**, como você decidiu: reabrir a mesma música carrega na hora, mesmo com o servidor desligado (testei).
- No menu do topo, o ESTUDAR fica ativo na tela da música, como no design.

## Por que
- Fecha o primeiro trecho do fluxo principal (colar o link → escolher o modo). As partes dos modos só vão "ligar" o botão Começar.

## O que dá para ver ou testar agora
- Em dois terminais: `npm run dev:api` e `npm run dev:web`. Abra http://localhost:5173, cole um link de música e aperte Enter.
- Na tela da música: o mouse ou `↑ ↓` trocam o modo, `Esc` volta, "Trocar versão da letra" abre as versões.

## Próximo passo
- Parte 03: o player do YouTube de verdade, com sincronia, velocidade e ajuste de offset.
