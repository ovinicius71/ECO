# Entrega — Parte 00: Setup do monorepo

Branch: `chore/00-setup-monorepo` · Base: `main`
Status: ✅ mergeada (o dono renomeou a branch para `main` com `git branch -M main` e aceitou como merge, sem commit de merge, em 2026-10-31)

## O que foi entregue
- O repositório git foi iniciado (`main` com o commit inicial) e a Parte 00 fica na sua própria branch.
- `apps/web`:
  - React 19, Vite 8 e TypeScript 6.0 strict, com o alias `@/`;
  - ESLint (com as regras de import da arquitetura), Prettier e Vitest + Testing Library;
  - placeholder "ECO エコ" com os tokens.
- `apps/api`:
  - FastAPI com uv, pydantic-settings (`ECO_*`) e CORS restrito;
  - `GET /api/health`;
  - ruff e pytest.
- `package.json` na raiz com `setup`, `dev:web`, `dev:api`, `lint`, `typecheck`, `test` e `check`. O README ganhou a seção "Como rodar".
- `.gitattributes` (LF) e `.nvmrc`.
- Processo:
  - `docs/acompanhamento/` com os registros 0001–0004 (geral + técnico);
  - CLAUDE.md atualizado: perguntas pela ferramenta e registros de acompanhamento;
  - ADR 0001 aceito.

## Como testar
1. Reabra o terminal (por causa do PATH do uv) e, na raiz, rode `npm run setup`.
2. `npm run check`. Esperado: tudo verde.
3. `npm run dev:web` → http://localhost:5173 mostra "ECO エコ / EM CONSTRUÇÃO" no papel pontilhado.
4. `npm run dev:api` → http://localhost:8000/api/health responde `{"ok":true,"whisper":false}`. A documentação fica em `/docs`.

## Testes automatizados
- `npm run test` (web): 1 passando.
- `pytest` (api): 3 passando.
- Lint, format e typecheck: sem erros nos dois apps.

## Commits
- `6f1a0d4 docs(brainstorm): parte 00 — setup-monorepo`
- `525d725 docs(claude): perguntas de brainstorm pela ferramenta de perguntas`
- `a8897d6 chore: normalizar fim de linha com .gitattributes`
- `8ad1583 docs(claude): registros de acompanhamento técnico e geral por mudança`
- `7de0728 docs(acompanhamento): 0001 — início do repositório`
- `21637e8 chore(web): scaffold Vite + React + TS strict com ESLint, Prettier e Vitest`
- `215527b docs(acompanhamento): 0002 — scaffold-web`
- `b6c24f9 chore(api): scaffold FastAPI com uv, ruff e pytest`
- `911197c chore: scripts na raiz e comandos no README`
- `c057232 docs(acompanhamento): 0003 e 0004 — scaffold-api e scripts-raiz`
- Na `main`: `b8aa34d chore: estrutura inicial do projeto (docs, design e pastas)`

## Decisões tomadas por padrão (não bloqueantes)
- React 19.
- `.gitattributes` com LF.
- `package.json` na raiz sem workspaces e sem `concurrently`.
- ESLint flat config + Prettier (aspas simples, sem `;`, largura 100).
- Regras de import via `no-restricted-imports`.
- Alias `@/`.
- Vitest + jsdom.
- `pydantic-settings`.
- `.nvmrc` 24 e `.python-version` 3.12.
- Fontes ainda pelo Google Fonts do `tokens.css`.
- Sem CI.
- Também decidi sem perguntar:
  - `strict` e `noUncheckedIndexedAccess` explícitos;
  - `fastapi[standard]`;
  - `src/test-setup.ts`, já adicionado ao `arquitetura.md`.

## Fora do escopo / pendências
- React Router, Zustand e Dexie: entram nas partes que os usam (01/02).
- O formato de erro `{"error": …}` da API: entra na Parte 02.
- `npm audit`: 13 moderadas, só em dependências de dev (ESLint/minimatch); 0 em produção.
- Favicon: fica para a Parte 01.

## Desvios do design
- Nenhum. A tela é só um placeholder.

## Desvios do plano de commits
- O scaffold do front e as ferramentas (lint e testes) foram para um commit só, porque o `package.json` e o lockfile não se separam bem.
