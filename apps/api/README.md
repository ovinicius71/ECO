# apps/api — FastAPI

O scaffold real (`pyproject.toml`, uv, ruff, pytest) é criado na **Parte 00**. As pastas abaixo já estão no lugar:

| Pasta | Conteúdo |
| --- | --- |
| `app/` | `main.py` (app, CORS, routers), `config.py` (settings via env) |
| `app/routers/` | Um arquivo por grupo de endpoints (`docs/spec/api.md`) |
| `app/services/` | Integrações e lógica: `youtube.py`, `title_guess.py`, `lrclib.py`, `lrc.py`, `cache.py`, `translator.py`, `dictionary.py`, `cefr.py`, `phonetics.py`, `whisper.py` |
| `app/schemas/` | Modelos Pydantic |
| `app/data/` | Listas de palavras e CMUdict (com `README.md` de fontes e licenças) |
| `tests/` | `test_*.py` e `fixtures/` (só letras inventadas) |
