# Brainstorm — Parte 02: Busca de letra

Branch: `feat/02-busca-letra` · Base: `main`
Data: 2026-10-31

## Contexto
- **API:** resolver o link do YouTube (parse da URL + oEmbed + palpite de artista/música) e buscar a letra no LRCLIB, com o parser de LRC.
- **Web:** a Home (colar o link) e a tela Configurar música (`/musica/:videoId`) com dados reais.
- Specs: `docs/spec/api.md` e `docs/spec/produto.md`. Artboards: `Main` e `Setup`.

## Já decidido
- Só oEmbed + IFrame API; nada de baixar áudio ou vídeo (CLAUDE.md §8).
- Formato de erro `{"error": {"code", "message"}}`. CORS só para a origem do front. Testes sem rede (respx + fixtures inventadas).
- O front fala com serviços externos **só via `apps/api`**.

## O que conferi no LRCLIB (docs atuais, https://lrclib.net/docs.md)
- `GET /api/get?track_name&artist_name[&album_name][&duration]`: `duration` é opcional, mas a correspondência é por duração ±2 s. Sem match → 404 `{"name":"TrackNotFound"}`.
- `GET /api/get/{id}` e `GET /api/search?q|track_name[&artist_name]`: no máximo 20 resultados, sem paginação.
- Campos: `id`, `trackName`, `artistName`, `albumName`, `duration`, `instrumental`, `plainLyrics|null`, `syncedLyrics|null`, `hasWordSync`, `lyricsfile` (YAML).
- O `User-Agent` é obrigatório: app, versão e link. Há rate limit de ~90 req/min para cliente identificado. No 429, respeitar o `Retry-After`. Parâmetros malformados devolvem **texto puro**, não JSON.
- **O oEmbed do YouTube não traz a duração.** Por isso o `/api/get` com duração não serve na primeira busca; a duração real só vem do player (Parte 03).

## Perguntas bloqueantes (preciso da resposta antes de codar)
1. **Quanto da tela Configurar música entra agora?**
   - A) A coluna da música com dados reais (título, artista, fonte, sincronia, versos · palavras), mais a lista dos 6 modos com descrição e ajustes (Segmented), como no design. O **Começar fica desabilitado ("EM BREVE")** até cada modo existir. O vídeo usa o placeholder hachurado, e o player e o ajuste de offset entram na 03.
   - B) Só a coluna da música e a lista de modos, sem os ajustes por modo.
   - Recomendação: A, porque a tela fica pronta e as partes dos modos só ligam o botão.
2. **Letra não encontrada (tela sem design): o que entra agora?**
   - A) Só os candidatos do LRCLIB ("Trocar versão da letra"): uma lista com artista, música, duração e se é sincronizada. Escolher um carrega a letra pelo `id`.
   - B) A + "Colar letra manualmente", com sincronia estimada pela duração.
   - C) Só uma mensagem de erro com "Tentar outra busca".
   - Recomendação: A. Colar a letra pede um editor e uma estimativa de tempo, e cabe numa parte própria, perto da 13 (Whisper).
3. **Salvar a música no navegador (Dexie/IndexedDB) já nesta parte?**
   - A) Não: a API faz cache em disco e o Dexie entra na Parte 03, junto com o offset por música (o primeiro dado que só existe no navegador).
   - B) Sim: salvar a `Song` ao abrir a tela Configurar música.
   - Recomendação: A, porque mantém a 02 focada. Reabrir a mesma música é rápido por causa do cache da API.
4. **A Home sem dados de progresso (a Biblioteca e o STATUS dependem da Parte 10):**
   - A) Mostrar só o topo (título, campo do link, "como funciona", idiomas). A Biblioteca e o STATUS entram na 10.
   - B) Mostrar também a Biblioteca e o STATUS com estados vazios ("Nenhuma música ainda").
   - Recomendação: A. Painéis vazios por várias partes parecem tela quebrada.

## Perguntas não bloqueantes (sigo a recomendação se não houver resposta)
1. **Estratégia de busca sem duração?** Recomendação:
   - `/api/search?track_name=<palpite>&artist_name=<palpite>`;
   - se vier vazio, `/api/search?q=<título limpo>`;
   - ordenar: sincronizada primeiro, depois pela semelhança de artista e título com o palpite;
   - devolver o melhor e os demais como `candidates`.
   - Quando o front souber a duração (Parte 03), o parâmetro `duration` desempata (±2 s).
2. **Cache na API?** Recomendação: SQLite (stdlib `sqlite3`) em `ECO_CACHE_DIR`, chave = URL externa. Validade: 30 dias para sucesso e 1 hora para "não encontrado", porque o LRCLIB pode buscar depois.
3. **429/503 do LRCLIB?** Recomendação: não fazer retry automático. Devolver `503 {"code":"UPSTREAM_BUSY"}` com o `Retry-After`, e o front mostra "tente em N s".
4. **User-Agent?** Recomendação: `Eco/0.1 (+https://github.com/ovinicius71/ECO)`, configurável por `ECO_USER_AGENT`.
5. **Parser de LRC?** Recomendação:
   - aceita `[mm:ss]`, `[mm:ss.x]`, `[mm:ss.xx]` e `[mm:ss.xxx]`, e vários timestamps por linha (duplica e ordena);
   - ignora tags de metadados (`[ar:]`, `[ti:]`, `[length:]`…);
   - linha vazia = intervalo instrumental: some da lista, mas o verso anterior termina no início do intervalo (`endMs`);
   - o último verso termina em `duration` (ou `start + 5 s`, se não houver).
