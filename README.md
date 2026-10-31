# Eco エコ

Aprenda idiomas pelo que você ouve. Cole um link do YouTube, o Eco busca a letra sincronizada e você pratica:
- Digitar Junto
- Preencher
- Ditado
- Múltipla escolha
- Karaokê
- Assistir

Tudo fica salvo no navegador, sem login.

## Estrutura

- `apps/web`: front-end (React + Vite + TypeScript)
- `apps/api`: back-end (FastAPI + Python)
- `design/`: design aprovado (tokens, mapa de telas, artboards)
- `docs/`: roadmap, specs, brainstorms, entregas e ADRs

Os detalhes estão em [`docs/arquitetura.md`](docs/arquitetura.md).

## Como rodar

### Pré-requisitos

- Node 22+ (o `.nvmrc` aponta a 24) e npm
- Python 3.12 e [uv](https://docs.astral.sh/uv/) (`winget install astral-sh.uv`)

### Primeira vez

```sh
npm run setup        # npm ci no web + uv sync na api
cp apps/api/.env.example apps/api/.env   # opcional; os padrões já servem
```

### Desenvolvimento (um terminal para cada)

```sh
npm run dev:web      # http://localhost:5173
npm run dev:api      # http://localhost:8000/api/health  (docs em /docs)
```

### Qualidade (o que precisa passar antes de entregar)

| Comando na raiz | O que roda |
| --- | --- |
| `npm run check` | tudo abaixo, em sequência |
| `npm run lint` | ESLint + Prettier (web) e `ruff check` + `ruff format --check` (api) |
| `npm run typecheck` | `tsc -b` (web) |
| `npm run test` | Vitest (web) e pytest (api) |

Dentro de cada app também dá para rodar direto: `npm run lint|typecheck|test|format` em `apps/web`, e `uv run ruff check`, `uv run ruff format`, `uv run pytest` em `apps/api`.

## Fluxo de trabalho

O desenvolvimento é feito com o Claude Code, seguindo o [`CLAUDE.md`](CLAUDE.md):
- uma branch por parte do [`roadmap`](docs/roadmap.md);
- brainstorm antes de codar;
- o dono faz os pushes e autoriza cada merge.
