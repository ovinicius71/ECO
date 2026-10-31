# 0009 — Servidor busca o vídeo e a letra (geral)

Data: 2026-10-31 · Parte 02 · Branch `feat/02-busca-letra` · Técnico: [0009](../tecnico/0009-api-busca-letra.md)

## Em uma frase
O servidor do Eco recebe um link do YouTube, descobre o nome da música e do artista e busca a letra sincronizada no LRCLIB.

## O que mudou
- **Links:** aceita todos os formatos comuns do YouTube (`watch?v=`, `youtu.be`, `shorts`, YouTube Music…).
- **Nome da música:** pega o título do vídeo (oEmbed, sem baixar nada) e faz um palpite de artista e música, limpando "(Official Video)", "[Lyrics]", "ft. …" etc.
- **Letra:** busca no LRCLIB e prefere as versões sincronizadas e mais parecidas com o palpite. As outras versões viram "candidatas" para trocar depois.
- **Sincronia:** converte o arquivo LRC em versos com início e fim. Os trechos instrumentais encerram o verso anterior. Se a letra vier sem tempos, os versos são distribuídos ao longo da música ("sincronia estimada").
- **Cache:** guarda as respostas por 30 dias, ou por 1 hora quando a letra não foi encontrada. Isso respeita os limites do LRCLIB.
- **Erros** em português e num formato único: link inválido, vídeo indisponível, LRCLIB ocupado ("tente em N s").

## Por que
- É o primeiro passo do fluxo principal: colar o link e ter a letra.

## O que dá para ver ou testar agora
- `npm run dev:api` e depois http://localhost:8000/docs. Teste `/api/songs/resolve` com um link e `/api/lyrics` com o artista e a música.
- Testei com um vídeo real: o palpite acertou artista e música e veio a versão sincronizada (58 versos) com 10 alternativas.

## Achado no caminho
- O oEmbed do YouTube não informa a duração do vídeo, que é o dado que o LRCLIB usa para achar a versão exata. Por isso a busca usa o "search" do LRCLIB, e a duração vai servir de desempate quando o player chegar (Parte 03).

## Próximo passo
- As telas que usam essa busca (registro 0010).
