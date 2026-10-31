# 0001 — Início do repositório e regras de trabalho (técnico)

Data: 2026-10-31 · Parte 00 · Branch `chore/00-setup-monorepo` · Geral: [0001](../geral/0001-inicio-do-repositorio.md)
Commits: `b8aa34d`, `6f1a0d4`, `525d725`, `a8897d6`, `8ad1583`

## Mudanças
- `git init -b main` e o commit inicial com os docs, o design e a árvore de `.gitkeep` (`b8aa34d`).
- A branch `chore/00-setup-monorepo` foi criada a partir da `main`.
- `docs/brainstorm/00-setup-monorepo.md` criado. `docs/adr/0001-stack.md` passou para **aceita**. A Parte 00 ficou 🔵 no roadmap (`6f1a0d4`).
- `CLAUDE.md`, seção 3, passo 5: as perguntas bloqueantes vão pelo `AskUserQuestion` (`525d725`).
- `.gitattributes` com `* text=auto eol=lf` e binários marcados, mais `git add --renormalize .` (`a8897d6`).
- `CLAUDE.md`: nova subseção "Registros de acompanhamento", linha na tabela da seção 2 e os escopos `acompanhamento` e `claude`. `docs/arquitetura.md` ganhou `docs/acompanhamento/` na árvore (`8ad1583`).
- Esta pasta: `README.md` (linha do tempo e modelos) e a dupla 0001.

## Dependências e versões
- Nenhuma instalada ainda.
- Ambiente verificado: Git 2.55, Node 24.19, npm 11.17, Python 3.12.10. O **uv não está instalado** e o dono vai instalar.

## Decisões técnicas
- **ESLint + typescript-eslint + Prettier com TypeScript ~6.0**, e não o template atual do Vite (TS 7 + oxlint). O `typescript-eslint@8.72` declara o peer `typescript >=4.8.4 <6.1.0`. Decisão do dono, para manter o ADR 0001. Revisitar quando o typescript-eslint suportar o TS 7.
- **Fim de linha LF no repositório:** a máquina usa `core.autocrlf=true`, e sem o `.gitattributes` cada arquivo gerava aviso e diffs com CRLF/LF misturados.
- **Granularidade do acompanhamento:** por mudança lógica, não por commit (dono). A alternativa por commit geraria ruído em commits triviais.

## Como verificar
- `git log --oneline`
- `git check-attr -a CLAUDE.md` → `text: auto`, `eol: lf`

## Riscos e pendências
- A API (Parte 00) fica bloqueada até o `uv` ser instalado.
