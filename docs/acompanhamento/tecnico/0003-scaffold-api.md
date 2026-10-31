# 0003 — Esqueleto do servidor (técnico)

Data: 2026-10-31 · Parte 00 · Branch `chore/00-setup-monorepo` · Geral: [0003](../geral/0003-scaffold-api.md)
Commits: `b6c24f9`

## Mudanças
- `apps/api/pyproject.toml`:
  - `requires-python >=3.12`;
  - dependências e grupo `dev` (PEP 735);
  - `[tool.uv] package = false` (é um app, não uma lib);
  - config do ruff e do pytest.
- `apps/api/.python-version` (3.12) e `uv.lock`.
- `app/config.py`: `Settings` (pydantic-settings, prefixo `ECO_`, lê `.env`) com os campos do `.env.example`, mais `get_settings()` com `lru_cache`.
- `app/main.py`: `create_app(settings)` (factory, para os testes injetarem config), com CORS restrito a `ECO_CORS_ORIGIN` e routers sob `/api`.
- `app/routers/health.py` + `app/schemas/health.py`: `GET /api/health` → `HealthResponse{ok, whisper}`.
- `tests/test_health.py`, com 3 testes:
  - o health padrão;
  - o health com o Whisper ligado;
  - o CORS liberando a origem do front e bloqueando outra.
- Os `__init__.py` foram criados em `app/`, `app/routers/` e `app/schemas/`, e os `.gitkeep` correspondentes removidos.

## Dependências e versões (travadas no `uv.lock`)
- `fastapi[standard]` 0.162.0 (traz `fastapi dev`, uvicorn 0.54 e starlette 1.10), `httpx` 0.28.1, `pydantic` 2.14.2, `pydantic-settings` 2.16.2.
- dev: `pytest` 9.2.0, `respx` 0.23.1, `ruff` 0.17.3.

## Decisões técnicas
- **`fastapi[standard]`**, para ter o `fastapi dev` (citado no modelo de entrega) sem configurar o uvicorn à mão.
- **`pydantic-settings`** para a config, em vez de `os.environ` solto: valida os tipos (ex.: `ECO_ENABLE_WHISPER=1` → `True`).
- **Factory `create_app`** + `dependency_overrides`: os testes não dependem do `.env` local (`_env_file=None`).
- **Regras do ruff:** `E, F, W, I, UP, B, SIM`, com `line-length` 100 (o mesmo do Prettier no front).
- **Formato de erro** `{"error": {code, message}}` da spec: fica para a Parte 02, quando surgirem os primeiros erros reais (`LYRICS_NOT_FOUND`).

## Como verificar
- `cd apps/api`, `uv sync` e depois `uv run ruff check && uv run ruff format --check && uv run pytest` → 3 testes passando.
- `uv run fastapi dev app/main.py` e depois `curl localhost:8000/api/health`. Testado na porta 8765 → `{"ok":true,"whisper":false}`.

## Riscos e pendências
- O `uv` foi instalado via winget, e o terminal aberto antes da instalação não o enxerga no PATH. Basta reabrir o terminal.
- O `.venv/` fica em `apps/api/.venv`, já ignorado no `.gitignore`.
