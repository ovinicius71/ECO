# apps/web — React + Vite + TypeScript

O scaffold real (Vite, tsconfig, ESLint, Vitest) é criado na **Parte 00**. Ele deve manter as pastas abaixo, que já existem com `.gitkeep`. A árvore completa e as regras de import estão em `docs/arquitetura.md`.

| Pasta | Conteúdo |
| --- | --- |
| `src/app/` | `App.tsx`, `router.tsx`, providers |
| `src/styles/` | `tokens.css` (copiar de `design/tokens.css`), `global.css` |
| `src/components/` | Primitivos de UI (lista em `design/telas.md`) |
| `src/layout/` | `AppHeader`, `PracticeHeader`, `PlayerBar`, `KeyHintBar` |
| `src/pages/` | Uma pasta por rota |
| `src/features/` | Lógica por domínio + testes |
| `src/lib/` | `api/` (cliente), `db/` (Dexie), `utils/` |
| `src/store/` | Stores Zustand |
| `src/types/` | Tipos globais |
