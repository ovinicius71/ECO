# API (FastAPI) — `apps/api`

- Prefixo `/api`. Respostas em JSON.
- Formato de erro: `{"error": {"code": "LYRICS_NOT_FOUND", "message": "..."}}`.
- Cache em disco (SQLite ou arquivos em `apps/api/.cache/`, ignorado no git) para LRCLIB, tradução e dicionário.
- CORS liberado só para a origem do front em desenvolvimento.

## Endpoints

### `GET /api/health`
`{"ok": true, "whisper": false}`

### `GET /api/songs/resolve?url=<youtube-url>`
Extrai o `videoId`. Aceita `watch?v=`, `youtu.be/`, `shorts/`, `music.youtube.com` e o parâmetro `t=`. Consulta o **oEmbed** (`https://www.youtube.com/oembed?url=...&format=json`), que não precisa de chave.

```json
{ "videoId": "abc123", "title": "Artist - Track (Official Video)", "author": "ArtistVEVO",
  "guess": { "artist": "Artist", "track": "Track" } }
```

A heurística do `guess` limpa sufixos ("Official Video", "Lyrics", "(Live)", "ft. …", "VEVO") e separa por " - ". Precisa de testes com vários formatos de título.

### `GET /api/lyrics?artist=&track=&duration=`
- Busca no **LRCLIB** (docs conferidas na Parte 02). O oEmbed **não informa a duração**, então o 1º acesso usa `GET /api/search?track_name=&artist_name=`; se vier vazio, `GET /api/search?q=<artista música>`. O ranking põe as sincronizadas primeiro, depois a semelhança com o palpite e, quando `duration` vier (player, Parte 03), a duração com ±2 s. O melhor resultado vira a resposta e os demais (até 10) vão para `candidates`. Instrumentais e registros sem letra ficam de fora.
- 429/503 do LRCLIB → `503 UPSTREAM_BUSY` com `Retry-After` repassado (sem retry automático). Falha de rede ou resposta não-JSON → `502 UPSTREAM_ERROR`. Nada encontrado → `404 LYRICS_NOT_FOUND`.
- Cache: 30 dias para resultados e 1 hora para "não encontrado" (o LRCLIB busca letras ausentes em segundo plano).
- Envie o header `User-Agent: Eco/0.1 (+https://github.com/ovinicius71/ECO)` (configurável em `ECO_USER_AGENT`), como o LRCLIB pede.
- Prefira resultados com `syncedLyrics`. Se só houver `plainLyrics`, devolva `synced: "estimated"` e distribua os versos pela duração.
- O parser de LRC fica em `app/services/lrc.py`:
  - suporta `[mm:ss.xx]`;
  - suporta vários timestamps na mesma linha;
  - ignora tags de metadados;
  - remove linhas vazias, mas guarda os intervalos instrumentais (para pular).

```json
{ "source": "lrclib", "lrclibId": 123, "artist": "...", "track": "...", "durationSec": 221, "synced": "line", "lang": "en",
  "lines": [ { "index": 0, "startMs": 12340, "endMs": 15800, "text": "..." } ],
  "candidates": [ { "lrclibId": 124, "artist": "...", "track": "...", "album": "...", "durationSec": 221, "synced": true } ] }
```

### `GET /api/lyrics/candidates?q=`
Lista de candidatos para "Trocar versão da letra". Até 20, sincronizadas primeiro, no formato de `candidates`.

### `GET /api/lyrics/{lrclibId}`
A letra de um candidato escolhido, no mesmo formato de `GET /api/lyrics` (com `candidates: []`). Adicionado na Parte 02.

### `POST /api/translate`
Corpo: `{ "lines": ["..."], "from": "en", "to": "pt" }` → `{ "lines": ["..."] }`. **O provedor está em aberto** (pergunta C do brainstorm inicial). O cache é por hash da linha.

### `GET /api/dictionary/{lang}/{word}`
Retorna `{ word, ipa, pos, meaningsPt[], note?, audioUrl? }`. **A fonte está em aberto** (pergunta D).

### `GET /api/words/cefr?words=a,b,c`
Retorna `{ "a": "A1", "b": "B2", "c": null }`. **A lista está em aberto** (pergunta E). Os dados ficam em `app/data/`.

### `GET /api/words/distractors?word=echoes&n=3`
Retorna vizinhos fonéticos pelo **CMUdict**: distância de fonemas, mesma quantidade de sílabas quando possível, e excluindo a própria palavra e suas variações.

### `POST /api/transcribe` *(Parte 13, atrás da flag `ECO_ENABLE_WHISPER=1`)*
Recebe um arquivo de áudio em multipart e devolve `lines` com timestamps de palavra (faster-whisper). Também recebe o idioma (opcional). **Não baixa nada do YouTube** (ver pergunta F).

## Variáveis de ambiente (`apps/api/.env.example`)

```
ECO_CORS_ORIGIN=http://localhost:5173
ECO_CACHE_DIR=.cache
ECO_ENABLE_WHISPER=0
ECO_WHISPER_MODEL=small
ECO_TRANSLATE_PROVIDER=
ECO_TRANSLATE_API_KEY=
ECO_USER_AGENT=Eco/0.1 (+https://github.com/ovinicius71/ECO)
ECO_LRCLIB_URL=https://lrclib.net
ECO_HTTP_TIMEOUT_S=10
```
