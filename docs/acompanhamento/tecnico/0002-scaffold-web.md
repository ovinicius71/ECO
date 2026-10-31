# 0002 — Esqueleto do site (técnico)

Data: 2026-10-31 · Parte 00 · Branch `chore/00-setup-monorepo` · Geral: [0002](../geral/0002-scaffold-web.md)
Commits: `21637e8`

## Mudanças
- `apps/web/`:
  - `package.json` (`@eco/web`) com os scripts `dev`, `build`, `preview`, `typecheck` (`tsc -b`), `lint`, `format`, `format:check`, `test` e `test:watch`;
  - `index.html` com `lang="pt-BR"`;
  - `tsconfig.json` com referências para `tsconfig.app.json` e `tsconfig.node.json`;
  - `vite.config.ts` com o alias `@` → `src` e a config do Vitest (jsdom, `src/test-setup.ts`);
  - `eslint.config.js` (flat config), `.prettierrc.json` e `.prettierignore`.
- `src/main.tsx` importa `styles/tokens.css` e `styles/global.css` e monta o `app/App.tsx`.
- `src/styles/global.css`: box-sizing, papel pontilhado, fonte e cor via tokens, e foco de 2px em `--eco-focus`.
- `src/app/App.tsx` + `App.module.css`: placeholder "ECO エコ / EM CONSTRUÇÃO". `App.test.tsx`: teste de fumaça.
- `src/test-setup.ts`: jest-dom e `cleanup` depois de cada teste. **Lugar novo**, fora da árvore do `arquitetura.md`.
- `.nvmrc` com 24 na raiz.
- `apps/web/README.md` foi só reformatado pelo Prettier (tabela).

## Dependências e versões
- Dependências: `react` e `react-dom` ^19.3.1.
- Ferramentas de dev:
  - build e tipos: `vite` ^8.3.5, `@vitejs/plugin-react` ^6.1.2, `typescript` ~6.0.3, `@types/react` e `@types/react-dom` ^19.3, `@types/node` ^24;
  - lint e formatação: `eslint` ^10.14, `@eslint/js` ^10, `typescript-eslint` ^8.72.1, `eslint-plugin-react-hooks` ^7.1.1, `eslint-plugin-react-refresh` ^0.5.7, `eslint-config-prettier` ^10.1.8, `globals` ^17, `prettier` ^3.9.10;
  - testes: `vitest` ^5.0.5, `jsdom` ^30, `@testing-library/react` ^16.3.3, `@testing-library/jest-dom` ^6, `@testing-library/user-event` ^14.
- React Router, Zustand e Dexie **ainda não foram instalados**. Cada um entra na parte que o usa pela primeira vez (01/02).

## Decisões técnicas
- **TypeScript ~6.0** em vez do 7 do template do Vite, porque o `typescript-eslint` exige `<6.1` (dono, brainstorm 00, Extra 2).
- **`strict` explícito** e mais `noUncheckedIndexedAccess`, útil para os arrays de versos e tokens que vêm a seguir.
- **Regras de import** com `no-restricted-imports`:
  - `features/` não importa `pages/`;
  - `components/` não importa `pages/` nem `features/`.
  - Testado com um arquivo temporário, que deu 2 erros como esperado.
  - A regra "funções puras não importam React" não é automatizável de forma simples e fica na revisão.
- **Prettier:** aspas simples, sem ponto e vírgula (o estilo do template) e `printWidth` 100. O `tokens.css` é ignorado para continuar idêntico a `design/tokens.css`.
- **Sem favicon** por enquanto, porque o do template é o logo do Vite. Fica para a Parte 01.
- **Um commit só** para scaffold, lint e testes, em vez dos dois do plano: o `package.json` e o lockfile não se separam de forma limpa.

## Como verificar
- `cd apps/web`, `npm ci` e depois `npm run typecheck && npm run lint && npm run format:check && npm run test && npm run build`. Tudo passa: 1 teste, build de ~220 kB de JS (69 kB gzip).

## Riscos e pendências
- `npm audit`: 13 vulnerabilidades **moderadas, só em dependências de dev** (`minimatch` dentro da cadeia do ESLint/typescript-eslint). Em produção (`npm audit --omit=dev`), 0. Não usei `audit fix --force`, porque ele quebraria versões. Reavaliar quando houver atualização.
- Quando o `typescript-eslint` aceitar o TS 7, vale reavaliar a migração.