6. **`synced: "word"`?** Recomendação: devolver `"line"` mesmo quando `hasWordSync`. Ler o `lyricsfile` (YAML) com os tempos por palavra fica para o Karaokê (12).
7. **Só `plainLyrics`?** Recomendação: `synced: "estimated"`, com os versos distribuídos por igual na `duration` do LRCLIB.
8. **Idioma?** Recomendação: `en` por padrão; `ja` se houver kana ou kanji. Uma heurística simples, revisada na 14.
9. **Palpite de artista/música (`title_guess.py`)?** Recomendação:
   - remove sufixos: `(Official Video)`, `[Lyrics]`, `(Live)`, `ft./feat. …`, `HD`, `4K`, `Audio`;
   - tira `VEVO`/`- Topic` do autor;
   - separa por ` - `, ` – ` ou ` — `;
   - sem separador, usa o autor como artista.
   - Testes com ~10 formatos.
10. **URLs aceitas?** Recomendação: `watch?v=`, `youtu.be/`, `shorts/`, `embed/`, `music.youtube.com`, `m.youtube.com`, com `t=` e outros parâmetros ignorados. `videoId` = 11 caracteres `[A-Za-z0-9_-]`. Link inválido → 400 `INVALID_URL`.
11. **Chamadas no front?** Recomendação: `lib/api/` com `fetch` tipado e um hook simples (`useApi`), **sem dependência nova** (sem TanStack Query por enquanto).
12. **Dev:** proxy do Vite `/api` → `http://localhost:8000`, sem CORS em dev. O CORS continua configurado para outros usos.
13. **Vídeo no Setup?** Recomendação: o placeholder hachurado do design (sem thumbnail), porque buscar a imagem no `i.ytimg.com` seria uma chamada externa direta do front. O player vem na 03.
14. **Dificuldade, MELHOR e TEMPO no Setup?** Recomendação: "—" até as Partes 07 e 10.
15. **Estados sem design (carregando e erro), no mesmo estilo?** Recomendação:
    - carregando = rótulo `BUSCANDO LETRA…` em caixa alta, com uma barra de linhas finas;
    - erro = um painel com borda forte, a mensagem e as ações `TENTAR DE NOVO` / `← VOLTAR`;
    - cores só de tokens, sem vermelhão (não é erro do usuário).
16. **Atalhos:**
    - Home: `Enter` busca (form nativo).
    - Setup: `↑ ↓` escolhem o modo, `Enter` começa (quando habilitado) e `Esc` volta.

## Riscos e o que pode dar errado
- Títulos de vídeo muito variados: o palpite vai errar às vezes. Mitigação: candidatos e, depois, edição manual da busca.
- O rate limit do LRCLIB em dev, com muitos reloads. Mitigação: o cache.
- O oEmbed falha para vídeos privados ou com incorporação desativada (401/404). Mitigação: erro `VIDEO_UNAVAILABLE` com mensagem clara.

## Plano de commits
1. `docs(brainstorm): parte 02 — busca-letra`
2. `feat(api): formato de erro, cache SQLite e cliente HTTP`
3. `feat(api): parse de URL do YouTube, oEmbed e palpite de título`
4. `feat(api): parser de LRC`
5. `feat(api): busca no LRCLIB e endpoints de letra`
6. `feat(web): cliente da API e Home com busca`
7. `feat(web): tela Configurar música`
8. `docs(acompanhamento): …` e `docs(entrega): parte 02 — busca-letra`

## Decisões (preenchido depois das respostas)
- P1 → A: tela Configurar música completa, com o Começar desabilitado ("EM BREVE") e o player e o offset na 03 (dono, 2026-10-31)
- P2 → A: só os candidatos do LRCLIB ("Trocar versão da letra"); colar a letra fica para uma parte futura (dono, 2026-10-31)
- P3 → **B**: o Dexie entra já. A música é salva no IndexedDB ao abrir a tela Configurar música, e quem reabre lê do navegador sem chamar a API (dono, 2026-10-31)
- P4 → A: a Home mostra só o topo; Biblioteca e STATUS na 10 (dono, 2026-10-31)
- Consequências da P3, decididas por padrão:
  - schema v1 do Dexie **só com a tabela `songs`** (`videoId`, índice `lastPlayedAt`). As outras tabelas do `dados.md` entram com `version(n)` nas partes que as usam;
  - tipos `Song`/`Line`/`Token` em `src/types/song.ts`;
  - `fake-indexeddb` como dependência de **dev**, só para os testes do Dexie;
  - "Trocar versão" busca os candidatos sob demanda (`/api/lyrics/candidates?q=`) e regrava a música;
  - novo endpoint `GET /api/lyrics/{lrclibId}`, necessário para carregar o candidato escolhido (a spec `api.md` será atualizada).
- NB1–NB16 → decididos por padrão
