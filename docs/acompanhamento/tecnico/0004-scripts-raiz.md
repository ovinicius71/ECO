# 0004 — Atalhos na raiz e instruções de uso (técnico)

Data: 2026-10-31 · Parte 00 · Branch `chore/00-setup-monorepo` · Geral: [0004](../geral/0004-scripts-raiz.md)
Commits: `911197c`

## Mudanças
- `package.json` na raiz, **sem dependências e sem workspaces**. Só scripts delegando aos apps:
  - instalação e execução: `setup`, `dev:web`, `dev:api`;
  - verificações: `lint` (`lint:web` + `lint:api`), `typecheck`, `test` (`test:web` + `test:api`) e `check`.
- `README.md`: a seção "Como rodar" tem pré-requisitos, primeira vez, desenvolvimento e a tabela de comandos de qualidade.

## Dependências e versões
- Nenhuma.

## Decisões técnicas
- **`npm --prefix` / `uv --directory`** em vez de `cd ... &&`: funciona igual no PowerShell, no cmd e no Git Bash.
- **`lint:web` inclui o `format:check`** (Prettier), e o `lint:api` inclui o `ruff format --check`. Assim o `npm run lint` cobre a formatação nos dois lados, como pede a seção 6 do CLAUDE.md.
- **Sem `concurrently`** para subir os dois apps juntos (brainstorm 00, NB3). Por enquanto, um terminal para cada.

## Como verificar
- Na raiz: `npm run check` → ESLint/Prettier ok, ruff ok, `tsc -b` ok, Vitest 1/1, pytest 3/3.

## Riscos e pendências
- O `npm run setup` usa `npm ci`, que exige o `package-lock.json` em dia (já está commitado).
