# Brainstorm — Parte 00: Setup do monorepo

Branch: `chore/00-setup-monorepo` · Base: `main`
Data: 2026-10-31

## Contexto
Criar o esqueleto que roda e passa nos checks: `apps/web` (Vite + React + TS), `apps/api` (FastAPI + uv), lint, format, typecheck, testes e scripts. Ainda sem telas nem regra de negócio, só um `GET /api/health` e uma página mínima. Os comandos ficam documentados no `README.md`. Ver `docs/adr/0001-stack.md` e `docs/arquitetura.md`.

## Já decidido
- Árvore de pastas de `docs/arquitetura.md`, que já existe com `.gitkeep`.
- Comandos-meta da seção 6 do CLAUDE.md: `npm run lint|typecheck|test`, `ruff check`, `ruff format --check`, `pytest`.
- Testes sem rede real.

## Perguntas bloqueantes (preciso da resposta antes de codar)
1. **(A) Confirmamos a stack do ADR 0001?**
   - A) Manter: React + Vite + TS strict, Zustand, Dexie, CSS Modules / FastAPI + uv, httpx, pytest + respx, ruff
   - B) Ajustar
   - Recomendação: A
2. **(B) Gerenciador de pacotes do front?**
   - A) npm — já instalado, e o `settings.json` já libera `npm run *`
   - B) pnpm — precisa instalar
   - Recomendação: A
3. **O uv não está instalado na máquina (o Python 3.12.10 está). Como resolvemos?**
   - A) O dono instala o uv
   - B) O Claude instala via `pip install --user uv`
   - C) Sem uv: pip + venv (muda o ADR)
   - Recomendação: A

## Perguntas não bloqueantes (sigo a recomendação se não houver resposta)
1. **Versão do React?** Recomendação: a 19 estável atual (o ADR pede "18+").
2. **Fim de linha?** Recomendação: um `.gitattributes` com `* text=auto eol=lf`. O Git no Windows está com `autocrlf=true`, e sem isso os diffs ficam sujos.
3. **Scripts na raiz?** Recomendação: um `package.json` na raiz, sem workspaces e sem dependências, com `dev:web`, `dev:api`, `lint`, `typecheck`, `test` e `check` delegando para cada app. Sem `concurrently` por enquanto.
4. **Lint/format do front?** Recomendação: ESLint flat config (typescript-eslint, react-hooks, react-refresh) + Prettier, com `eslint-config-prettier`.
5. **Regras de import da arquitetura?** Recomendação: aplicar já com `no-restricted-imports` (`features/` e `components/` não importam `pages/`; `components/` não importa `features/`).
6. **Alias de import?** Recomendação: `@/` → `apps/web/src`.
7. **Testes do front?** Recomendação: Vitest + jsdom + Testing Library, com um teste de fumaça do `App`.
8. **Settings da API?** Recomendação: `pydantic-settings` lendo as variáveis `ECO_*` do `.env.example`.
9. **Versões fixadas?** Recomendação: `.nvmrc` com 24 e `.python-version` com 3.12; `requires-python = ">=3.12"`.
10. **Fontes?** Recomendação: manter por enquanto o `@import` do Google Fonts que já está no `tokens.css`. A decisão sobre fontes locais fica para a Parte 01.
11. **CI (GitHub Actions)?** Recomendação: fora do escopo desta parte.

## Riscos e o que pode dar errado
- Windows + Git Bash: caminhos e fins de linha. Mitigação: `.gitattributes` e scripts sem sintaxe de shell específica.
- Versões novas do ESLint/Vite podem mudar a configuração padrão. Mitigação: seguir o template oficial do Vite.

## Plano de commits
1. `docs(brainstorm): parte 00 — setup-monorepo`
2. `docs(claude): perguntas de brainstorm pela ferramenta de perguntas`
3. `chore: normalizar fim de linha com .gitattributes`
4. `chore(web): scaffold Vite + React + TypeScript strict`
5. `chore(web): ESLint, Prettier e Vitest`
6. `chore(api): scaffold FastAPI com uv, ruff e pytest`
7. `chore: scripts na raiz e comandos no README`
8. `docs(entrega): parte 00 — setup-monorepo`

## Decisões (preenchido depois das respostas)
- P1 (A) → manter o ADR 0001; o ADR passa para "aceita" (dono, 2026-10-31)
- P2 (B) → npm (dono, 2026-10-31)
- P3 (uv) → o dono instala o uv (dono, 2026-10-31)
- Extra → perguntas de brainstorm sempre pela ferramenta de perguntas; CLAUDE.md atualizado (dono, 2026-10-31)
- NB1–NB11 → decididos por padrão
