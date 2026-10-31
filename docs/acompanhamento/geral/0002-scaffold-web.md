# 0002 — Esqueleto do site (geral)

Data: 2026-10-31 · Parte 00 · Branch `chore/00-setup-monorepo` · Técnico: [0002](../tecnico/0002-scaffold-web.md)

## Em uma frase
O site (`apps/web`) já abre no navegador e tem as verificações automáticas de qualidade funcionando.

## O que mudou
- Criamos a base do site com React. Por enquanto ele mostra só uma tela "ECO エコ — EM CONSTRUÇÃO", já com o papel bege pontilhado do design.
- Quatro verificações automáticas estão prontas e passando:
  - estilo do código (lint);
  - tipos;
  - formatação;
  - testes.
- O lint também barra imports que desrespeitam a organização de pastas combinada (ex.: um componente visual importando regra de negócio).

## Por que
- Toda tela e toda lógica das próximas partes vão se apoiar nessa base. Deixar as verificações prontas desde já evita que erros se acumulem.

## O que dá para ver ou testar agora
- `cd apps/web`, `npm install` e depois `npm run dev`. Abra http://localhost:5173.
- `npm run test` → 1 teste passando.

## Próximo passo
- O esqueleto do servidor (`apps/api`), que depende do `uv`.
