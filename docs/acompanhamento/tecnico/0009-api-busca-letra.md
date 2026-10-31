# 0009 — Servidor busca o vídeo e a letra (técnico)

Data: 2026-10-31 · Parte 02 · Branch `feat/02-busca-letra` · Geral: [0009](../geral/0009-api-busca-letra.md)
Commits: `730a22e`/`b46965b` (brainstorm), `ad81dc9`, `5a544e3`, `581d9ee`, `532a59e`

## Mudanças (`apps/api`)
- `app/errors.py`: `ApiError(status, code, message, headers)` + handlers. `RequestValidationError` passa a responder 400 `INVALID_REQUEST`, no mesmo formato.
- `app/deps.py`: `Http` (um `httpx.AsyncClient` por app, criado no `lifespan` com `User-Agent` e timeout) e `CacheDep`.
- `app/services/cache.py`: `Cache` SQLite (`key`, `value` JSON, `expires_at`) com lock e relógio injetável. `create_app(settings, cache=None)` aceita um cache em memória nos testes.
- `app/services/youtube.py`:
  - `parse_video_id`: hosts permitidos; `/watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, `/live/`, `/v/`; aceita sem esquema; id `[A-Za-z0-9_-]{11}`.
  - `fetch_oembed`: 400/401/403/404 → `VIDEO_UNAVAILABLE` e falha de rede → `UPSTREAM_ERROR`. Cache de 30 dias.
- `app/services/title_guess.py`: remove o ruído entre parênteses/colchetes (official, lyrics, live, 4K, ft…) e o `ft./feat.` solto, e separa por ` - – — |`. Sem separador, o artista vem do autor sem `VEVO`/`- Topic`.
- `app/services/lrc.py`:
  - `parse_lrc`: `[mm:ss(.x|.xx|.xxx|:xx)]` e vários timestamps por linha. Ignora metadados. Linha vazia = intervalo. O último verso vai até a duração ou +5 s.
  - `estimate_lines`: distribuição uniforme quando não há tempos.
- `app/services/lrclib.py`: `Lrclib` (`search`, `get`), com:
  - cache de 30 dias para resultados e 1 h para vazio ou 404;
  - 429/503 → 503 `UPSTREAM_BUSY` repassando o `Retry-After`;
  - resposta sem JSON → 502;
  - `rank()` (sincronizada +2, similaridade de artista e título por `SequenceMatcher`, duração ±2 s +3; instrumentais fora).
- Rotas:
  - `GET /api/songs/resolve`;
  - `GET /api/lyrics?artist&track&duration`: search estruturado, depois `q`, depois rank;
  - `GET /api/lyrics/candidates?q`;
  - `GET /api/lyrics/{lrclibId}` (novo).
- Schemas Pydantic em camelCase (`CamelModel` com `to_camel`).
- Config nova: `ECO_USER_AGENT`, `ECO_LRCLIB_URL`, `ECO_HTTP_TIMEOUT_S`, com o `.env.example` atualizado. Spec `api.md` atualizada com a estratégia de busca, os erros, o cache e o endpoint novo.

## Dependências e versões
- Nenhuma nova: `httpx` e `sqlite3` (stdlib) já estavam disponíveis.

## Decisões técnicas
- **Sem duração no 1º acesso:** o oEmbed não traz a duração, e o `/api/get` do LRCLIB casa por duração ±2 s. Por isso a busca usa o `/api/search` com ranking, e a `duration` (Parte 03) entra como desempate.
- **Sem retry automático no 429**, repassando o `Retry-After` ao front. Isso evita ban por insistência (as docs do LRCLIB avisam).
- **`synced: "word"` não é usado ainda**, mesmo com `hasWordSync`. O `lyricsfile` (YAML com os tempos por palavra) fica para o Karaokê (12).
- **Idioma:** `ja` se houver kana ou kanji no texto, senão `en`.

## Como verificar
- `cd apps/api` e depois `uv run pytest`: 56 testes, todos com respx e a fixture inventada, sem rede.
- Teste manual com a rede real, feito uma vez e fora dos testes: resolve + lyrics de um vídeo público. O palpite saiu correto e veio a versão sincronizada (58 versos) com 10 candidatos.

## Riscos e pendências
- O palpite de título falha em formatos exóticos. A saída é a "Trocar versão", com busca editável.
- O cache SQLite é síncrono dentro de rotas async. É aceitável para uso local e de um usuário; revisar se a API for publicada.
