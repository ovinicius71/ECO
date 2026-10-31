# Entrega — Parte 02: Busca de letra

Branch: `feat/02-busca-letra` · Base: `main`
Status: 🟡 pronta para push

## O que foi entregue
- **API:**
  - `GET /api/songs/resolve`: parse da URL, oEmbed e palpite de artista/música.
  - `GET /api/lyrics`: busca no LRCLIB com ranking e candidatos.
  - `GET /api/lyrics/candidates`.
  - `GET /api/lyrics/{lrclibId}`: endpoint novo.
  - Parser de LRC, sincronia estimada para letra simples, cache SQLite e o formato de erro da spec.
- **Web:**
  - Home com a busca pelo link.
  - Tela Configurar música (`/musica/:videoId`) com dados reais, os 6 modos e os ajustes (Começar em "EM BREVE").
  - "Trocar versão da letra" e o estado "letra não encontrada" com as versões.
  - A música é salva no IndexedDB (Dexie, `songs` v1) e reaberta sem chamar a API.
- Specs atualizadas: `api.md` (busca sem duração, erros, cache, endpoint novo) e `arquitetura.md`.

## Como testar
1. `npm run setup` (por causa do `dexie` novo) e depois `npm run check` na raiz.
2. Em dois terminais: `npm run dev:api` e `npm run dev:web`.
3. Em http://localhost:5173, cole o link de um clipe musical e aperte Enter. O resultado esperado é a tela da música, com título, artista, "POR LINHA ✓" e o número de versos.
4. Lá: mouse ou `↑ ↓` nos modos; "Trocar versão da letra"; `Esc` volta.
5. Derrube a API e recarregue `/musica/<id>`: a música continua abrindo (vem do navegador).

## Testes automatizados
- `npm run test` (web): 101 passando, 30 deles novos.
- `pytest` (api): 56 passando, 53 deles novos. Tudo com respx e a fixture inventada, sem rede.

## Commits
- `730a22e docs(brainstorm): parte 02 — busca-letra`
- `b46965b docs(brainstorm): decisões da parte 02`
- `ad81dc9 feat(api): formato de erro, cache SQLite e cliente HTTP compartilhado`
- `5a544e3 feat(api): parse de URL do YouTube, oEmbed e palpite de artista/música`
- `581d9ee feat(api): parser de LRC e estimativa de sincronia`
- `532a59e feat(api): busca no LRCLIB com ranking, candidatos e letra por id`
- `400fa32 feat(web): cliente da API, tipos de música, Dexie (songs v1) e carregamento da música`
- `53db197 feat(web): Home com busca pelo link do YouTube`
- `ee4cf64 feat(web): tela Configurar música com versões da letra e ESTUDAR ativo no fluxo de estudo`
- `b1ff582 docs(acompanhamento): 0009 e 0010 — busca de letra (API e telas)`

## Decisões tomadas por padrão (não bloqueantes)
- NB1–NB16 do brainstorm:
  - busca por `/api/search` com ranking;
  - cache de 30 dias, ou 1 h para "não encontrado";
  - sem retry no 429;
  - User-Agent configurável;
  - regras do parser;
  - `synced: word` adiado;
  - idioma por kana/kanji;
  - palpite de título;
  - URLs aceitas;
  - `fetch` sem dependência nova;
  - proxy do Vite;
  - placeholder do vídeo;
  - "—" em dificuldade e melhor;
  - estados de carregando e erro no estilo do design;
  - atalhos.
- Pela P3 (Dexie já):
  - schema v1 só com `songs`;
  - `fake-indexeddb` em dev;
  - candidatos sob demanda;
  - endpoint `GET /api/lyrics/{lrclibId}`.
- Também decidi sem perguntar:
  - ESTUDAR ativo em `/musica` e `/praticar` (como no artboard);
  - estado derivado da chave da requisição (exigência do `react-hooks` v7);
  - campo de busca editável no "Trocar versão".

## Fora do escopo / pendências
- Player, offset e duração real → Parte 03. A duração vai melhorar o ranking.
- "Colar letra manualmente" → parte futura. "Transcrever com Whisper" → Parte 13.
- Biblioteca e STATUS da Home → Parte 10.

## Desvios do design
- A coluna da música usa o `StatusPanel` com o título "MÚSICA" (o artboard tem só as linhas).
- Na Home, saiu a linha "◇ Sem letra? Transcrever com Whisper (local)", porque o recurso ainda não existe.
- "LETRA ERRADA?" mostra só "Trocar versão da letra". As outras duas opções chegam com os recursos delas.
