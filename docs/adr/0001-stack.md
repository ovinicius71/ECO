# ADR 0001 — Stack inicial

Status: **aceita** pelo dono no brainstorm da Parte 00 (pergunta A), em 2026-10-31. Gerenciador do front: **npm** (pergunta B).
Data: 2026-10-31

## Contexto

- É um protótipo pessoal: desktop primeiro, sem login, com dados no navegador.
- Precisa de um back-end leve para:
  - fazer proxy e cache do LRCLIB e do oEmbed;
  - tradução e dicionário;
  - listas de palavras (CEFR, CMUdict);
  - Whisper local.
- O dono tem experiência forte em Python (FastAPI) e conhece JavaScript.

## Decisão proposta

**Web — `apps/web`:**
- React 18+ + Vite + TypeScript (strict)
- React Router para as rotas
- Zustand para o estado da prática (player e sessão)
- Dexie para o IndexedDB
- CSS Modules + `tokens.css` (sem framework de UI, para manter o visual próprio)
- Vitest + Testing Library; ESLint + Prettier

**API — `apps/api`:**
- Python 3.12 + FastAPI
- Gerenciador **uv**
- httpx para chamadas externas
- Pydantic para os schemas
- pytest + respx para mocks HTTP
- ruff para lint e format

**Monorepo:** sem ferramenta especial. O `README.md` da raiz documenta os comandos. Opcionalmente, um `package.json` na raiz com scripts `dev:web` / `dev:api`.

## Consequências

- Duas linguagens; o dono domina as duas.
- A lógica de correção roda no cliente (TypeScript), para dar feedback instantâneo.
- O Whisper fica isolado no back-end, atrás de uma flag.
