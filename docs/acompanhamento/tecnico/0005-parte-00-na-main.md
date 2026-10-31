# 0005 — Parte 00 na main e GitHub configurado (técnico)

Data: 2026-10-31 · Parte 00 · Branch `main` · Geral: [0005](../geral/0005-parte-00-na-main.md)

## Mudanças
- O dono rodou `git branch -M main` com a `chore/00-setup-monorepo` em checkout. O reflog registra: `renamed refs/heads/chore/00-setup-monorepo to refs/heads/main`.
  - A `main` antiga (`b8aa34d`) foi sobrescrita sem perda, porque era ancestral.
  - A branch `chore/00-setup-monorepo` deixou de existir.
  - Resultado equivalente a um fast-forward, **sem o commit `merge: parte 00`** do fluxo `--no-ff`.
- O dono aceitou o resultado como merge da Parte 00. O roadmap foi para ✅ e a entrega teve o status atualizado.
- Remote: `origin → https://github.com/ovinicius71/ECO.git`, que já existia. O `git ls-remote origin` responde vazio, ou seja, o repositório remoto está vazio.

## Dependências e versões
- Nenhuma.

## Decisões técnicas
- Não restaurei a branch nem reposicionei a `main` (decisão do dono). A alternativa descartada era recriar a `chore/00-setup-monorepo` em `75dae4a` e voltar a `main` para `b8aa34d`.

## Como verificar
- `git remote -v`
- `git log --oneline` mostra os commits da Parte 00 direto na `main`.

## Riscos e pendências
- O histórico da Parte 00 não tem commit de merge. As próximas partes seguem o fluxo normal: uma branch a partir da `main` e `merge --no-ff` só com autorização.
- O push fica com o dono: `git push -u origin main`.
