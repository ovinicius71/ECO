# 0010 — Home e tela Configurar música (técnico)

Data: 2026-10-31 · Parte 02 · Branch `feat/02-busca-letra` · Geral: [0010](../geral/0010-telas-busca-letra.md)
Commits: `400fa32`, `53db197`, `ee4cf64`

## Mudanças (`apps/web`)
- `vite.config.ts`: proxy `/api` → `http://localhost:8000`.
- `types/song.ts` (`Song`, `Line`, `Token`, `Lang`, `Cefr`, `SyncKind`, conforme o `dados.md`) e `types/practice.ts` (`ModeId`).
- `lib/api/client.ts`: `apiGet` e `ApiError` (`status`, `code`, `retryAfter`), com `NETWORK` para falha de rede e `UNKNOWN` para resposta sem JSON. `lib/api/songs.ts` tem os endpoints tipados.
- `lib/db/db.ts`: `EcoDb` (Dexie) com o **schema v1 só com `songs`** (`videoId`, índice `lastPlayedAt`). `lib/db/songs.ts`: `getSong` e `saveSong`, que preserva `offsetMs`, `favorite`, `createdAt` e `lastPlayedAt` ao trocar a letra.
- `features/lyrics/toLines.ts`: tokens por verso (`text` original + `norm` via `english.normalize`) e `countWords`.
- `features/lyrics/loadSong.ts`: `loadSong` (Dexie → resolve → findLyrics → save; devolve `found` ou `not-found` com a query) e `switchVersion`. Ambos recebem as dependências por parâmetro, para os testes.
- `pages/Home`: formulário com `noValidate` (aceita link sem `https://`), `aria-invalid` + `role="alert"` e anel de foco no campo inteiro (`:focus-within`).
- `pages/SongSetup`:
  - `SongSetup` (estados loading/found/not-found/error, Esc → `/`);
  - `ModePicker` (SelectList + detalhe + Segmented por ajuste);
  - `VersionPicker` (candidatos + busca editável);
  - `modes.ts` (copy do artboard e em que parte cada modo chega).
- Componentes:
  - `SelectList.onSelectedChange` (com ref para não disparar duas vezes no foco programático);
  - ícones `play` e `youtube`;
  - `Icon.strokeWidth`.
- `lib/utils/time.ts`: `formatDuration`.
- `AppHeader`: o ESTUDAR fica ativo em `/`, `/musica/*` e `/praticar/*`. Usa `Link` + `aria-current` calculado, no lugar do `NavLink`.

## Dependências e versões
- `dexie` 4.4.7.
- Dev: `fake-indexeddb` 6.2.7, só para os testes do Dexie.

## Decisões técnicas
- **Dexie já na 02** (dono, P3). Schema mínimo: as tabelas restantes chegam com `version(n)` nas partes que as usam.
- **Estado derivado da chave da requisição** (`{ key, state }`; chave diferente = carregando), em vez de `setState` síncrono no effect. A regra `react-hooks/set-state-in-effect` do plugin v7 bloqueava o padrão antigo.
- **`StatusPanel` com o título "MÚSICA"** na coluna da música. O artboard tem só as linhas, sem título; é um desvio pequeno para reaproveitar o componente.
- **Sem miniatura do vídeo:** buscá-la no `i.ytimg.com` seria uma chamada externa direta do front. Fica o placeholder hachurado até a Parte 03.

## Como verificar
- `npm run check` na raiz: 101 testes no web e 56 na API.
- Teste manual no navegador (Playwright):
  - Home → cola o link → `/musica/<id>` com os dados reais;
  - 1440×960 e 390×844 sem rolagem horizontal;
  - registro no IndexedDB conferido;
  - com a API derrubada, o reload ainda carrega a música.

## Riscos e pendências
- Em dev, o StrictMode dispara o `loadSong` duas vezes. O primeiro é abortado e o cache da API absorve a repetição.
- "Colar letra manualmente" e "Transcrever com Whisper" ainda não aparecem na tela (P2 e Parte 13).
