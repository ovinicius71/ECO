# 0016 — Ajuste na correção de contrações (técnico)

Data: 2026-10-31 · Parte 10 · Branch `feat/10-resultado-progresso` · Geral: [0016](../geral/0016-ajustes-na-correcao.md)
Commits: `3137c4c`, `e84c17c`, `a9c28ae` (spec)

## Mudanças (`features/correction/`)
- `scoreLine.ts` → `detectJoins`: ignora pares de tokens da **mesma palavra original**, tanto na junção (`typ[*].word`) quanto na separação (`exp[*].word`). Antes, "We're" (tokens `we`, `are`) × "were" virava `split`, porque `we`+`are` = `weare` está a 1 edição de `were`.
- `types.ts`: `LanguageAdapter.bare?(word)` (opcional por idioma). `english.ts`: `bare` = `fold` → sem pontuação → sem `'`.
- `scoreLine.ts` → agregação por palavra: no tolerante, uma palavra expandida (> 1 token) com status `wrong`, cujo digitado tem a mesma forma `bare`, passa a `near`. A dica `contraction` já existia.
- Testes:
  - `scoreLine` "contração não vira junção/separação", que espera `near` + `contraction`;
  - `english.bare`.
- `docs/spec/correcao.md`: a regra nova, descrita no §3.

## Por que `near` e não `wrong`
- Sem a dica falsa, o alinhamento dava `wrong`: `were` está a 2 edições de `we` e de `are`, acima do limite de 1 para palavras curtas.
- O caso `ill` × `I'll` da spec (aprovado) é `near` por "apóstrofo faltando". Tratar `were` × `We're` igual mantém a coerência com "o tolerante ignora pontuação".

## Processo
- `3137c4c` entrou com o teste novo falhando: `npm run check > log; echo exit; grep … && git commit` (o `&&` dependia do `grep`).
- Agora: `npm run check > log; rc=$?; …; [ $rc -eq 0 ] && git commit`.

## Como verificar
- `npx vitest run src/features/correction`: 50 testes.
