# 0004 — Atalhos na raiz e instruções de uso (geral)

Data: 2026-10-31 · Parte 00 · Branch `chore/00-setup-monorepo` · Técnico: [0004](../tecnico/0004-scripts-raiz.md)

## Em uma frase
Da pasta raiz do projeto agora dá para instalar, rodar e testar tudo com poucos comandos, e o README explica como.

## O que mudou
- `npm run setup` instala tudo.
- `npm run dev:web` e `npm run dev:api` sobem o site e o servidor.
- `npm run check` roda todas as verificações dos dois lados.
- O README ganhou a seção "Como rodar".

## Por que
- Para você não precisar lembrar os comandos de cada app, e para existir um único comando que diz "está tudo certo para entregar".

## O que dá para ver ou testar agora
- Na raiz: `npm run check` → lint, tipos e testes (1 do site + 3 do servidor), tudo passando.

## Próximo passo
- Fechar a Parte 00 (relatório de entrega) e aguardar o seu push e o ok do merge.
